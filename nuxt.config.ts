// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preload', href: '/atelier/poster.webp', as: 'image', type: 'image/webp', media: '(min-aspect-ratio: 1/1)' },
        { rel: 'preload', href: '/atelier/poster-portrait.webp', as: 'image', type: 'image/webp', media: '(max-aspect-ratio: 1/1)' },
      ],
      meta: [
        { name: 'theme-color', content: '#101419' },
      ],
    },
  },
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxtjs/seo'],
  runtimeConfig: {
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
  vite: {
    optimizeDeps: { include: ['three', 'postprocessing'] },
  },
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL,
    name: 'Andy Pang - Devfolio',
    description: 'Welcome to the online portfolio of Andy Pang (aka Pang Chun Khai), a passionate machine learning engineer, software engineer and data scientist dedicated to creating cutting-edge solutions. Explore his projects and experiences in machine learning, AI development, and innovative technology.',
    defaultLocale: 'en',
    indexable: process.env.NUXT_SITE_ENV === 'production'
  }
})
