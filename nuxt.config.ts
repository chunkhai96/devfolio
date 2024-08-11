// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
    },
  },
  devtools: { enabled: true },
  css: ['~/assets/css/main.css', 'devicon/devicon.min.css'],
  modules: ['@vesp/nuxt-fontawesome', "nuxt-marquee", "@nuxtjs/seo"],
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
    suffix: false
  },
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL,
    name: 'Andy Pang - Devfolio',
    description: 'Welcome to the online portfolio of Andy Pang (aka Pang Chun Khai), a passionate machine learning engineer, software engineer and data scientist dedicated to creating cutting-edge solutions. Explore his projects and experiences in machine learning, AI development, and innovative technology.',
    defaultLocale: 'en',
    indexable: process.env.NUXT_SITE_ENV === 'production'
  }
})