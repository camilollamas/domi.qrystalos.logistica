import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersist from 'vuex-persist'
import localforage from 'localforage'

import seguridad from './seguridad'
import app from './app'
// import configuracion from './configuracion'

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

localforage.config({
  driver: localforage.INDEXEDDB,
  name: 'QrystalosAPP',
  version: 1.0,
  storeName: 'Qrystalos'
})
const vuexPersistEmitter = () => {
  return store => {
    store.subscribe(mutation => {
      if (mutation.type === 'RESTORE_MUTATION') {
        store._vm.$root.$emit('storageReady')
      }
    })
  }
}
const vuexLocal = new VuexPersist({
  storage: localforage,
  strictMode: true,
  asyncStorage: true,
  key: 'Qryst@l0s_app'
})

export default function ({ ssrContext }) {
  const Store = new Vuex.Store({
    mutations: {
      RESTORE_MUTATION: vuexLocal.RESTORE_MUTATION
    },
    plugins: [vuexLocal.plugin, vuexPersistEmitter()],
    modules: {
      app,
      // kasis,
      auth: seguridad
    },

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEV
  })
  if (ssrContext) {
    Store.commit('auth/setUsuario', ssrContext.req.session.usuario)
  }
  Vue.prototype.$store = Store

  return Store
}
