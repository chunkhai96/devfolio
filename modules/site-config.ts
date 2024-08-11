import { installNuxtSiteConfig, updateSiteConfig } from 'nuxt-site-config-kit'
import { defineNuxtModule } from 'nuxt/kit'

export default defineNuxtModule({
  // ...
  async setup(options) {
    await installNuxtSiteConfig()

    // Optional: set some site config from your modules options
    // This is not recommended, only to keep supporting your modules options
    updateSiteConfig({
      _context: 'site-config',
      url: options.siteUrl,
    })
  }
})
