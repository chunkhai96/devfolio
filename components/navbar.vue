<script lang="ts" setup>
interface NavbarItem {
  title: string,
  icon: string,
  link: string
}
const navbarItem: Array<NavbarItem> = [
  { title: 'Home', icon: 'home', link: '/' },
  { title: 'Contact', icon: 'contact', link: '/contact' }
]
</script>
<template>
  <div class="rounded-full h-15 flex py-4">
    <div v-for="item in navbarItem"
      class="py-2 px-4 rounded-full hover:cursor-pointer hover:bg-slate-800">
      {{ item.title }}
    </div>
  </div>
</template>