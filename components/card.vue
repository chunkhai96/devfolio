<script lang="ts" setup>
</script>
<template>
  <div class="w-full bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700">
    <slot name="imgHeader"></slot>
    <div class="flex flex-col gap-4 p-8">
      <slot name="header"></slot>
      <slot name="content"></slot>
      <slot name="footer"></slot>
    </div>
  </div>
</template>