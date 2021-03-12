/* eslint-disable no-console */
import axios from 'axios'
import join from 'url-join'
import Vue from 'vue'
import { Notify } from 'quasar'

// #region interceptar las Respuestas
axios.interceptors.response.use(
  response => {
    // Your Interceptor code to do something with the response data
    // Return response data
    if (response && response.data && response.data.logout === true) {
      Vue.prototype.$store.commit('auth/setLogout', true, { root: true })
      Vue.prototype.$router_.push({ name: 'ingresar' })
    }
    if (response && response.data && response.data.jwt) {
      Vue.prototype.$store.commit('auth/setJWT', response.data.jwt)
    }

    return response
  },
  error => {
    // Your Interceptor code to do something with response error
    // #region Error
    if (error.response) {
      if (error.response.status === 401) {
        Notify.create({
          color: 'info',
          icon: 'info',
          message: 'Session expired',
          position: 'top-right',
          textColor: 'white',
          actions: [{ icon: 'close', color: 'white' }],
          timeout: 60000
        })
      } else if (error.response.status === 404) {
        Notify.create({
          color: 'negative',
          icon: 'error',
          message: `El servidor web responsable de aceptar las peticiones a la URL (${error.response.config.url}) no está en funcionamiento o hay problemas de conexión ó la URL se enlazó de forma incorrecta`,
          position: 'top-right',
          textColor: 'white',
          actions: [{ icon: 'close', color: 'white' }],
          timeout: 60000
        })
      } else if (error.response.status === 500) {
        console.log('error.response: ', error.response)
        var errorCode = null
        try {
          if (!errorCode && error.response.data.originalError.code) {
            errorCode = error.response.data.originalError.code
          }
          if (!errorCode && error.response.status) {
            errorCode = error.response.status
          }
          if (!errorCode && error.response.data.error.code) {
            errorCode = error.response.data.error.code
          }
          if (!errorCode && error.response.data.error.code) {
            errorCode = 500
          }
        } catch (ex) {
          errorCode = 500
        }
        var errorMessage = null
        try {
          if (
            error.response &&
            error.response.data &&
            error.response.data.error &&
            error.response.data.error.originalError &&
            error.response.data.error.originalError.info &&
            error.response.data.error.originalError.info.message
          ) {
            errorMessage = error.response.data.error.originalError.info.message
          }
          if (
            !errorMessage &&
            error.response &&
            error.response.data &&
            error.response.data.error &&
            error.response.data.error.originalError &&
            error.response.data.error.originalError.message
          ) {
            errorMessage = error.response.data.error.originalError.message
          }
          if (
            !errorMessage &&
            error.response &&
            error.response.data &&
            error.response.data.error
          ) {
            errorMessage = error.response.data.error
          }
          if (!errorMessage && error.response.statusText) {
            errorMessage = error.response.statusText
          }
          if (!errorMessage && error.response.data.originalError.message) {
            errorMessage = error.response.data.originalError.message
          }
          if (!errorMessage && error.response.data) {
            errorMessage = error.response.data
          }
          if (
            !errorMessage &&
            error.response.data.error.originalError.info.message
          ) {
            errorMessage = error.response.data.error.originalError.info.message
          }
        } catch (ex) {
          errorMessage = undefined
        }

        if (!errorMessage) {
          errorMessage =
            (error.response.data.error.originalError
              ? error.response.data.error.originalError.message
              : undefined) ||
            error.response.data.error.message ||
            error.response.data.error ||
            error.response.data.error.originalError.info.message
        }

        Notify.create({
          color: 'negative',
          icon: 'error',
          message: `Error en el servidor ([${errorCode}] - ${errorMessage})`,
          position: 'top-right',
          textColor: 'white',
          actions: [{ icon: 'close', color: 'white' }],
          timeout: 60000
        })
      } else {
        if (
          (error.response.data.success === false &&
            error.response.data.message) ||
          error.response.data.error
        ) {
          Notify.create({
            color: 'negative',
            icon: 'error',
            message: error.response.data.message || error.response.data.error,
            position: 'top-right',
            textColor: 'white',
            actions: [{ icon: 'close', color: 'white' }],
            timeout: 60000
          })
        } else {
          Notify.create({
            color: 'negative',
            icon: 'error',
            message: error.response,
            position: 'top-right',
            textColor: 'white',
            actions: [{ icon: 'close', color: 'white' }],
            timeout: 60000
          })
        }
      }
    } else if (error.request) {
      Notify.create({
        progress: true,
        color: 'negative',
        icon: 'error',
        message: 'Conexión demorada ó no hay conexión a internet. No ha habido una respuesta rápida, vuelva a intentarlo.',
        position: 'top-right',
        textColor: 'white',
        actions: [{ icon: 'close', color: 'white' }],
        timeout: 60000
      })
    } else {
      Notify.create({
        color: 'negative',
        icon: 'error',
        message: `Unexpected error: ${error}`,
        position: 'top-right',
        textColor: 'white',
        actions: [{ icon: 'close', color: 'white' }],
        timeout: 60000
      })
    }

    // #endregion

    return Promise.reject(error)
  }
)
// #endregion

// #region Incrustar Token en las solicitudes
var isAbsoluteURLRegex = /^(?:\w+:)\/\//
axios.interceptors.request.use(function (config) {
  config.timeout = 60 * 4 * 1000 // 4 Minutos de Espera
  if (!isAbsoluteURLRegex.test(config.url)) {
    const apiUrl = Vue.prototype.$store.state.app.api_url
    config.url = join(apiUrl, config.url)
  }

  if (process.env.DEV) {
    /* eslint no-console: ["error", { allow: ["log"] }] */
    console.log(config.url)
  }

  var token = null

  if (Vue.prototype.$store.state.auth.jwt) {
    token = Vue.prototype.$store.state.auth.jwt
  }
  if (token) {
    config.headers.authorization = 'Bearer ' + token
  }
  config.headers.Expires = '-1'
  return config
})
// #endregion

export default async ({ Vue }) => {
  Vue.prototype.$axios = axios
}
