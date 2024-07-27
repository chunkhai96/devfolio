<script lang="ts" setup>
const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  }
})
</script>
<template>
  <div class="flex flex-col gap-4 items-center text-slate-400 transition duration-300 hover:text-indigo-300 hover:scale-110">
    <i class="text-5xl" :class="icon" ></i>
    <span class="text-xs">
      {{ props.text }}
    </span>
  </div>
</template>