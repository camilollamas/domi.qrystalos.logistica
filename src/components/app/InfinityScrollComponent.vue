<template>
  <div>
    <q-infinite-scroll @load="onLoad" :offset="250">
      <q-list bordered class="rounded-borders" >
        <q-item>
          <q-item-section>
            <q-input v-model="filterText" type="text" :label="title" debounce="300" :loading="loading" clearable />
          </q-item-section>
        </q-item>
        <q-item  v-for="(item, index) in items" :key="index" :class="index%2>0?'bg-grey-2':''">
          <q-item-section top>
            <q-item-label lines="1">
              <span class="text-weight-medium">{{item[label]}}</span>
            </q-item-label>
            <q-item-label caption lines="1">
              {{item[sublabel]}}
            </q-item-label>
          </q-item-section>

          <q-item-section top side>
            <div class="text-grey-8 q-gutter-xs">
              <q-btn class="gt-xs" size="12px" flat dense round icon="done" @click="onSelect(item)"/>
            </div>
          </q-item-section>
        </q-item>
        <q-item clickable class="bg-grey-4" @click="onLoad(pagina_actual)" v-show="!loading">
          <q-item-section>
            <q-item-label>Cargar más...</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <!-- <div v-for="(item, index) in items" :key="index" class="caption">
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum repellendus sit voluptate voluptas eveniet porro. Rerum blanditiis perferendis totam, ea at omnis vel numquam exercitationem aut, natus minima, porro labore.</p>
      </div> -->
      <template v-slot:loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </template>
    </q-infinite-scroll>
  </div>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    sublabel: {
      type: String,
      required: true
    },
    tabla: {
      type: String,
      required: true
    },
    ordenarPor: {
      type: String
    },
    innerJoin: {
      type: String
    },
    columnasVisibles: {
      type: String
    },
    condicionAdicional: {
      type: String
    },
    columnasFiltro: {
      type: String
    }
  },
  data () {
    return {
      items: [],
      filterText: null,
      loading: false,
      pagina_actual: 1,
      selected: []
    }
  },

  methods: {
    onLoad (index, done) {
      this.pagina_actual = index
      const parametros = {
        Tabla: this.tabla,
        NumPagina: index,
        TamPagina: 7,
        StringABuscar: this.filterText ? this.filterText.replace(/Ñ/g, '_').replace(/ñ/g, '_') : null,
        OrdenarPor: this.ordenarPor,
        InnerJoin: this.innerJoin,
        ColumnasVisibles: this.columnasVisibles,
        CondicionAdicional: this.condicionAdicional,
        ColumnasFiltro: this.columnasFiltro
      }
      if (index === 1) {
        this.items = []
      }
      this.loading = true
      this.$store
        .dispatch('app/read', parametros)
        .then(res => {
          this.loading = false
          res.data.result.recordset.forEach(el => {
            this.items.push(el)
          })
          if (done) {
            done()
          }
        }).catch(() => {
          this.loading = false
        })
    },
    onSelect (item) {
      this.$emit('fila', item)
      // if (this.selected.filter(x => x === item).length > 0) {
      //   this.selected = this.selected.filter(x => x !== item)
      // } else {
      //   this.selected.push(item)
      // }
      this.items = this.items.filter(x => x !== item)
      if (this.items.length <= 0) {
        this.onLoad(this.pagina_actual)
      }
    }
  },

  watch: {
    filterText (val) {
      // console.log(val)
      this.onLoad(1, () => {})
    }
  }
}
</script>
