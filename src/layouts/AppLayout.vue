<template>
  <div>
    <q-layout view="hHh Lpr lFf" class="shadow-2 rounded-borders">
      <q-drawer v-model="left" side="left" bordered v-if="isLogged && false">
        <!-- <VideoChatComponent /> -->
        <!-- <JitsiComponent /> -->
      </q-drawer>

      <q-header
        elevated
        style="background: radial-gradient(circle, #35a2ff 0%, #014a88 100%)"
      >
        <q-slide-transition>
          <q-bar
            v-if="
              !$store.state.auth.is_logged ||
                $router.currentRoute.name === 'home'
            "
          >
            <q-icon name="bike_scooter" />
            <div>Logística</div>

            <q-space />

            <q-btn
              dense
              flat
              icon="close"
              @click="goAppOffline"
              v-if="$router.currentRoute.name !== 'ingresar'"
            />
          </q-bar>
        </q-slide-transition>
        <q-slide-transition>
          <div class="q-pa-sm q-pl-md row items-center" v-if="menu">
            <div class="cursor-pointer non-selectable">
              Archivo
              <q-menu>
                <q-list dense style="min-width: 100px">
                  <q-item clickable v-close-popup>
                    <q-item-section @click="go('home')">Inicio</q-item-section>
                  </q-item>
                  <!-- <q-separator /> -->
                  <!-- <q-item>
                    <q-item-section>{{dbName}}</q-item-section>
                  </q-item> -->
                  <q-item clickable v-close-popup v-if="false">
                    <q-item-section>New</q-item-section>
                  </q-item>

                  <q-separator v-if="false" />

                  <q-item clickable v-if="false">
                    <q-item-section>Preferences</q-item-section>
                    <q-item-section side>
                      <q-icon name="keyboard_arrow_right" />
                    </q-item-section>

                    <q-menu anchor="top right" self="top left">
                      <q-list>
                        <q-item v-for="n in 3" :key="n" dense clickable>
                          <q-item-section>Submenu Label</q-item-section>
                          <q-item-section side>
                            <q-icon name="keyboard_arrow_right" />
                          </q-item-section>
                          <q-menu auto-close anchor="top right" self="top left">
                            <q-list>
                              <q-item v-for="n in 3" :key="n" dense clickable>
                                <q-item-section>3rd level Label</q-item-section>
                              </q-item>
                            </q-list>
                          </q-menu>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-item>

                  <q-separator />

                  <q-item clickable @click="logOut">
                    <q-item-section>Cerrar Sesión</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </div>

            <div class="q-ml-md cursor-pointer non-selectable" v-if="false">
              Edit
              <q-menu auto-close>
                <q-list dense style="min-width: 100px">
                  <q-item clickable>
                    <q-item-section>Cut</q-item-section>
                  </q-item>
                  <q-item clickable>
                    <q-item-section>Copy</q-item-section>
                  </q-item>
                  <q-item clickable>
                    <q-item-section>Paste</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable>
                    <q-item-section>Select All</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </div>

            <div
              class="q-ml-md cursor-pointer"
              v-for="(menu, i) in individuales"
              :key="i"
              @click="go(menu.RUTA)"
            >
              <q-icon :name="menu.ICONO" v-if="menu.ICONO" />
              {{ menu.LABEL }}
            </div>
            <!-- <q-space /> -->
            <div
              class="cursor-pointer q-ml-md non-selectable"
              v-for="(m, a_i) in agrupados"
              :key="a_i + 100"
            >
              <q-icon :name="`${m.ICONO}`" v-if="m.ICONO" />
              {{ m.SUBLABEL }}
              <q-menu>
                <q-list
                  dense
                  style="min-width: 100px"
                  v-for="(sm, s_i) in submenus.filter(
                    x => x.CODIGOPADRE == m.CODIGO
                  )"
                  :key="s_i"
                >
                  <q-separator v-if="sm.SEPARADOR || sm.SEPARADOR === 1" />

                  <q-item clickable v-close-popup @click="go(sm.RUTA)">
                    <q-item-section avatar v-if="sm.ICONO">
                      <!-- <q-avatar :icon="`${sm.ICONO}`" /> -->
                      <q-icon :name="sm.ICONO" color="black" size="16px" />
                    </q-item-section>
                    <q-item-section v-html="sm.SUBLABEL"></q-item-section>
                  </q-item>
                  <!-- <q-item clickable v-close-popup>
                    <q-item-section>New</q-item-section>
                  </q-item> -->

                  <!-- <q-item clickable>
                    <q-item-section>Preferences</q-item-section>
                    <q-item-section side>
                      <q-icon name="keyboard_arrow_right" />
                    </q-item-section>

                    <q-menu anchor="top right" self="top left">
                      <q-list>
                        <q-item v-for="n in 3" :key="n" dense clickable>
                          <q-item-section>Submenu Label</q-item-section>
                          <q-item-section side>
                            <q-icon name="keyboard_arrow_right" />
                          </q-item-section>
                          <q-menu auto-close anchor="top right" self="top left">
                            <q-list>
                              <q-item v-for="n in 3" :key="n" dense clickable>
                                <q-item-section>3rd level Label</q-item-section>
                              </q-item>
                            </q-list>
                          </q-menu>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-item> -->
                </q-list>
              </q-menu>
            </div>

            <!-- <span class="md">{{ dbName }}</span> -->
            <div class="q-ml-md cursor-pointer non-selectable" v-if="false">
              <q-btn
                @click="$q.fullscreen.toggle()"
                :icon="
                  $q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'
                "
                :label="
                  $q.fullscreen.isActive
                    ? 'Pantalla Normal'
                    : 'Pantalla Completa'
                "
                size="sm"
                flat
              />
            </div>
            <div class="q-ml-md cursor-pointer non-selectable" v-if="false">
              Edit
              <q-menu auto-close>
                <q-list dense style="min-width: 100px">
                  <q-item clickable>
                    <q-item-section>Cut</q-item-section>
                  </q-item>
                  <q-item clickable>
                    <q-item-section>Copy</q-item-section>
                  </q-item>
                  <q-item clickable>
                    <q-item-section>Paste</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable>
                    <q-item-section>Select All</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </div>
          </div>
        </q-slide-transition>

      </q-header>
      <q-page-container>
        <q-page>

          <transition
            appear
            enter-active-class="animated bounceInLeft"
            leave-active-class="animated bounceOutRight"
          >
            <router-view />
          </transition>
        </q-page>
      </q-page-container>

    </q-layout>
  </div>
</template>

<script>
// import VideoChatComponent from '@/components/app/VideoChatComponent'
// import JitsiComponent from '@/components/app/JitsiComponent'
import { mapGetters } from 'vuex'
// import { openURL } from 'quasar'
// import AvatarComponent from '@/components/kasis/AvatarComponent'
// import postscribe from 'postscribe'
export default {
  data () {
    return {
      menu: true, // Determina si el menú permanece oculto
      left: false,
      cargandoScript: true,
      // dbName: '',
      seamless: false,
      telellamadaSiempreActiva: false
    }
  },
  mounted () {
    setTimeout(() => {
      // this.dbName = this.$store.state.auth.usuario
      //   ? this.$store.state.auth.usuario.DB_NAME
      //   : ''
      // postscribe('#siteseal', '<script async type="text/javascript" src="https://seal.godaddy.com/getSeal?sealID=N731jIYaqTC7ihg30K3O5sxMzSnBBTHnWwJyWIv0XlTyHnBzOMvwhhEB70aw" />', {
      //   done: function () {
      //     this.cargandoScript = false
      //     console.log('Script Cargado')
      //   }
      // })
      this.$store.commit('app/setApiUrl', process.env.BASE_URL, { root: true })
      this.$store.commit('app/setUrlMenuCentral', process.env.URL_MENUCENTRAL, { root: true })
    }, 10)
    this.$q.loading.hide()
    this.menu = !(this.$route.meta && this.$route.meta.menu_oculto)
    if (!this.isLogged) {
      this.left = false
    }
  },
  watch: {
    $route () {
      this.menu = !(this.$route.meta && this.$route.meta.menu_oculto)
    }
  },
  components: {
    // VideoChatComponent
    // JitsiComponent,
    // AvatarComponent
  },
  computed: {
    ...mapGetters('app', ['urlMenuCentral']),
    usuario () {
      return this.$store.state.auth.usuario
    },
    isLogged () {
      return this.$store.state.auth.is_logged
    },
    menus () {
      return this.$store.state.app.menu
    },
    individuales () {
      if (!this.menus) return []
      if (!this.menus.individuales) return []
      return this.menus.individuales
    },
    agrupados () {
      if (!this.menus) return []
      if (!this.menus.agrupados) return []
      return this.menus.agrupados
    },
    submenus () {
      if (!this.menus) return []
      if (!this.menus.submenus) return []
      return this.menus.submenus
    },
    dbName () {
      return this.$store.state.auth.usuario
        ? this.$store.state.auth.usuario.DB_NAME
        : ''
    }
  },
  methods: {
    logOut () {
      this.$store.commit('auth/setLogout', true, { root: true })
      this.go('ingresar')
    },
    go (routeName) {
      if (this.$router.currentRoute.name !== routeName) {
        this.$router.push({ name: routeName })
      }
    },
    goAppOffline () {
      window.location = this.urlMenuCentral
    }
  }
}
</script>
