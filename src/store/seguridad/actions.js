import Vue from 'vue'
export function ingresar (context, data) {
  return Vue.prototype.$axios.post('ususu/ingresar', data)
}
export function verificar (context, data) {
  return Vue.prototype.$axios.get(
    `ususu/verificar/${data.compania}/${data.usuario}`
  )
}
export function configurar (context, data) {
  return Vue.prototype.$axios.post('ususu/configurar', data)
}
