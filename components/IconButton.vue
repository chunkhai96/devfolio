<script lang="ts" setup>
const props = defineProps({
  icon: {
    type: String
  },
  src: {
    type: String
  },
  color: {
    type: String,
    default: 'bg-slate-500'
  },
  textColor: {
    type: String,
    default: 'text-white'
  }
})
const { icon } = toRefs(props)
</script>
<template>
  <button class="font-bold size-12 rounded-full flex justify-center items-center transition duration-300 hover:scale-110"
    :class="[color, textColor]">
    <i v-if="icon" class="p-2 text-2xl" :class="icon"></i>
    <img v-else-if="src" class="text-2xl" :src="src" />
  </button>
</template>