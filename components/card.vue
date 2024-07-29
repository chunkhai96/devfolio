<script lang="ts" setup>
</script>
<template>
  <div class="w-full bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700">
    <slot name="imgHeader"></slot>
    <div class="flex flex-col gap-2 h-full w-full p-4">
      <div><slot name="header"></slot></div>
      <div><slot name="content"></slot></div>
      <div><slot name="footer"></slot></div>
    </div>
  </div>
</template>