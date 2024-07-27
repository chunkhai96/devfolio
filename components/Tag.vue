<script lang="ts" setup>
const props = defineProps({
  text: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: ''
  }
})
const { text, size } = toRefs(props)
</script>
<template>
  <div class=" flex justify-center items-center w-full bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700 p-2">
    <span :class="size">
      {{ text }}
    </span>
  </div>
</template>