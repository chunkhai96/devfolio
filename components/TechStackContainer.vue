<script lang="ts" setup>
import type { IconDefinition } from '@fortawesome/fontawesome-common-types'

const props = defineProps({
  icon: {
    type: Object as () => IconDefinition,
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
    <fa class="text-5xl"
      :icon="props.icon" />
    <span class="text-xs">
      {{ props.text }}
    </span>
  </div>
</template>