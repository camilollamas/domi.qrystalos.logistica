import Vue from 'vue'
import VueRouter from 'vue-router'

import routes from './routes'

Vue.use(VueRouter)

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation
 */

export default function ({ store /*, ssrContext */ }) {
  const Router = new VueRouter({
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes,

    // Leave these as is and change from quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  })

  Router.beforeEach((to, from, next) => {
    // console.log(from);
    // console.log(to);
    // #region Actualizando las rutas actuales
    var routeNames = []
    to.matched.forEach(route => {
      // console.log(route.name)
      if (route.name !== '') {
        routeNames.push(route.name)
      }
    })
    // store.dispatch('setCurrentRoutes', routeNames)
    // #endregion

    var isLogged =
      store.state.auth.usuario != null && store.state.auth.usuario !== undefined

    if (!isLogged) {
      setTimeout(() => {
        const requiresAuth = to.matched.some(
          record => record.meta.requiresAuth
        )
        isLogged =
          store.state.auth.usuario !== null &&
          store.state.auth.usuario !== undefined
        if (requiresAuth && !isLogged) {
          store.commit('auth/setLogout', true, { root: true })
          if (from.name !== 'ingresar') {
            next({ name: 'ingresar' })
          }
        } else {
          next(true)
        }
      }, 200)
    } else {
      const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
      isLogged =
        store.state.auth.usuario !== null &&
        store.state.auth.usuario !== undefined
      if (requiresAuth && !isLogged) {
        next({ name: 'ingresar' })
      } else {
        next(true)
      }
    }

    // next(true);
  })

  Vue.prototype.$router_ = Router

  return Router
}
