<template>
  <q-select
    filled
    v-model="model"
    clearable
    use-input
    hide-selected
    fill-input
    :hint="hint"
    input-debounce="0"
    :label="label"
    :options="options"
    @filter="filterFnAutoselect"
    @filter-abort="abortFilterFn"
    :dense="dense"
    :option-value="option_value"
    :option-label="option_label"
    ref="select"
    :rules="[val => val || !required || $t('form.required_option')]"
    v-if="!refresh"
    :loading="refreshing"
  >
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey">
          {{ $t('autocomplete.no_results') }}
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
        <q-item-section>
          <q-item-label v-html="scope.opt[option_label]" />
          <q-item-label caption v-if="sublabel">{{ scope.opt[sublabel] }}</q-item-label>
          <q-item-label caption v-else>{{ scope.opt[option_value] }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>
<script>
import { mapActions } from 'vuex'
export default {
  props: {
    table: {
      type: String,
      required: true
    },
    columns: {
      type: String
    },
    columns_filter: {
      type: String
    },
    sublabel: {
      type: String
    },
    option_value: {
      type: String,
      required: true
    },
    option_label: {
      type: String,
      required: true
    },
    order_by: {
      type: String,
      required: true
    },
    where: {
      type: String
      // required: true
    },
    inner_join: {
      type: String
      // required: true
    },
    label: {
      type: String
    },
    hint: {
      type: String
    },
    required: {
      type: Boolean
    },
    emitall: {
      type: Boolean
    },
    dense: {
      Boolean
    }
  },
  data () {
    return {
      model: null,
      options: [],
      refresh: false,
      refreshing: false
      // options: [{ CODIGO: "", DESCRIPCION: "" }],
    }
  },

  methods: {
    ...mapActions('app', ['read']),
    filterFnAutoselect (val, update /*, abort */) {
      // call abort() at any time if you can't retrieve data somehow
      setTimeout(() => {
        update(
          () => {
            const parametros = {
              Tabla: this.table,
              NumPagina: 1,
              TamPagina: 1000,
              StringABuscar: val ? val.replace(/Ñ/g, '_').replace(/ñ/g, '_') : null,
              OrdenarPor: this.order_by,
              InnerJoin: this.inner_join,
              ColumnasVisibles: this.columns
                ? this.columns
                : `${this.option_value},${this.option_label}`,
              CondicionAdicional: this.where,
              ColumnasFiltro: this.columns_filter
                ? this.columns_filter
                : `${this.option_value},${this.option_label}`
            }
            if (val === '') {
              parametros.TamPagina = 50
            }

            this.read(parametros)
              .then(res => {
                this.options = res.data.result.recordset
              })
              .then(() => {
                // this.loading = false;
              })
          },

          // next function is available in Quasar v1.7.4+;
          // "ref" is the Vue reference to the QSelect
          ref => {
            if (
              val !== '' &&
              ref.options.length > 0 &&
              ref.optionIndex === -1
            ) {
              ref.moveOptionSelection(1, true) // focus the first selectable option and do not update the input-value
              ref.toggleOption(ref.options[ref.optionIndex], true) // toggle the focused option
            }
          }
        )
      }, 300)
    },

    abortFilterFn () {
      // console.log('delayed filter aborted')
    },

    requerido (val) {
      // simulating a delay

      return new Promise((resolve /*, reject */) => {
        setTimeout(() => {
          if (!this.required) {
            resolve(true)
          } else {
            resolve(val || this.$t('form.required_option'))
          }
        }, 1000)
      })
    },

    setModelo (val) {
      if (!val) return
      const parametros = {
        Tabla: this.table,
        NumPagina: 1,
        TamPagina: 1,
        StringABuscar: val,
        InnerJoin: this.inner_join,
        ColumnasVisibles: this.columns
          ? this.columns
          : `${this.option_value},${this.option_label}`,
        CondicionAdicional: this.where,
        ColumnasFiltro: this.columns_filter
          ? this.columns_filter
          : `${this.option_value},${this.option_label}`
      }
      this.refreshing = true
      this.read(parametros)
        .then(res => {
          this.refresh = true
          res.data.result.recordset.forEach(el => {
            this.model = {
              value: el[this.option_value],
              label: el[this.option_label],
              [this.option_value]: el[this.option_value],
              [this.option_label]: el[this.option_label]
            }
            this.refreshing = false
          })
          setTimeout(() => {
            this.refreshing = false
            this.refresh = false
          }, 10)
          // this.options = res.data.result.recordset
        })
    },

    clear () {
      this.model = null
      this.refresh = true
      setTimeout(() => {
        this.refresh = false
      }, 10)
    },

    focus () {
      this.$refs.select.focus()
    }
  },

  watch: {
    model (val) {
      if (!val) {
        this.$emit('model', null)
      } else {
        if (this.emitall) {
          this.$emit('model', val)
        } else {
          this.$emit('model', val[this.option_value])
        }
      }
    }
  }
}
</script>
