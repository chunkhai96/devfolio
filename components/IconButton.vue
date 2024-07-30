<script lang="ts" setup>
const props = defineProps({
  icon: {
    type: String
  },
})
const { icon } = toRefs(props)
</script>
<template>
  <button class="bg-slate-500 hover:bg-slate-700 text-white font-bold size-12 p-2 rounded-full">
    <i class="text-3xl" :class="icon"></i>
  </button>
</template>