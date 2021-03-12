<template>
  <div>
    <q-card>
      <q-card-section v-show="!enLlamada">
        <div class="text-h6">Video Llamada</div>
        <!-- <div class="text-subtitle2">by IX Colombia</div> -->
      </q-card-section>
      <q-card-actions>
        <q-btn
          flat
          round
          color="teal"
          icon="video_call"
          @click="onJoin"
          v-show="!enLlamada"
        />
        <q-btn
          flat
          round
          icon="block"
          @click="pausarLlamada"
          v-show="!enLlamada"
        />
        <q-btn
          flat
          round
          color="primary"
          icon="share"
          @click="dialog = true"
          v-show="enLlamada || true"
        />
      </q-card-actions>
      <q-card-section v-show="enLlamada">
        <div id="jitsi" v-if="activarJitsi"></div>
      </q-card-section>
    </q-card>
    <q-dialog
      v-model="dialog"
      persistent
      transition-show="flip-down"
      transition-hide="flip-up"
    >
      <q-card class="text-white" style="width: 400px; max-width: 80vw;">
        <q-bar class="bg-primary">
          <q-icon name="network_wifi" />
          <!-- <q-icon name="network_cell" /> -->
          <!-- <q-icon name="battery_full" /> -->
          <!-- <div>9:34</div> -->

          <q-space />

          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip content-class="bg-white text-primary">{{
              $t('button.close')
            }}</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section>
          <q-tabs v-model="tab" class="text-primary">
            <q-tab name="sms" icon="chat" label="SMS" />
            <q-tab name="mail" icon="contact_mail" label="Mail" />
            <q-tab name="clipboard" icon="file_copy" label="Copiar" />
          </q-tabs>
          <q-tab-panels
            v-model="tab"
            animated
            swipeable
            vertical
            transition-prev="jump-up"
            transition-next="jump-up"
          >
            <q-tab-panel name="sms">
              <div class="text-h6 text-primary">Notificar paciente vía SMS</div>
              <q-form @submit="onSubmit" @reset="onReset">
                <q-input
                  ref="numberSms"
                  filled
                  v-model="numberSms"
                  label="Número de Celular *"
                  hint="Número de celular del paciente"
                  lazy-rules
                  :rules="[
                    val => (val && val.length > 0) || $t('form.required_text')
                  ]"
                />

                <div>
                  <q-btn
                    :label="$t('button.ok')"
                    type="submit"
                    color="primary"
                    :loading="enviandoSMS"
                  />
                  <q-btn
                    :label="$t('button.clear')"
                    type="reset"
                    color="primary"
                    flat
                    class="q-ml-sm"
                  />
                </div>
              </q-form>
            </q-tab-panel>
            <q-tab-panel name="mail">
              <q-form @submit="onSubmit" @reset="onReset">
                <div class="text-h6 text-primary">
                  Notificar paciente por EMAIL
                </div>
                <q-input
                  ref="mail"
                  filled
                  v-model="mail"
                  label="Correo Electrónico *"
                  hint="Correo Electrónico del paciente"
                  lazy-rules
                  :rules="[val => validateEmail()]"
                />

                <div>
                  <q-btn
                    :label="$t('button.ok')"
                    type="submit"
                    color="primary"
                    :loading="enviandoSMS"
                  />
                  <q-btn
                    :label="$t('button.clear')"
                    type="reset"
                    color="primary"
                    flat
                    class="q-ml-sm"
                  />
                </div>
              </q-form>
            </q-tab-panel>
            <q-tab-panel name="clipboard" class="text-black text-center">
              Estimado paciente, te invito a una sesión a distancia. Unete a la
              reunión tocando este enlace: https://meet.jit.si/{{ roomId }}
              <div>
                <q-btn
                  label="Copiar"
                  type="submit"
                  color="primary"
                  :loading="enviandoSMS"
                  @click="copiarRoomId"
                />
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { copyToClipboard } from 'quasar'
export default {
  name: 'JitsiComponent',
  data () {
    return {
      nombreUsuario: null,
      enLlamada: false,
      activarJitsi: false,
      roomId: Math.ceil(Math.random() * 1000000),
      dialog: false,
      numberSms: '',
      mail: null,
      enviandoSMS: false,
      tab: 'sms',
      splitterModel: 20,
      timeOut: null
    }
  },
  mounted () {
    this.roomId = Math.ceil(Math.random() * 1000000)
    this.nombreUsuario = this.$store.state.auth.usuario.NOMBRE
    this.pausarLlamada()
    // this.sendSms()
    setTimeout(() => {
      if (this.afi) {
        this.roomId = this.afi.DOCIDAFILIADO
      }
    }, 200)
  },
  methods: {
    pausarLlamada () {
      this.$store.commit('app/setTelellamada', false, { root: true })
    },
    onJoin () {
      if (!this.afi) {
        this.$q.notify({
          progress: true,
          color: 'info',
          textColor: 'black',
          icon: 'info',
          message: 'No ha seleccionado paciente alguno para iniciar una videollamada',
          actions: [{ icon: 'close', color: 'black' }]
        })
        return
      }
      this.activarJitsi = true
      setTimeout(() => {
        this.enLlamada = true
        const domain = 'meet.jit.si'
        // this.roomId = Math.ceil(Math.random() * 1000000)
        const options = {
          roomName: this.roomId,
          // width: 700,
          height: 300,
          parentNode: document.querySelector('#jitsi'),
          configOverwrite: { defaultLanguage: 'es' },
          // interfaceConfigOverwrite: {
          //   filmStripOnly: true
          // },
          userInfo: {
            // email: 'email@jitsiexamplemail.com',
            displayName: this.nombreUsuario
          }
        }

        // eslint-disable-next-line no-undef
        const api = new JitsiMeetExternalAPI(domain, options)
        var self = this
        api.addEventListener('readyToClose', function () {
          // this.roomId = Math.ceil(Math.random() * 1000000)
          self.pausarLlamada()
          setTimeout(() => {
            self.activarJitsi = false
          }, 200)
          setTimeout(() => {
            self.enLlamada = false
          }, 1500)
        })
      }, 100)
    },
    sendSms () {
      if (this.numberSms !== '') {
        const parametros = {
          numero: '3022172231',
          mensaje: `${this.nombreUsuario} te esta invitando a una sesión. Unirse a la reunión: https://meet.jit.si/${this.roomId}`
        }
        this.$store
          .dispatch('app/sendSMS', parametros, { root: true })
          .then(res => {
            console.log(res)
          })
        //   msj},{root:true}
        // }).then(res=>{
        // })
      }
    },
    onSubmit () {
      // if (this.numberSms !== '') {
      let action = 'app/sendSMS'
      let parametros = {
        num: this.numberSms,
        // mensaje: `${this.nombreUsuario} te esta invitando a una sesión. Unirse a la reunión: https://meet.jit.si/${this.roomId}`
        msj: `El Dr(a)/Lic(a) ${this.nombreUsuario} te esta invitando a una sesion de videollamada. Unirse a la reunion: https://meet.jit.si/${this.roomId}`
        // msj: `Su medico ()/ ${this.nombreUsuario} le esta invitando a una sesion de videollamada. Unirse a la reunion usando el codigo: ${this.roomId}`
        // msj: 'Pruebas de Desarrollo'
      }
      let messageSuccess = `Invitación enviada via SMS al número ${this.numberSms}`
      if (this.tab === 'mail') {
        action = 'app/sendMail'
        parametros = {
          email: this.mail,
          body: `${this.nombreUsuario} te esta invitando a una sesión. Unirse a la reunión: https://meet.jit.si/${this.roomId}`,
          subject: 'Unirse a la reunión con tu médico'
        }
        parametros = {
          mail: this.mail,
          // subject: 'CITA CON SU MEDICO/ESPECIALISTA DE EXPERTTA SALUD SAC',
          subject: `CITA CON SU MEDICO/ESPECIALISTA DE ${this.dpr && this.dpr.RAZONSOCIAL ? this.dpr.RAZONSOCIAL : ''}`,
          html: `El Dr(a)/Lic(a) ${this.nombreUsuario} te esta invitando a una sesion de videollamada. <br />Unirse a la reunión: <a rel="nofollow" href="https://meet.jit.si/${this.roomId}">https://meet.jit.si/${this.roomId}</a> `,
          text: `El Dr(a)/Lic(a) ${this.nombreUsuario} te esta invitando a una sesion de videollamada. Unirse a la reunión: https://meet.jit.si/${this.roomId}`
        }
        messageSuccess = `Notificación enviada a ${this.mail}`
      }
      this.enviandoSMS = true
      // clearTimeout(this.timeOut)
      // this.timeOut = setTimeout(() => {
      this.$store
        .dispatch(action, parametros, { root: true })
        .then(res => {
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'check',
            message: messageSuccess
          })
          // this.onReset()
          this.dialog = false
        })
        .then(() => {
          this.enviandoSMS = false
        })
        .catch(() => {
          this.enviandoSMS = false
        })
      // }, 1000)
    },
    onReset () {
      this.numberSms = null
      this.mail = null
      if (this.tab === 'sms') {
        this.$refs.numberSms.focus()
      }
      if (this.tab === 'mail') {
        this.$refs.mail.focus()
      }
    },
    validateEmail () {
      if (!this.mail || this.mail === '') return this.$t('form.required_text')
      if (/^\w+([\\.-]?\w+)*@\w+([\\.-]?\w+)*(\.\w{2,3})+$/.test(this.mail)) {
        return true
      }
      return this.$t('form.invalid_mail')
    },
    copiarRoomId () {
      copyToClipboard(
        `Estimado paciente, te invito a una sesión a distancia. Unete a la reunión tocando este enlace: https://meet.jit.si/${this.roomId}`
      )
        .then(() => {
          this.$q.notify({
            progress: true,
            type: 'positive',
            message: 'Link de acceso copiado al portapapeles.',
            position: 'bottom',
            actions: [{ icon: 'close', color: 'white' }]
          })
        })
        .catch(() => {
          this.$q.notify({
            progress: true,
            type: 'negative',
            message:
              'El código no pudo ser copiado al portapapeles, vuelve a intentarlo.',
            position: 'bottom',
            actions: [{ icon: 'close', color: 'white' }]
          })
        })
    }
  },
  watch: {
    tab (val) {
      if (val === 'clipboard') {
        this.copiarRoomId()
      }
    }
  },
  computed: {
    afi () {
      return this.$store.state.kasis.currentAfi
    },
    dpr () {
      return this.$store.state.app.dpr
    }
  }
}
</script>
