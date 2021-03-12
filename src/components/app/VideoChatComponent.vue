<template>
  <div>
    <q-card class="my-card">
      <WebRTC width="100%" :roomId="roomId" ref="chat"> </WebRTC>
      <q-card-section>
        <div class="text-h6">Videollamada con Paciente</div>
        <!-- <div class="text-subtitle1 text-center text-bold"> -->
          <!-- {{ roomId.substr(0, 3) }} - {{ roomId.substr(3, 3) }} -->
        <!-- </div> -->
      </q-card-section>
      <q-card-actions align="center">
        <!-- <q-space /> -->
        <q-btn flat round color="teal" icon="video_call" @click="onJoin" :disable="enLlamada"/>
        <q-btn flat round color="red" icon="videocam_off" @click="onLeave" :disable="!enLlamada"/>
        <q-btn flat round icon="block" @click="pausarLlamada" v-show="!enLlamada"/>
        <!-- <q-btn flat @click="onJoin" :disable="enLlamada">Iniciar</q-btn> -->
        <!-- <q-btn flat @click="onLeave" :disable="!enLlamada">Detener</q-btn> -->
      </q-card-actions>
      <q-card-actions align="center">
        <span class="text-subtitle1 text-bold">{{ roomId.substr(0, 3) }} - {{ roomId.substr(3, 3) }}</span>
        <q-btn flat round color="primary" icon="file_copy" @click="copiarRoomId" />

      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import { WebRTC } from 'vue-webrtc'
import * as io from 'socket.io-client'
window.io = io
import { copyToClipboard } from 'quasar'
export default {
  name: 'VideoChatComponent',
  data () {
    return {
      roomId: 'Expertta',
      enLlamada: false
    }
  },
  mounted () {
    this.roomId = '000000' + Math.ceil(Math.random() * 1000000).toString()
    this.roomId = this.roomId.substr(6, 6)
  },
  components: {
    WebRTC
  },
  methods: {
    copiarRoomId () {
      copyToClipboard(this.roomId)
        .then(() => {
          this.$q.notify({
            type: 'positive',
            message: 'Código de acceso copiado al portapapeles.',
            position: 'left'
          })
        })
        .catch(() => {
          this.$q.notify({
            type: 'negative',
            message: 'El código no pudo ser copiado al portapapeles, vuelve a intentarlo.',
            position: 'left'
          })
        })
    },
    onJoin () {
      this.enLlamada = true
      this.$refs.chat.join()
    },
    onLeave () {
      this.$q
        .dialog({
          title: 'Colgar videollamada',
          message: '¿Confirma que desea realmente colgar la videollamada?',
          ok: {
            label: 'SI',
            push: true,
            color: 'positive'
          },
          cancel: {
            label: 'NO',
            push: true,
            color: 'negative'
          },
          persistent: true
        })
        .onOk(() => {
          this.enLlamada = false
          this.roomId =
            '000000' + Math.ceil(Math.random() * 1000000).toString()
          this.roomId = this.roomId.substr(6, 6)
          // this.roomId = 'ebertlast'
          this.$refs.chat.leave()
          this.pausarLlamada()
        })
    },
    pausarLlamada () {
      this.$store.commit('app/setTelellamada', false, { root: true })
    }
  }
}
</script>
