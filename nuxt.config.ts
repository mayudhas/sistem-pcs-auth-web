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
    public: {
      authApiBase: process.env.NUXT_PUBLIC_AUTH_API_BASE || 'http://localhost:3001/api/v1'
    }
  },

  compatibilityDate: '2026-06-30'
})
