<template>
  <div>
    <q-stepper
      v-model="step"
      vertical
      color="primary"
      animated
    >
      <q-step
        :name="1"
        title="Documento a Firmar"
        icon="document"
        :done="step > 1"
      >
        <div v-if="step===1 && src">
          <pdf
            v-for="i in numPages"
            :key="i"
            :src="src"
            :page="i"
            style="display: inline-block; width: 25%"
            class="q-pa-md"
            ref="documento"
          ></pdf>
        </div>
        <q-stepper-navigation>
          <q-btn @click="step = 2" color="primary" label="Siguiente" />
        </q-stepper-navigation>
      </q-step>

      <q-step
        :name="2"
        title="Firmar el Documento"
        caption="Capturar la Firma"
        icon="create_new_folder"
        :done="step > 2"
      >
        <FirmaComponent @image="onFirmar" titulo="Traza tu firma" ref="firma"></FirmaComponent>

        <q-stepper-navigation>
          <q-btn @click="step = 3" color="primary" label="Siguiente" :disable="firma===null"/>
          <q-btn flat @click="step = 1" color="primary" label="Regresar" class="q-ml-sm" />
        </q-stepper-navigation>
      </q-step>

      <q-step
        :name="3"
        title="Documento Firmado"
        icon="preview"
      >
        <div v-if="src">
          <pdf
            v-for="i in numPages"
            :key="i"
            :src="src"
            :page="i"
            style="display: inline-block; width: 25%"
            class="q-pa-md"
            ref="documento"
          ></pdf>
        </div>

        <q-stepper-navigation>
          <q-btn color="primary" label="Guardar" @click="onGuardarPDF"/>
          <q-btn flat @click="step = 2" color="primary" label="Back" class="q-ml-sm" />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </div>
</template>

<script>
import { PDFDocument } from 'pdf-lib'
import FirmaComponent from '@/components/app/FirmaComponent'
import pdf from 'vue-pdf'
export default {
  props: {
    urlArchivoPDF: {
      type: String,
      required: true
    },
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    },
    scale: {
      type: Number,
      required: true
    },
    numPaginas: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      src: null,
      numPages: 0,
      step: 0,
      firma: null,
      pdfBytes: null
    }
  },
  mounted () {
    setTimeout(() => {
      this.step = 1
    }, 200)
  },
  methods: {
    async modifyPdf () {
      this.src = null
      this.pdfBytes = null
      let url = this.urlArchivoPDF

      try {
        const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())

        const pdfDoc = await PDFDocument.load(existingPdfBytes)

        const pages = pdfDoc.getPages()

        // #region Firmar Documentos
        const pngImageBytes = await this.firma.blob.arrayBuffer()
        const pngImage = await pdfDoc.embedPng(pngImageBytes)
        // const pngDims = pngImage.scale(1)
        // console.log(pages[0].getHeight()) // Alto
        // console.log(pages[0].getWidth()) // Ancho
        // ***************************************************
        // const pngDims = pngImage.scale(0.3)
        // const x = 400
        // const y = 100
        const pngDims = pngImage.scale(this.scale)
        const x = this.x
        const y = this.y
        const paginas = this.numPaginas.split(',')
        let firmarSoloUltima = false
        let firmarTodas = false
        paginas.forEach(el => {
          if (el * 1 === 0) {
            firmarTodas = true
          }
          if (el * 1 === -1) {
            firmarSoloUltima = true
          }
        })
        // ***************************************************
        let i = 0
        pages.forEach(page => {
          i++
          if (firmarTodas) {
            page.drawImage(pngImage, {
              x,
              y,
              width: pngDims.width,
              height: pngDims.height
            })
          } else {
            if (firmarSoloUltima) {
              if (i === pages.length) {
                page.drawImage(pngImage, {
                  x,
                  y,
                  width: pngDims.width,
                  height: pngDims.height
                })
              }
            } else {
              if (paginas.filter(p => p * 1 === i * 1).length > 0) {
                page.drawImage(pngImage, {
                  x,
                  y,
                  width: pngDims.width,
                  height: pngDims.height
                })
              }
            }
          }
        })
        // #endregion

        this.pdfBytes = await pdfDoc.save()
        const blob = new Blob([this.pdfBytes])
        url = window.URL.createObjectURL(blob)
        this.src = pdf.createLoadingTask(url)
        this.src.promise.then(pdf => {
          this.numPages = pdf.numPages
        })
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          textColor: 'white',
          icon: 'error',
          message: err,
          progress: true,
          actions: [{ icon: 'close', color: 'white' }]
        })
      }
    },
    onFirmar (imageFirma) {
      this.firma = imageFirma
      this.step = 3
    },
    onGuardarPDF () {
      var arrayBuffer = this.pdfBytes.buffer
      var blob = new Blob([arrayBuffer], { type: 'application/pdf' })
      this.$emit('archivoFirmado', blob)
    }
  },
  components: {
    pdf, FirmaComponent
  },
  watch: {
    step (val) {
      if (val === 1) {
        this.src = pdf.createLoadingTask(this.urlArchivoPDF)
        this.src.promise.then(pdf => {
          this.numPages = pdf.numPages
        })
        this.pdfBytes = null
        this.firma = null
      }
      if (val === 2) {
        this.firma = null
        this.pdfBytes = null
        setTimeout(() => {
          this.$refs.firma.setFirmar(true)
        }, 200)
      }
      if (val === 3) {
        this.modifyPdf()
      }
    }
  }
}
</script>
