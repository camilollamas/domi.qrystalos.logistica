<template>
  <div>
    <q-btn color="primary" icon="edit" label="Firmar" @click="firmar=!firmar" v-show="!firmar"/>
    <div class="q-pa-md row items-start q-gutter-md">
    <q-card class="my-card" v-if="firmar">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">{{titulo || 'Diligencie su Firma'}}</div>
        <div class="text-subtitle2" v-if="subtitulo">{{subtitulo}}</div>
      </q-card-section>
      <q-card-section class="bg-grey-4">
         <VueSignaturePad width="600px" height="300px" ref="signaturePad" />
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn flat @click="save" icon="check">Guardar</q-btn>
        <q-btn flat @click="undo" icon="undo">Deshacer</q-btn>
        <q-btn flat @click="firmar=!firmar" icon="cancel">Cancelar</q-btn>
      </q-card-actions>
    </q-card>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import VueSignaturePad from 'vue-signature-pad'
Vue.use(VueSignaturePad)
export default {
  name: 'MySignaturePad',
  props: {
    titulo: {
      type: String
    },
    subtitulo: {
      type: String
    }
  },
  data () {
    return {
      firmar: false
    }
  },
  methods: {
    dataURItoBlob (dataURI) {
      // convert base64 to raw binary data held in a string
      // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
      var byteString = atob(dataURI.split(',')[1])

      // separate out the mime component
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

      // write the bytes of the string to an ArrayBuffer
      var ab = new ArrayBuffer(byteString.length)

      // create a view into the buffer
      var ia = new Uint8Array(ab)

      // set the bytes of the buffer to the correct values
      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }

      // write the ArrayBuffer to a blob, and you're done
      var blob = new Blob([ab], { type: mimeString })
      return blob
    },
    undo () {
      this.$refs.signaturePad.undoSignature()
    },
    save () {
      const { isEmpty, data } = this.$refs.signaturePad.saveSignature()
      if (!isEmpty) {
        this.$emit('image', { data: data, blob: this.dataURItoBlob(data) })
        setTimeout(() => {
          this.firmar = false
        }, 200)
      } else {
        this.$q.notify({
          color: 'negative',
          textColor: 'white',
          icon: 'warning',
          message: 'Debes diligenciar tu firma antes de continuar',
          actions: [{ icon: 'close', color: 'white' }]
        })
      }
    },
    setFirmar (value) {
      this.firmar = value
    }
  },
  watch: {
    firmar (val) {
      if (val) {
        this.$emit('firmar', true)
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.my-card
  width: 620px
  max-width: 620px
</style>
