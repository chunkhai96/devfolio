<script lang="ts" setup>
const props = defineProps({
  label:{
    type: String,
    required: true
  },
  textSizeClass: {
    type: String,
  },
})
const { label, textSizeClass } = toRefs(props)
</script>
<template>
  <button class="py-2 px-4 rounded-full flex justify-center items-center border-2 border-slate-600 transition duration-300 hover:bg-slate-600">
    <span :class="[textSizeClass]">
      {{ label }}
    </span>
  </button>
</template>