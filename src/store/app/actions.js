import Vue from 'vue'
export function fetchCompanias (context) {
  return new Promise((resolve /*, reject */) => {
    Vue.prototype.$axios.get('/cia/').then(res => {
      const data = res.data
      if (data.result.recordset.length) {
        data.result.recordset.forEach(el => {
          el.value = el.COMPANIA
          el.label = `${el.RAZONSOCIAL} (${el.COMPANIA})`
        })
      }
      context.commit('app/setCompanias', data.result.recordset, { root: true })
      resolve(true)
    })
  })
}
export function json (context, data) {
  if (process.env.DEV) {
    console.log(JSON.stringify(data))
  }
  return Vue.prototype.$axios.post('json', data)
}
export function read (context, data) {
  return Vue.prototype.$axios.post('read', data)
}
export function valorvariable (context, idvariable) {
  return new Promise((resolve /*, reject */) => {
    Vue.prototype.$axios
      .post('json', {
        MODELO: 'USVGS',
        METODO: 'VALORVARIABLE',
        PARAMETROS: { IDVARIABLE: idvariable }
      })
      .then(res => {
        let dato = ''
        if (res.data.result.recordset && res.data.result.recordset.length > 0) {
          dato = res.data.result.recordset[0].DATO
        }
        resolve(dato)
      })
  })
}
export async function fetchMenu (context, parametros) {
  try {
    parametros = {
      MODELO: 'MENU',
      METODO: parametros.PAGINA
    }
    const { data } = await Vue.prototype.$axios.post('json', parametros)
    const menus = {
      agrupados: data.result.recordsets[0],
      submenus: data.result.recordsets[1],
      individuales: data.result.recordsets[2]
    }
    context.commit('app/setMenu', menus, { root: true })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
  }
}
export function fetchDPR (context) {
  return new Promise((resolve, reject) => {
    Vue.prototype.$axios.get('/ususu/DPR').then(async res => {
      if (res.data.res !== 'ok') {
        reject(res)
      } else {
        context.commit('app/setDPR', res.data.result.data.recordset[0], {
          root: true
        })
        const vv = await Vue.prototype.$axios
          .post('json', {
            MODELO: 'DPR',
            METODO: 'LOGO'
          })
        let logo = ''
        vv.data.result.recordset.forEach(x => {
          logo = x.LOGO
        })
        context.commit('app/setLogo', logo, {
          root: true
        })
        resolve(true)
      }
    })
  })
}
export async function fetchTipoIdent (context) {
  try {
    const { data } = await context.dispatch(
      'app/json',
      {
        MODELO: 'TGEN',
        METODO: 'CONSULTA',
        PARAMETROS: {
          TABLA: 'General',
          CAMPO: 'TIPOIDENT'
        }
      },
      { root: true }
    )
    var registros
    if (
      data &&
      data.result &&
      data.result.recordset &&
      data.result.recordset.length > 0 &&
      data.result.recordset[0].RESULT
    ) {
      registros = JSON.parse(data.result.recordset[0].RESULT)
      registros.forEach(el => {
        el.label = `${el.CODIGO} -  ${el.DESCRIPCION}`
        el.value = el.CODIGO
      })
    }
    context.commit('app/setTipoIdent', registros, { root: true })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
  }
}
export function fetchUsuarios (context) {
  return context
    .dispatch(
      'app/json',
      {
        MODELO: 'USUSU',
        METODO: 'CONSULTAR'
      },
      { root: true }
    )
    .then(res => {
      var data = res.data
      var registros
      if (
        data &&
        data.result &&
        data.result.recordset &&
        data.result.recordset.length > 0 &&
        data.result.recordset[0].RESULT
      ) {
        registros = JSON.parse(data.result.recordset[0].RESULT)
        registros.forEach(el => {
          el.label = `${el.USUARIO} ${el.NOMBRE} (${el.GRUPO})`
          el.value = el.USUARIO
        })
      }
      context.commit('app/setUsuarios', registros, { root: true })
    })
}
export function fetchAdministradoras (context) {
  return context
    .dispatch(
      'app/json',
      {
        MODELO: 'HBUSAC',
        METODO: 'CONSULTATER'
      },
      { root: true }
    )
    .then(res => {
      var data = res.data
      var registros
      if (
        data &&
        data.result &&
        data.result.recordset &&
        data.result.recordset.length > 0 &&
        data.result.recordset[0].RESULT
      ) {
        registros = JSON.parse(data.result.recordset[0].RESULT)
        registros.forEach(el => {
          el.label = `${el.RAZONSOCIAL}`
          el.value = el.IDTERCERO
        })
      }
      context.commit('app/setAdministradoras', registros, { root: true })
    })
}
export function fetchServicios (context) {
  return context
    .dispatch(
      'app/json',
      {
        MODELO: 'HBUSAC',
        METODO: 'CONSULTASER'
      },
      { root: true }
    )
    .then(res => {
      var data = res.data
      var registros
      if (
        data &&
        data.result &&
        data.result.recordset &&
        data.result.recordset.length > 0 &&
        data.result.recordset[0].RESULT
      ) {
        registros = JSON.parse(data.result.recordset[0].RESULT)
        registros.forEach(el => {
          el.label = `${el.IDSERVICIO} - ${el.PREFIJO}/${el.DESCSERVICIO}`
          el.value = el.IDSERVICIO
        })
      }
      context.commit('app/setServicios', registros, { root: true })
    })
}
export function fetchCiudades (context) {
  return context
    .dispatch(
      'app/json',
      {
        MODELO: 'HBUSAC',
        METODO: 'CONSULTACIU'
      },
      { root: true }
    )
    .then(res => {
      var data = res.data
      var registros
      if (
        data &&
        data.result &&
        data.result.recordset &&
        data.result.recordset.length > 0 &&
        data.result.recordset[0].RESULT
      ) {
        registros = JSON.parse(data.result.recordset[0].RESULT)
        registros.forEach(el => {
          el.label = `${el.NOMCIU}, ${el.NOMDEP}.`
          el.value = el.CODCIU
        })
      }
      context.commit('app/setCiudades', registros, { root: true })
    })
}
export function fetchDiagnosticos (context) {
  return context
    .dispatch(
      'app/json',
      {
        MODELO: 'HBUSAC',
        METODO: 'DIAGNOSTICOS'
      },
      { root: true }
    )
    .then(res => {
      var data = res.data
      var registros
      if (
        data &&
        data.result &&
        data.result.recordset &&
        data.result.recordset.length > 0 &&
        data.result.recordset[0].RESULT
      ) {
        registros = JSON.parse(data.result.recordset[0].RESULT)
        registros.forEach(el => {
          el.label = `${el.IDDX} [${el.GRUPOENF}], ${el.DESCRIPCION}.`
          el.value = el.IDDX
        })
      }
      context.commit('app/setDiagnosticos', registros, { root: true })
    })
}
export function fetchMedicos (context) {
  return context
    .dispatch(
      'app/json',
      {
        MODELO: 'FME',
        METODO: 'MEDICOS'
      },
      { root: true }
    )
    .then(res => {
      var data = res.data
      var registros
      if (
        data &&
        data.result &&
        data.result.recordset &&
        data.result.recordset.length > 0 &&
        data.result.recordset[0].RESULT
      ) {
        registros = JSON.parse(data.result.recordset[0].RESULT)
        registros.forEach(el => {
          el.label = `${el.IDMEDICO}, ${el.NOMBRE}.`
          el.value = el.IDMEDICO
        })
      }
      context.commit('app/setMedicos', registros, { root: true })
    })
}
export function fetchVariables (context) {
  return context
    .dispatch(
      'app/json',
      {
        MODELO: 'FME',
        METODO: 'VARIABLES'
      },
      { root: true }
    )
    .then(res => {
      var data = res.data
      var registros
      if (
        data &&
        data.result &&
        data.result.recordset &&
        data.result.recordset.length > 0 &&
        data.result.recordsets
      ) {
        registros = res.data.result.recordsets[0]
      }
      context.commit('app/setVariables', registros, { root: true })
    })
}
export function sendSMS (context, data) {
  let urlApiSMS = context.state.dpr.URL_API_SMS
  console.log(urlApiSMS)
  alert(urlApiSMS)

  if (!urlApiSMS || urlApiSMS === '') {
    // Expertta
    urlApiSMS = `https://gentle-reaches-57765.herokuapp.com/sms/o.u72WMmEkH0uTthnxuJYRxM9nnaR3aoLB/ujzTSFXOloa/ujzTSFXOloasjxB6yHL0z6/${data.num}`

    // IX Colombia
    const demo = true
    if (context.state.dpr.IDTERCERO === '901205840' || demo) { urlApiSMS = `https://gentle-reaches-57765.herokuapp.com/sms/o.gmcvJbsXhSlkxLczFTnj7fsewzcJSrJb/ujz7iq3eKcK/ujz7iq3eKcKsjvoe5iEwa4/${data.num}` }
  }

  // return Vue.prototype.$axios.get(urlApiSMS)
  // console.log(urlApiSMS)
  return Vue.prototype.$axios.post(urlApiSMS, { msj: data.msj })
}
export function sendSMS2 (context, data) {
  const parametros = {
    MODELO: 'SMS',
    NUMERO: data.num,
    SMS: data.msj
  }
  return Vue.prototype.$axios.post('json', parametros)
}
export function sendNote (context, data) {
  const urlApiSMS = 'https://gentle-reaches-57765.herokuapp.com/note/'
  return Vue.prototype.$axios.post(urlApiSMS, { api_key: 'o.u72WMmEkH0uTthnxuJYRxM9nnaR3aoLB', email: data.email, msj: data.body, titulo: data.subject })
}
export function sendMail (context, data) {
  return Vue.prototype.$axios.post('mailer', data)
}
export async function fetchPermisos (context) {
  try {
    const { data } = await context.dispatch(
      'app/json',
      {
        MODELO: 'USPROH',
        METODO: 'ADMISIONES_WEB'
      },
      { root: true }
    )
    var registros
    if (
      data &&
      data.result &&
      data.result.recordset &&
      data.result.recordset.length > 0
      // data.result.recordset[0].RESULT
    ) {
      registros = data.result.recordset
    }
    context.commit('app/setPermisos', registros, { root: true })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
  }
}
