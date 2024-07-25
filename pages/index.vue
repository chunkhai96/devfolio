<script lang="ts" setup>
const landingSectionText = {
  title: 'Andy Pang',
  description: 'I solve problems through innovation using code.'
}
</script>
<template>
  <div class="bg-slate-900 text-slate-50">
    <div class="flex flex-col items-center h-screen">
      <div class="absolute w-full h-screen z-10">
        <div class="relatives w-full h-screen">
          <img src="/images/background.jpg"
            class="w-full h-full object-cover" />
          <div class="absolute bg-gradient-to-b from-slate-900/0 to-slate-900/100 h-[50vh] w-full bottom-0" />
        </div>
      </div>
      <!-- <img class="w-full h-full object-cover absolute -z-10"
        src="/images/background.jpg" /> -->
      <div class="z-20">
        <Navbar />
      </div>
      <div class="flex items-center justify-center grow w-full max-w-[1024px] p-4 z-20">
        <div class="flex flex-col grow gap-8">
          <h1 class="text-7xl">{{ landingSectionText.title }}</h1>
          <span class="text-2xl text-slate-400">{{ landingSectionText.description }}</span>
        </div>
        <div class="size-96 bg-gray-400 flex justify-center items-center">
          Image
        </div>
      </div>
    </div>
    <div class="flex items-center justify-center w-full">
      <div class="flex flex-row gap-4 w-full max-w-[1024px] gap-8">
        <div class="size-96 bg-gray-400 flex justify-center items-center">
          Image
        </div>
        <div class="flex flex-col justify-center w-full p-4 gap-4">
          <h2 class="text-5xl">
            What I Do
          </h2>
          <span class="text-2xl">
            Passionate Machine Learning Engineer | Full Stack Developer | Data Scientist
          </span>
          <div class="flex bg-blue-400">
            <div>Hello</div>
            <div>Hello</div>
            <div>Hello</div>
          </div>
          <div class="flex">
            <div>Hello</div>
          </div>
        </div>
      </div>
    </div>
  </div>  
</template>