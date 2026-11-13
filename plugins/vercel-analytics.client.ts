import { inject } from '@vercel/analytics';
 
export default defineNuxtPlugin(() => {
  // the insights script only exists on Vercel deployments; skip local previews to avoid 404 noise
  if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) return
  inject();
});
