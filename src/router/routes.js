
const routes = [
  {
    path: '/',
    component: () => import('layouts/AppLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/Index.vue'),
        meta: { requiresAuth: true },
        name: 'home'
      },
      {
        path: 'configuracion',
        component: () => import('pages/configuracion/ConfiguracionPage.vue'),
        meta: { requiresAuth: true },
        name: 'logistica.configuracion'
      }
    ]
  },
  {
    path: '/autenticarse',
    component: () => import('layouts/AppLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/seguridad/IngresarPage.vue'),
        name: 'ingresar',
        meta: { menu_oculto: true }
      }
    ]
  }
]
// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
