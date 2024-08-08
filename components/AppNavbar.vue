<script lang="ts" setup>
interface NavbarItem {
  title: string,
  link: string
}
const navbarItem: Array<NavbarItem> = [
  { title: 'Home', link: '/#home' },
  { title: 'What I Do', link: '/#whatido' },
  { title: 'Projects', link: '/#project' },
  { title: 'Experience', link: '/#experience' },
  { title: 'Talks', link: '/#talk' },
  { title: 'Achievements', link: '/#achievement' },
  { title: 'Contact Me', link: '/#contactme' }
]

</script>
<template>
  <div class="rounded-full h-15 flex py-4 z-50">
    <PopupMenu class="md:hidden"
      :items="navbarItem" />
    <NuxtLink v-for="item in navbarItem"
      :to="item.link">
      <div class="hidden md:block py-2 px-4 rounded-full hover:cursor-pointer hover:bg-slate-800">
        {{ item.title }}
      </div>
    </NuxtLink>
  </div>
</template>