// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Secret server-only keys (tidak diekspos ke client browser)
    authServiceInternalUrl: process.env.AUTH_SERVICE_INTERNAL_URL,
    public: {}
  },

  compatibilityDate: '2026-06-30'
})
