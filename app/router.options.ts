import type { RouterConfig } from '@nuxt/schema'

// The atelier stores its location in the hash (#work/devfolio); never treat it as a scroll target.
export default <RouterConfig>{
  scrollBehavior(to, _from, saved) {
    if (saved) return saved
    if (to.hash && /^#[A-Za-z][\w-]*$/.test(to.hash) && to.path !== '/') return { el: to.hash, top: 80 }
    return { top: 0 }
  },
}
