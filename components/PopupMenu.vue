<script lang="ts" setup>
import type { PopupMenuItem } from '.'
import { faBars } from '@fortawesome/free-solid-svg-icons'

const props = defineProps({
  items: {
    type: Array<PopupMenuItem>,
    required: true
  }
})
const { items } = toRefs(props)

const dropdownMenu = ref<InstanceType<typeof HTMLElement>>()
const toggleDropdown = () => {
  console.log(dropdownMenu.value?.classList)
  if (dropdownMenu.value?.classList.contains('hidden')) {
    dropdownMenu.value?.classList.remove('hidden')
    dropdownMenu.value?.focus()
  } else {
    dropdownMenu.value?.classList.add('hidden')
  }
  dropdownMenu.value?.addEventListener('focusout', (event) => {
    dropdownMenu.value?.classList.add('hidden')
  })
}
</script>
<template>
  <div class="relative inline-block mx-2 text-left"> 
    <button class="size-12 rounded-full shadow hover:ring hover:ring-slate-400 focus:outline-none"
      @click="toggleDropdown">
      <fa :icon="faBars" />
    </button>
    <div class="hidden origin-bottom absolute right-0 w-56 shadow-lg bg-slate-700/80 backdrop-blur-md z-30 rounded-3xl focus:bg-blue-600"
      ref="dropdownMenu"
      id="dropdownMenuBottom"
      tabindex="0">
      <NuxtLink v-for="item in items"
        class="block px-4 py-2 hover:bg-slate-700 rounded-full"
        :href="item.link">
        {{ item.title }}
      </NuxtLink>
    </div>
  </div>
</template>