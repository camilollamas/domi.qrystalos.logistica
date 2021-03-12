<template>
  <q-page class="flex flex-center">
    <!-- <img alt="Quasar logo" src="~assets/quasar-logo-full.svg" /> -->
    <img alt="Qrystalos" src="~assets/icons/Qrystalos.png" v-if="!logo" />
    <img alt="" :src="logo" ref="logo" id="logo" width="300px" v-else/>
  </q-page>
</template>

<script>
export default {
  name: 'IndexPage',
  data () {
    return {
      logo: null
    }
  },
  mounted () {
    this.$store.dispatch(
      'app/fetchMenu',
      { PAGINA: 'LOGISTICA' },
      { root: true }
    )

    try {
      if (this.$store.state.app.logo) {
        this.logo = 'data:image/png;base64,' + this.$store.state.app.logo
      }
    } catch (ex) {
      console.error(ex)
      this.logo = null
    }
  }
}
</script>
