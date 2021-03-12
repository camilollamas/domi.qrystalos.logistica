<!-- eslint-disable -->
<template>
  <!-- <div class="q-pa-md"> -->
  <div class="">
    <q-table
      v-if="columns.length"
      :title="titulo || tabla"
      :data="data"
      :columns="columns"
      :row-key="row_key"
      :pagination.sync="pagination"
      :loading="loading"
      :filter="filter"
      @request="onRequest"
      binary-state-sort
      :dense="dense"
      ref="datatable"
    >
      <!-- @row-click="select_row" -->
      <!-- selection="single"
      :selected.sync="selected"-->

      <template v-slot:top-right>
        <slot name="botones_superiores"></slot>
        <q-btn
          color="primary"
          icon-right="archive"
          label="Exportar a csv"
          no-caps
          @click="exportTable"
          v-if="permiteExportar"
        />
        <q-btn
          v-if="listeners.onAdd"
          round
          size="sm"
          color="primary"
          icon="add"
          @click="
            $emit('onAdd')
            dialog_formulario = true
          "
        />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <q-input
          clearable
          outlined
          dense
          debounce="300"
          v-model="filter"
          lazy
          :placeholder="$t('inputs.search_label')"
          v-if="!sinBuscador"
          :color="color?color:'primary'"
        >
          <template v-slot:append>
            <q-icon
              name="search"
              style="cursor: pointer"
              @click="obligarRefrescar"
            />
          </template>
        </q-input>
      </template>

      <!-- <template v-slot:body="props">
        <q-tr :props="props" >
          <q-td :class="(selected==item)?'text-bold':''" @click="select_row(props.item)" style="cursor: pointer" :props="props" v-for="(item, index) in props.row" :key="index">{{ item }}</q-td>
        </q-tr>
      </template> -->
       <template v-slot:body="props">
        <q-tr :props="props" :key="getUid()">
          <!-- <q-td auto-width>
            <q-toggle v-model="props.expand" checked-icon="add" unchecked-icon="remove" :label="`Index: ${props.row.index}`" />
          </q-td> -->


          <q-td
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            <q-btn :color="col.boton.color || 'primary'" :size="col.boton.size || 'xs'" :icon="col.boton.icon" :label="col.boton.label" @click="$emit(col.boton.emit, props.row)" :round="!col.boton.label" :flat="col.boton.flat" v-if="col.boton">
            <q-tooltip v-if="col.boton.tooltipText" 
                       :content-class="col.boton.tooltipClass || 'bg-blue-6' " 
                       :offset="[10, -30]" 
                       self="bottom middle">
              {{col.boton.tooltipText}}
            </q-tooltip>
            </q-btn>
            <span v-else class="cursor-pointer" @click="select_row(this,props.row)">{{ col.value }}</span>
          </q-td>
        </q-tr>
      </template>

    </q-table>
    <q-dialog
      v-model="dialog_formulario"
      persistent
      transition-show="scale"
      transition-hide="scale"
      full-width
    >
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section class="bg-primary">
          <div class="text-h6 text-white">
            Formulario de {{ titulo || tabla }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="scroll">
          <slot name="formulario"></slot>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <slot name="botones_formulario"></slot>
          <q-btn
            :label="$t('button.cancel')"
            @click="selected = [];$emit('onCancelForm')"
            v-close-popup
          />
          <q-btn
            v-show="!sinBotonBorrar"
            v-if="listeners.onDelete || listeners.onConfirmDelete"
            :label="$t('button.delete')"
            @click="dialog_confirmDelete = true"
            color="negative"
          />
          <q-btn
            :label="$t('button.ok')"
            @click="onConfirmForm"
            color="primary"
            :disabled="!confirmEnabled"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="dialog_confirmDelete"
      persistent
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card class="bg-negative text-white" style="width: 300px">
        <q-card-section>
          <div class="text-h6">{{ $t('form.delete_title') }}</div>
        </q-card-section>

        <q-card-section>{{ $t('form.delete_body') }}</q-card-section>

        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn flat :label="$t('button.no')" v-close-popup />
          <q-btn
            color="negative"
            :label="$t('button.yes')"
            v-close-popup
            @click="onDelete"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { uid, exportFile } from 'quasar'
import { mapActions } from 'vuex'
function wrapCsvValue (val, formatFn) {
  // eslint-disable-next-line
  let formatted = formatFn !== void 0
    ? formatFn(val)
    : val
  // eslint-disable-next-line
  formatted = formatted === void 0 || formatted === null
    ? ''
    : String(formatted)

  formatted = formatted.split('"').join('""')
  /**
   * Excel accepts \n and \r in strings, but some other CSV parsers do not
   * Uncomment the next two lines to escape new lines
   */
  // .split('\n').join('\\n')
  // .split('\r').join('\\r')

  return `"${formatted}"`
}
export default {
  props: {
    titulo: {
      type: String
    },
    tabla: {
      type: String,
      required: true
    },
    columnas: {
      type: Array,
      required: true
    },
    row_key: {
      type: String,
      required: true
    },
    inner_join: {
      type: String
    },
    columnas_visibles: {
      type: String
    },
    condicion_adicional: {
      type: String
    },
    ordenarPor: {
      type: String
    },
    confirmEnabled: {
      type: Boolean
    },
    dense: {
      type: Boolean
    },
    columnas_filtro: {
      type: String
    },
    filtro_personalizado: {
      type: String
    },
    sinBotonBorrar: {
      type: Boolean
    },
    rowsPerPage: {
      type: Number
    },
    permiteExportar: {
      type: Boolean
    },
    sinBuscador: {
      type: Boolean
    },
    color: {
      type: String
    }
  },
  data () {
    return {
      dialog_confirmDelete: false,
      dialog_formulario: false,
      selected: null,
      filter: '',
      loading: false,
      pagination: {
        sortBy: undefined,
        descending: false,
        page: 1,
        rowsPerPage: 15,
        rowsNumber: 10
      },
      data: []
    }
  },
  mounted () {
    setTimeout(() => {
      if (this.rowsPerPage) {
        this.pagination.rowsPerPage = this.rowsPerPage
      }
      this.onRequest()
    }, 200)
  },
  methods: {
    ...mapActions('app', ['read']),

    obligarRefrescar () {
      this.onRequest()
    },

    onRequest (props) {
      if (props === undefined) {
        props = {
          pagination: this.pagination,
          filter: this.filter
        }
      }
      const {
        page,
        rowsPerPage,
        // rowsNumber,
        sortBy,
        descending
      } = props.pagination
      const filter = props.filter

      // get all rows if "All" (0) is selected
      // let fetchCount = rowsPerPage === 0 ? rowsNumber : rowsPerPage;

      // calculate starting row of data
      // let startRow = (page - 1) * rowsPerPage;

      this.loading = true

      var ordenarPor = sortBy ? sortBy + (descending ? ' DESC' : '') : undefined
      if (!ordenarPor && this.ordenarPor) {
        ordenarPor = this.ordenarPor
      }
      const parametros = {
        Tabla: this.tabla,
        NumPagina: page,
        TamPagina: rowsPerPage <= 0 ? 10000 : rowsPerPage,
        StringABuscar: filter ? filter.replace(/Ñ/g, '_').replace(/ñ/g, '_') : null,
        OrdenarPor: ordenarPor,
        InnerJoin: this.inner_join,
        ColumnasVisibles: this.columnas_visibles,
        CondicionAdicional: this.condicion_adicional,
        ColumnasFiltro: this.columnas_filtro
      }
      this.read(parametros)
        .then(res => {
          var filas = res.data.result.recordset
          var output = res.data.result.output
          this.data = filas

          // update rowsCount with appropriate value
          this.pagination.rowsNumber = output ? output.TotalRegistros : 0

          // don't forget to update local pagination object
          this.pagination.page = page
          this.pagination.rowsPerPage = rowsPerPage
          this.pagination.sortBy = sortBy
          this.pagination.descending = descending
        })
        .catch(err => {
          /* eslint no-console: ["error", { allow: ["warn", "error"] }] */
          console.error(err)
        })
        .then(() => {
          this.loading = false
        })
    },

    onConfirmForm () {
      this.$emit('onConfirmForm')
    },

    onDelete () {
      this.$emit('onConfirmDelete')
    },

    onReset () {
      this.selected = []
      this.dialog_formulario = false
    },

    onClearSelection () {
      this.$refs.datatable.clearSelection()
    },

    select_row (evt, row) {
      this.selected = row
      this.$emit('fila', row)
    },

    getUid () {
      return uid()
    },

    exportTable () {
      // naive encoding to csv format
      const content = [this.columns.map(col => wrapCsvValue(col.label))].concat(
        this.data.map(row => this.columns.map(col => wrapCsvValue(
          typeof col.field === 'function'
            ? col.field(row)
            // eslint-disable-next-line
            : row[col.field === void 0 ? col.name : col.field],
          col.format
        )).join(','))
      ).join('\r\n')

      const status = exportFile(
        'table-export.csv',
        content,
        'text/csv'
      )

      if (status !== true) {
        this.$q.notify({
          message: 'Browser denied file download...',
          color: 'negative',
          icon: 'warning'
        })
      }
    }
  },
  computed: {
    columns () {
      return this.columnas || []
    },

    listeners () {
      return this.$listeners
    }
  },
  watch: {
    // selected (val) {
    //   this.$emit('fila', val)
    // }
  }
}
</script>
