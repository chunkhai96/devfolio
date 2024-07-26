// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['@vesp/nuxt-fontawesome'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  fontawesome: {
    component: 'fa',
    suffix: false,
    icons: {
      brands: ['square-js']
    }
  }
})
