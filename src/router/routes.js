const routes = [
  {
    path: '',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      // Main Route
      { path: '/', component: () => import('pages/Index.vue') },

      // Identity Routes
      { path: '/identity/create', component: () => import('pages/identity/Create.vue') },
      { path: '/identity/import', component: () => import('pages/identity/Import.vue') },
      { path: '/identity/edit/:identity', component: () => import('pages/identity/Edit.vue') },

      // Auth Routes
      { path: '/auth', component: () => import('pages/auth/Index.vue') },
      { path: '/auth/:identity', component: () => import('pages/auth/Authorize.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
