// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css', 'devicon/devicon.min.css'],
  modules: ['@vesp/nuxt-fontawesome', "nuxt-marquee"],
  runtimeConfig:{
    public: {
      web3FormAccessKey: ''
    }
  },
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
      solid: ['calendar-alt']
    }
  }
})