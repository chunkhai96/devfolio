<script lang="ts" setup>
const props = defineProps({
  label:{
    type: String,
    required: true
  },
  textSizeClass: {
    type: String,
  },
  backgroundColor: {
    type: String
  },
  hoverColor: {
    type: String,
    default: 'hover:bg-slate-600'
  },
  borderColor: {
    type: String,
    default: 'border-slate-600'
  }
})
const { label, textSizeClass } = toRefs(props)
</script>
<template>
  <button class="py-2 px-4 rounded-full flex justify-center items-center border-2 transition duration-300"
    :class="[borderColor, backgroundColor, hoverColor]">
    <span :class="[textSizeClass]">
      {{ label }}
    </span>
  </button>
</template>