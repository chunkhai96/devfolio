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

const showMenu = ref<boolean>(false)
const dropdownMenuButton = ref<InstanceType<typeof HTMLElement>>()
const dropdownMenu = ref<InstanceType<typeof HTMLElement>>()
const toggleDropdown = () => {
  if (!showMenu.value) {
    showMenu.value = true
    window.setTimeout(() => dropdownMenu.value?.focus(), 0)
  } else {
    showMenu.value = false
  }
  dropdownMenu.value?.addEventListener('focusout', (event) => {
    window.setTimeout(() => showMenu.value = false, 0)
  })
}
</script>
<template>
  <div class="relative inline-block mx-2 text-left"> 
    <button class="size-12 rounded-full shadow hover:ring hover:ring-slate-400 focus:outline-none"
      ref="dropdownMenuButton"
      tabindex="0"
      @click="toggleDropdown">
      <fa :icon="faBars" />
    </button>
    <div class="origin-bottom absolute min-w-[12rem] right-0 shadow-lg py-2 bg-slate-700/80 backdrop-blur-md z-30 rounded-3xl"
      :class="{ 'hidden': !showMenu }"
      ref="dropdownMenu"
      id="dropdownMenuBottom"
      tabindex="1">
      <NuxtLink v-for="item in items"
        class="block px-4 py-2 hover:bg-slate-700 rounded-full"
        :href="item.link">
        {{ item.title }}
      </NuxtLink>
    </div>
  </div>
</template>