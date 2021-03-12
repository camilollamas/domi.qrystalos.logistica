<template>
  <q-page
    padding
    v-bind:style="{ backgroundImage: 'url(' + image + ')' }"
    style="background-size: cover;  background-repeat: no-repeat;"
  >
    <center>
      <div
        class="text-h2 rounded-borders text-black shadow-2 "
        @keydown.esc="regresarAInicio"
      >
        Ingresar al Módulo
      </div>
      <!-- <hr /> -->
      <br />
      <div
        class="q-pa-md bg-light-blue-1 bg-transparent shadow-2 rounded-borders"
        style="max-width: 400px"
        v-if="identificado === 0"
      >
        <transition
          appear
          enter-active-class="animated bounceInLeft"
          leave-active-class="animated bounceOutRight"
        >
          <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-xs">
            <q-select
              id="compania"
              ref="compania"
              filled
              v-model="compania"
              :options="companias"
              :label="$t('form.login.compania_label')"
              :loading="cargandoCompanias"
              :rules="[
                val =>
                  (val && val.value != '') || this.$t('form.required_option')
              ]"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-italic text-grey">{{
                    $t("form.no_option")
                  }}</q-item-section>
                </q-item>
              </template>
               <template v-slot:append>
                <q-icon
                  class="cursor-pointer"
                  name="refresh"
                  @click="onReloadCompanias"
                />
              </template>
            </q-select>
            <q-input
              id="usuario"
              ref="usuario"
              filled
              v-model="usuario"
              :label="$t('form.login.usuario_label')"
              :hint="$t('form.login.usuario_hint')"
              lazy-rules
              :rules="[
                val => (val && val.length > 0) || this.$t('form.required_text')
              ]"
              :loading="cargando"
            />

            <div>
              <q-btn
                :label="$t('button.cancelar')"
                @click="goAppOffline"
                color="primary"
                flat
                class="q-ml-sm"
                :disable="cargando"
              />
              <q-btn
                :label="$t('button.continuar')"
                type="submit"
                color="primary"
              />
            </div>
          </q-form>
        </transition>
      </div>
      <div
        class="q-pa-md bg-light-blue-1 bg-transparent shadow-2 rounded-borders"
        style="max-width: 400px"
        v-else-if="identificado === 1"
      >
        <transition
          appear
          enter-active-class="animated bounceInLeft"
          leave-active-class="animated bounceOutRight"
        >
          <div @keydown.esc="regresarAInicio">
            <div class="text-h4 text-italic text-indigo" v-if="nombre">
              {{ nombre }}
            </div>
            <q-form @submit="onConfigurar" class="q-gutter-md">
              <q-input
                type="password"
                id="claveKrystalos"
                ref="claveKrystalos"
                filled
                v-model="claveKrystalos"
                :label="$t('form.login.clave_krystalos_label')"
                :hint="$t('form.login.clave_krystalos_hint')"
                lazy-rules
                :rules="[
                  val =>
                    (val && val.length > 0) || this.$t('form.required_text')
                ]"
              />
              <q-input
                type="password"
                id="claveWeb"
                ref="claveWeb"
                filled
                v-model="claveWeb"
                :label="$t('form.login.nueva_clave_label')"
                :hint="$t('form.login.nueva_clave_hint')"
                lazy-rules
                :rules="[
                  val =>
                    (val && val.length > 0) || this.$t('form.required_text')
                ]"
              />
              <q-input
                type="password"
                id="claveWeb2"
                ref="claveWeb2"
                filled
                v-model="claveWeb2"
                :label="$t('form.login.nueva_calve2_label')"
                :hint="$t('form.login.nueva_calve2_hint')"
                lazy-rules
                :rules="[
                  val =>
                    (val && val.length > 0) || this.$t('form.required_text'),
                  val =>
                    (val && val == this.claveWeb) || 'La Clave debe Coincidir'
                ]"
              />
              <div>
                <q-btn
                  :label="$t('button.cancelar')"
                  color="negative"
                  icon="subdirectory_arrow_left"
                  @click="
                    claveKrystalos = claveWeb = claveWeb2 = null;
                    identificado = 0;
                  "
                  :disable="cargando"
                />&nbsp;
                <q-btn
                  :label="$t('button.registrar')"
                  type="submit"
                  color="primary"
                  icon="send"
                  :loading="cargando"
                />
              </div>
            </q-form>
          </div>
        </transition>
      </div>
      <div
        class="q-pa-md bg-light-blue-1 bg-transparent shadow-2 rounded-borders"
        style="max-width: 400px"
        v-else
      >
        <transition
          appear
          enter-active-class="animated bounceInLeft"
          leave-active-class="animated bounceOutRight"
        >
          <div @keydown.esc="regresarAInicio()">
            <div class="text-h4 text-italic text-indigo" v-if="nombre">
              {{ nombre }}
            </div>
            <q-form @submit="onLogin" class="q-gutter-md">
              <q-input
                v-model="claveWeb"
                filled
                :type="isPwd ? 'password' : 'text'"
                :label="$t('form.login.clave_label')"
                :hint="$t('form.login.clave_hint')"
                ref="claveWeb"
                lazy-rules
              >
                <template v-slot:append>
                  <q-icon
                    :name="isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwd = !isPwd"
                  />
                </template>
              </q-input>

              <q-btn
                :label="$t('button.cancelar')"
                color="negative"
                icon="subdirectory_arrow_left"
                @click="identificado = 0"
              />
              <q-btn
                :label="$t('button.ingresar')"
                type="submit"
                color="primary"
                icon="lock_open"
                :loading="cargando"
              />
            </q-form>
          </div>
        </transition>
      </div>
    </center>
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'IngresarPage',
  data () {
    return {
      image: '/images/logistica.jpg',
      usuario: null,
      clave: null,
      clave2: null,
      identificado: 0,
      compania: null,
      cargando: false,
      claveKrystalos: null,
      claveWeb: null,
      claveWeb2: null,
      isPwd: true,
      nombre: null,
      cargandoCompanias: false
    }
  },
  mounted () {
    this.$q.loading.hide()
    setTimeout(() => {
      if (this.$store.state.auth.logout) {
        this.$store.commit('auth/setLogout', false, { root: true })
        this.$store.commit('auth/setUsuario', null, { root: true })
        this.$store.commit('auth/setJWT', null, { root: true })
        this.$store.commit('auth/setIsLogged', false, { root: true })
        setTimeout(() => {
          // this.$store.commit('kasis/setCurrentAfi', null, { root: true })
          // this.$store.commit('kasis/setCurrentCit', null, { root: true })
          // this.$store.commit('app/setTelellamadaActiva', null, { root: true })
          this.onReloadCompanias()
        }, 200)
      } else {
        this.$router.push({ name: 'home' })
      }
    }, 10)
  },
  // mounted () {
  //   setTimeout(() => {
  //     this.onReloadCompanias()
  //   }, 200)
  // },
  // preFetch({ store /*, currentRoute, previousRoute, redirect , ssrContext*/ }) {
  //   store.commit("app/setApiUrl", process.env.BASE_URL, { root: true });
  //   return store.dispatch("app/fetchCompanias", null, { root: true });
  // },
  methods: {
    onReloadCompanias () {
      this.cargandoCompanias = true
      this.$store
        .dispatch('app/fetchCompanias', null, { root: true })
        .then(() => {
          this.cargandoCompanias = false
        })

      const cia = this.$store.state.auth.bdFavorita
      setTimeout(() => {
        if (
          this.companias &&
          this.companias.length
          // && this.companias.length === 1
        ) {
          if (cia) {
            this.companias.forEach(el => {
              if (el.COMPANIA === cia.COMPANIA) {
                this.compania = el
              }
            })
          }
          if (!this.compania) { this.compania = this.companias[0] }
        }
        if (this.companias && this.companias.length && this.companias.filter(x => x === cia).length > 0) {
          this.compania = cia
        }
        this.$refs.usuario.select()
      }, 300)
    },

    regresarAInicio () {
      this.claveKrystalos = this.claveWeb = this.claveWeb2 = null
      this.identificado = 0
    },

    onSubmit () {
      this.cargando = true
      this.$store
        .dispatch(
          'auth/verificar',
          { compania: this.compania.value, usuario: this.usuario },
          { root: true }
        )
        .then(res => {
          if (res.data.res !== 'ok') {
            this.$q.notify({
              color: 'negative',
              textColor: 'white',
              icon: 'error',
              message: res.data.message,
              actions: [{ icon: 'close', color: 'white' }]
            })
          } else {
            var data = res.data.result.recordset
            if (data.length <= 0) {
              this.$q.notify({
                color: 'negative',
                textColor: 'white',
                icon: 'error',
                message: this.$t('form.login.usuario_no_encontrado'),
                actions: [{ icon: 'close', color: 'white' }]
              })
              this.$refs.usuario.select()
            } else {
              var usuario = null
              if (data.length > 0) {
                usuario = data[0]
              }
              if (usuario) {
                this.nombre = usuario.NOMBRE
                if (usuario.REGISTRADO === 1) {
                  this.identificado = 2
                } else {
                  this.identificado = 1
                }
              } else {
                this.$q.notify({
                  color: 'negative',
                  textColor: 'white',
                  icon: 'error',
                  message: this.$t('form.login.usuario_no_encontrado'),
                  actions: [{ icon: 'close', color: 'white' }]
                })
                this.$refs.usuario.select()
              }
              // this.identificado = true;
            }
          }
        })
        .catch(err => {
          /* eslint no-console: ["error", { allow: ["warn", "error"] }] */
          console.error(err)
        })
        .finally(() => {
          this.cargando = false
        })
    },

    onReset () {
      this.usuario = null
      this.compania = null
    },

    onConfigurar () {
      this.cargando = true
      this.$store
        .dispatch(
          'auth/configurar',
          {
            COMPANIA: this.compania.value,
            USUARIO: this.usuario,
            CLAVE: this.claveKrystalos,
            CLAVE_NUEVA: this.claveWeb
          },
          { root: true }
        )
        .then(res => {
          var data = res.data.result.recordset
          if (data.length <= 0) {
            this.$q.notify({
              color: 'info',
              textColor: 'black',
              icon: 'info',
              message: this.$t('form.login.reintentar'),
              actions: [{ icon: 'close', color: 'black' }]
            })
          } else {
            if (data[0].CONFIGURADO <= 0) {
              this.$q.notify({
                color: 'negative',
                textColor: 'white',
                icon: 'block',
                message: this.$t('form.login.error_login'),
                actions: [{ icon: 'close', color: 'white' }]
              })
              this.$refs.claveKrystalos.select()
            } else {
              this.$q.notify({
                color: 'positive',
                textColor: 'white',
                icon: 'check',
                message: this.$t('form.login.success'),
                actions: [{ icon: 'close', color: 'white' }]
              })
              this.regresarAInicio()
            }
          }
        })
        .catch(err => {
          /* eslint no-console: ["error", { allow: ["warn", "error"] }] */
          console.error(err)
        })
        .finally(() => {
          this.cargando = false
        })
    },

    onLogin () {
      this.cargando = true
      this.$store
        .dispatch(
          'auth/ingresar',
          {
            COMPANIA: this.compania.value,
            USUARIO: this.usuario,
            CLAVE: this.claveWeb
          },
          { root: true }
        )
        .then(res => {
          if (res.data.res === 'ok') {
            var usuario = res.data.result
            var jwt = res.data.jwt

            if (!usuario) {
              this.cargando = false
              this.$q.notify({
                color: 'negative',
                textColor: 'white',
                icon: 'block',
                message: this.$t('form.login.error_login'),
                actions: [{ icon: 'close', color: 'white' }]
              })
              this.$refs.claveWeb.select()
            } else {
              // this.$q.loading.show()
              this.$store.dispatch('app/json', {
                MODELO: 'MED',
                METODO: 'ESPECIALIDADES'
              }, { root: true }).then(res => {
                if (res.data.res === 'ok') {
                  usuario.MEDS = res.data.result.recordset
                }
              }).then(() => {
                this.$axios.get('/ususu/DPR').then(res => {
                  if (res.data.res !== 'ok' || res.data.result.data.recordset.length <= 0) {
                    this.cargando = false
                    this.$q.notify({
                      color: 'negative',
                      textColor: 'white',
                      icon: 'error',
                      message: 'No se ha podido encontrar los datos del propietario en la base de datos',
                      progress: true,
                      actions: [{ icon: 'close', color: 'white' }]
                    })
                  } else {
                    this.$store.commit('app/setDPR', res.data.result.data.recordset[0], { root: true })
                    this.$axios
                      .post('json', {
                        MODELO: 'DPR',
                        METODO: 'LOGO'
                      }).then(res => {
                        if (res.data.res !== 'ok') {
                          this.cargando = false
                          this.$q.notify({
                            color: 'negative',
                            textColor: 'white',
                            icon: 'error',
                            message: 'No he podido encontrar el logo de la institución',
                            progress: true,
                            actions: [{ icon: 'close', color: 'white' }]
                          })
                        } else {
                          let logo = ''
                          res.data.result.recordset.forEach(x => {
                            logo = x.LOGO
                          })
                          if (logo === '' || !logo) {
                            this.$q.notify({
                              color: 'negative',
                              textColor: 'white',
                              icon: 'error',
                              message: 'Logo no configurado en los registros de la sede',
                              progress: true,
                              actions: [{ icon: 'close', color: 'white' }]
                            })
                          } else {
                            this.$store.commit('app/setLogo', logo, { root: true })
                            this.$store.commit('auth/setUsuario', usuario, { root: true })
                            this.$store.commit('auth/setJWT', jwt, { root: true })
                            this.$store.commit('auth/setIsLogged', true, { root: true })
                            this.$store.commit('auth/setBdFavorita', this.compania)
                            this.$router.push({ name: 'home' })
                          }
                          this.cargando = false
                        }
                      })
                  }
                })
              })
                .catch(err => {
                  console.error(err)
                })
            }
          } else {
            this.$q.notify({
              color: 'info',
              textColor: 'black',
              icon: 'info',
              message: this.$t('form.login.reintentar'),
              actions: [{ icon: 'close', color: 'black' }]
            })
            this.cargando = false
            return this.$refs.claveWeb.select()
          }
        })
        .catch(err => {
          /* eslint no-console: ["error", { allow: ["warn", "error"] }] */
          console.error(err)
          this.cargando = false
        })
        // .finally(() => {
        //   this.cargando = false
        // })
    },

    goAppOffline () {
      // window.location = this.$store.state.app.hrefModuloCentral;
      window.location = this.urlMenuCentral
    }
  },
  computed: {
    ...mapGetters('app', ['urlMenuCentral']),
    companias () {
      return this.$store.state.app.companias
    }
  },
  watch: {
    identificado (val) {
      if (val === 0) {
        setTimeout(() => {
          this.$refs.usuario.select()
        }, 200)
      }
      if (val === 1) {
        setTimeout(() => {
          this.$refs.claveKrystalos.select()
        }, 200)
      }
      if (val === 2) {
        setTimeout(() => {
          this.$refs.claveWeb.select()
        }, 200)
      }
    }
  }
}
</script>
