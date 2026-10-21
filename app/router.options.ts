import type { RouterConfig } from '@nuxt/schema'

export default {
  routes: (_routes) => [
    ..._routes,
    {
      name: 'admin',
      path: '/admin',
      redirect: '/admin/apps'
    }
  ]
} satisfies RouterConfig
