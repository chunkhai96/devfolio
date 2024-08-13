<script lang="ts" setup>
interface NavbarItem {
  title: string,
  link: string,
  target: string
}
const navbarItem: Array<NavbarItem> = [
  { title: 'Home', link: '/#home', target: '_self' },
  { title: 'What I Do', link: '/#whatido', target: '_self' },
  { title: 'Projects', link: '/#project', target: '_self' },
  { title: 'Experience', link: '/#experience', target: '_self' },
  { title: 'Talks', link: '/#talk', target: '_self' },
  { title: 'Achievements', link: '/#achievement', target: '_self' },
  { title: 'Contact Me', link: '/#contactme', target: '_self' },
  { title: 'Resume', link: 'https://drive.google.com/file/d/1hWBVXXyK6ykCb8c82DddwkF0XtBQGswn/view?usp=sharing', target: '_blank' }
]

</script>
<template>
  <div class="rounded-full h-15 flex py-4 z-50">
    <PopupMenu class="lg:hidden"
      :items="navbarItem" />
    <NuxtLink v-for="item in navbarItem"
      :to="item.link"
      :target="item.target">
      <div class="hidden lg:block py-2 px-4 rounded-full hover:cursor-pointer hover:bg-slate-800">
        {{ item.title }}
      </div>
    </NuxtLink>
  </div>
</template>