<template>
  <div>
    <div v-if="!hideButtonView">
      <q-btn round color="primary" icon="print" @click="imprimirDialog = true">
        <q-tooltip
          content-class="bg-primary"
          content-style="font-size: 16px"
          :offset="[10, 10]"
          >{{ $t("button.print") }}</q-tooltip
        >
      </q-btn>
    </div>

    <q-dialog
      v-model="imprimirDialog"
      transition-show="flip-down"
      transition-hide="flip-up"
      full-width
    >
      <q-card class="bg-grey-9 text-white">
        <q-bar>
          <q-breadcrumbs
            active-color="white"
            style="font-size: 16px"
            v-if="numPages"
          >
            <q-breadcrumbs-el
              :label="currentPage.toString()"
              icon="description"
              v-if="currentPage"
            />

            <q-breadcrumbs-el
              :label="numPages.toString()"
              v-if="numPages"
            /> </q-breadcrumbs
          >&nbsp; &nbsp; &nbsp;
          <q-btn-group push>
            <q-btn
              text-color="white"
              icon="keyboard_arrow_up"
              :disabled="!previous_valid"
              @click="currentPage--"
            ></q-btn>

            <q-btn
              text-color="white"
              icon="keyboard_arrow_down"
              :disabled="!next_valid"
              @click="currentPage++"
            ></q-btn>
          </q-btn-group>

          <q-btn-group push>
            <q-btn
              text-color="white"
              icon="zoom_in"
              @click="scale = scale + 0.1"
            >
              <q-tooltip
                content-class="bg-grey-9"
                content-style="font-size: 16px"
                :offset="[10, 10]"
                >{{ $t("button.zoom_in") }}</q-tooltip
              >
            </q-btn>

            <q-btn
              text-color="white"
              icon="zoom_out"
              @click="scale = scale - 0.1"
            >
              <q-tooltip
                content-class="bg-grey-9"
                content-style="font-size: 16px"
                :offset="[10, 10]"
                >{{ $t("button.zoom_out") }}</q-tooltip
              >
            </q-btn>
          </q-btn-group>

          <q-space />

          <q-btn
            flat
            round
            dense
            icon="fab fa-whatsapp"
            @click="sendWhatsapp"
            v-if="showBtnWhatsapp"
          >
            <q-tooltip
              content-class="bg-grey-9"
              content-style="font-size: 16px"
              :offset="[10, 10]"
              >{{ $t("button.whatsapp", {numero: whatsapp}) }}</q-tooltip
            >
          </q-btn>

          <q-btn
            flat
            round
            dense
            icon="save_alt"
            @click="download"
            v-if="!hideButtonDownload"
          >
            <q-tooltip
              content-class="bg-grey-9"
              content-style="font-size: 16px"
              :offset="[10, 10]"
              >{{ $t("button.download") }}</q-tooltip
            >
          </q-btn>

          <q-btn
            flat
            round
            dense
            icon="print"
            @click="print"
            v-if="!hideButtonPrint"
          >
            <q-tooltip
              content-class="bg-grey-9"
              content-style="font-size: 16px"
              :offset="[10, 10]"
              >{{ $t("button.print") }}</q-tooltip
            >
          </q-btn>

          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip content-class="bg-white text-primary">{{
              $t("button.close")
            }}</q-tooltip>
          </q-btn>
        </q-bar>
        <q-card-section v-if="loading" class="text-center">
          <q-spinner-ball color="white" size="2em" />
        </q-card-section>
        <q-card-section class="text-center">
          <canvas :id="id" v-show="imprimirDialog"></canvas>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
export default {
  name: 'PDFViewerComponent',
  props: {
    document: {
      required: true,
      type: Object
    },
    document_name: {
      type: String
    },
    hideButtonView: {
      type: Boolean
    },
    hideButtonPrint: {
      type: Boolean
    },
    hideButtonDownload: {
      type: Boolean
    },
    hideButtonWhatsapp: {
      type: Boolean
    },
    whatsapp: {
      type: String
    }
  },
  data () {
    return {
      id: null,
      imprimirDialog: false,
      scale: 1,
      pdf: null,
      url: null,
      doc: null,
      loadingTask: null,
      numPages: null,
      currentPage: 1,
      loading: true,
      url_whatsapp: null
    }
  },
  mounted () {
    this.id = btoa(Math.random()).substring(0, 12)

    setTimeout(() => {
      this.url_whatsapp = this.$store.state.app.dpr.URL_API_WHATSAPP
      if (this.url_whatsapp && this.url_whatsapp !== '') {
        this.url_whatsapp = this.url_whatsapp.replace('ENDPOINT', 'sendFile')
      }
    }, 200)
    // eslint-disable-next-line
  },
  computed: {
    previous_valid () {
      if (this.currentPage === 1) return false
      return true
    },
    next_valid () {
      if (this.currentPage === this.numPages) return false
      return true
    },
    showBtnWhatsapp () {
      if (!this.whatsapp) return false
      if (this.whatsapp.length < 9) return false
      if (!this.url_whatsapp || this.url_whatsapp === '') return false
      if (this.hideButtonWhatsapp) return false
      return true
    }
  },
  methods: {
    print () {
      this.$emit('print')
      this.doc.autoPrint()
      this.doc.output('dataurlnewwindow')
    },
    download () {
      this.$emit('download')
      var link = document.createElement('a')
      link.setAttribute('href', this.url)
      let documentName
      if (this.document_name) {
        documentName = this.document_name
      } else {
        documentName = 'descarga'
      }
      link.setAttribute('download', `${documentName}.pdf`)
      var event = document.createEvent('MouseEvents')
      event.initMouseEvent(
        'click',
        true,
        true,
        window,
        1,
        0,
        0,
        0,
        0,
        false,
        false,
        false,
        false,
        0,
        null
      )
      link.dispatchEvent(event)
    },
    renderPage () {
      var self = this

      self.pdf.getPage(self.currentPage).then(function (page) {
        var scale = self.scale
        var viewport = page.getViewport({ scale: scale })

        // Prepare canvas using PDF page dimensions
        var canvas = document.getElementById(self.id)
        var context = canvas.getContext('2d')
        canvas.height = viewport.height
        canvas.width = viewport.width

        // Render PDF page into canvas context
        var renderContext = {
          canvasContext: context,
          viewport: viewport
        }
        var renderTask = page.render(renderContext)
        renderTask.promise.then(function () {
          self.loading = false
        })
      })
    },
    sendWhatsapp () {
      // this.$q.notify({
      //   color: 'info',
      //   textColor: 'white',
      //   icon: 'info',
      //   message: 'Envíos de Documentos por Whatsapp en Construcción',
      //   progress: true,
      //   actions: [{ icon: 'close', color: 'white' }]
      // })
      var reader
      const self = this
      if (!self.whatsapp) return
      if (!self.url_whatsapp) return
      // eslint-disable-next-line
      if (false) {
        self.$q.loading.show()
        reader = new FileReader()
        reader.readAsDataURL(self.document.output('blob'))
        reader.onloadend = function () {
          var base64data = reader.result
          let numero = self.whatsapp
          numero = '51' + numero
          numero = numero.substring(numero.length - 12)

          let docname = JSON.parse(JSON.stringify(self.document_name))
          if (docname.substr(docname.length - 4, 4) !== '.pdf') {
            docname += '.pdf'
          }

          // numero = '573022172231'
          // const urlPrueba = 'https://eu201.chat-api.com/instance220271/sendFile?token=vcakzo5e6pdm93em'
          // self.$axios.post(urlPrueba, {
          self.$axios.post(self.url_whatsapp, {
            phone: numero,
            body: base64data,
            filename: docname || 'ATENCION MEDICA.pdf'
          }, {
            headers: {
              'Content-Type': 'application/json'
            }
          }).then(res => {
            self.$q.loading.hide()
            if (res.data.sent) {
              self.$q.notify({
                color: 'positive',
                textColor: 'white',
                icon: 'check',
                message: 'Atención enviada al número ' + self.whatsapp,
                progress: true,
                actions: [{ icon: 'close', color: 'white' }]
              })
            }
            if (res.data.error && res.data.error !== '') {
              this.$q.notify({
                color: 'negative',
                textColor: 'white',
                icon: 'error',
                message: res.data.error,
                progress: true,
                actions: [{ icon: 'close', color: 'white' }]
              })
            }
          }).catch(() => {
            self.$q.loading.hide()
          })
        }
      } else {
        self.$q.notify({
          color: 'info',
          textColor: 'black',
          icon: 'info',
          message: 'Archivo encolado para ser enviado',
          progress: true,
          actions: [{ icon: 'close', color: 'black' }]
        })
        reader = new FileReader()
        reader.readAsDataURL(self.document.output('blob'))
        reader.onloadend = function () {
          var base64data = reader.result
          let numero = self.whatsapp
          numero = '51' + numero
          numero = numero.substring(numero.length - 12)

          let docname = JSON.parse(JSON.stringify(self.document_name))
          if (docname.substr(docname.length - 4, 4) !== '.pdf') {
            docname += '.pdf'
          }

          self.$store.dispatch('app/json', {
            MODELO: 'APICHAT',
            METODO: 'WHATSAPP',
            PARAMETROS: {
              NUMERO: numero,
              CUERPO: base64data,
              ENDPOINT: 'sendFile',
              NOMBREARCHIVO: docname || 'ATENCION MEDICA.pdf'
            }
          }, { root: true }).then(res => {
            if (res.data.res === 'ok') {
              self.$q.notify({
                color: 'positive',
                textColor: 'white',
                icon: 'check',
                message: 'Archivo enviado al número ' + self.whatsapp,
                progress: true,
                actions: [{ icon: 'close', color: 'white' }]
              })
            }
          }).catch(err => {
            console.error(err)
          })
        }
      }
    }
  },
  watch: {
    currentPage () {
      this.renderPage()
    },
    scale () {
      this.renderPage()
    },
    imprimirDialog (val) {
      this.loading = val
      if (val) {
        this.doc = this.document // await this.getHC();
        // eslint-disable-next-line
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          '@/statics/js/pdfjs/pdf.worker.js'
        var self = this

        var blob = self.doc.output('blob')
        self.url = URL.createObjectURL(blob)

        // eslint-disable-next-line
        var loadingTask = pdfjsLib.getDocument(self.url);
        loadingTask.promise.then(
          function (pdf) {
            self.pdf = pdf
            // Fetch the first page
            // var pageNumber = self.currentPage;
            self.numPages = pdf.numPages
            self.renderPage()
          },
          function (reason) {
            /* eslint no-console: ["error", { allow: ["error"] }] */
            console.error(reason)
            self.loading = false
          }
        )
        self.loadingTask = loadingTask
      } else {
        this.$emit('close', true)
      }
    }
  }
}
</script>
