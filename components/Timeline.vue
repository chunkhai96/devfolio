<script lang="ts" setup>
import {
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons'
import type { TimelineItem } from '.'

const props = defineProps({
  items: {
    type: Array<TimelineItem>,
    required: true
  }
})
const { items } = toRefs(props)

</script>
<template>
  <ol class="relative border-s border-gray-700">                  
    <li v-for="item in items"
      class="mb-10 ms-12">  
      <span class="absolute flex items-center justify-center size-12 rounded-full -start-6 ring-8 ring-gray-900 bg-blue-900">
          <fa :icon="faCalendarAlt" />
      </span>
      <Card>
        <template #header>
          <h3 class="text-xl">
            {{ item.title }}
          </h3>
        </template>
        <template #content>
          <div class="flex flex-col gap-2">
            <div class="flex flex-col md:flex-row gap-2 text-sm text-slate-400">
              <span>{{ item.company }}</span>
              <span class="hidden md:contents"> • </span>
              <span>{{ item.duration }}</span>
            </div>
            <p>
              {{ item.description }}
            </p>
          </div>
        </template>
      </Card>
    </li>
  </ol>
</template>