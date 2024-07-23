<script lang="ts" setup>
</script>
<template>
  <div class="flex flex-col items-center h-screen bg-cover bg-center bg-blend-darken text-slate-50"
    style="background-image: url('/images/background.jpg');">
    <div clsss="bg-blue-400">
      <Navbar />
    </div>
    <div class="flex items-center justify-center grow w-full max-w-[1024px] p-4">
      <div class="flex flex-col grow gap-8">
        <h1 class="text-7xl">Title</h1>
        <span class="text-3xl">Description</span>
      </div>
      <div class="size-96 bg-gray-400"></div>
    </div>
  </div>
  <div>
    <div class="flex bg-blue-400">
      <div>Hello</div>
      <div>Hello</div>
      <div>Hello</div>
    </div>
    <div class="flex">
      <div>Hello</div>
    </div>
  </div>
</template>