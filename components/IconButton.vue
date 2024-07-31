<script lang="ts" setup>
import type {
  IconDefinition
} from '@fortawesome/free-solid-svg-icons'

const props = defineProps({
  devicon: {
    type: String
  },
  src: {
    type: String
  },
  fontawesome: {
    type: Object as ()=> IconDefinition
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
const { devicon, src, fontawesome, color, textColor } = toRefs(props)
</script>
<template>
  <button class="font-bold size-12 rounded-full flex justify-center items-center transition duration-300 hover:scale-110"
    :class="[color, textColor]">
    <i v-if="devicon" class="p-2 text-2xl" :class="devicon"></i>
    <img v-else-if="src" class="text-2xl" :src="src" />
    <fa v-else-if="fontawesome" :icon="fontawesome" class="text-2xl" />
  </button>
</template>