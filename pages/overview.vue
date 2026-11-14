<script lang="ts" setup>
useSeoMeta({
  title: 'Andy Pang | Portfolio, Projects & Experience',
  description: 'Projects, capabilities, experience, talks, certifications and contact details for Andy Pang (Pang Chun Khai), machine learning engineer.',
})
useHead({ titleTemplate: '%s' })
</script>
<template>
  <div class="overview">
    <nav aria-label="Skip links"><a href="#doc-name" class="skip-link">Skip to content</a></nav>
    <SiteHeader mode="document" />
    <main>
      <PortfolioDocument />
    </main>
  </div>
</template>
<style scoped>
.overview { min-height: 100vh; background: linear-gradient(180deg, #121820 0%, var(--ink) 480px); }
.overview :deep(.site-header) { background: linear-gradient(180deg, rgba(16, 20, 25, 0.92), rgba(16, 20, 25, 0)); }
</style>
