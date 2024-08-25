<script lang="ts" setup>
import { Vue3Lottie } from 'vue3-lottie'
import whatidoLottie from '~/assets/lotties/whatido.json'
import experienceLottie from '~/assets/lotties/experience.json'
import { faForward } from '@fortawesome/free-solid-svg-icons'
import * as landingData from '@/data/landing'
import * as whatidoData from '@/data/whatido'
import * as projectData from '@/data/project'
import * as experienceData from '@/data/experience'
import * as talkData from '@/data/talk'
import * as achievementData from '@/data/achievement'
import * as contactData from '@/data/contact'

interface Web3FormResponse {
  success: boolean,
  message: string
}

const config = useRuntimeConfig()

// Achievements Marquee Speed
const marqueeSpeed = ref<number>(50)

// Contact Me Section
const contactMeSectionText = {
  title: 'Contact Me',
  description: 'I\'d love to connect! Reach out for questions, collaborations, or a chat.'
}
const form = ref({
  access_key: config.public.web3FormAccessKey,
  subject: 'New Submission from andypangdev.com',
  name: '',
  email: '',
  message: '',

})
const formError = ref({
  name: '',
  email: '',
  message: '',
})
const result = ref<string>('');
const status = ref<string>('');
const submitForm = async () => {
  if (hasError()) return
  result.value = "Please wait...";
  try {
    const response = await $fetch<Web3FormResponse>('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: form.value,
    })
    if (response.success) {
      status.value = 'success'
      result.value = response.message
    } else {
      console.error(response); // Log for debugging, can be removed
      status.value = 'error';
      result.value = 'Something went wrong!'
    }
  } catch (error) {
    console.error(error); // Log for debugging, can be removed
    status.value = 'error'
    result.value = 'Something went wrong!'
  } finally {
    // Reset form after submission
    form.value.name = ''
    form.value.email = ''
    form.value.message = ''

    // Clear result and status after 5 seconds
    setTimeout(() => {
      result.value = ''
      status.value = ''
    }, 5000)
  }
}
const hasError = (): boolean => {
  if (form.value.name === '') {
    formError.value.name = 'Name is required'
  }
  if (form.value.email === '') {
    formError.value.email = 'Email is required'
  }
  if (form.value.message === '') {
    formError.value.message = 'Message is required'
  }
  return form.value.name === '' || form.value.email === '' || form.value.message === ''
}

</script>
<template>
  <div class="bg-slate-900 text-slate-50">
    <div id="home"
      class="flex flex-col items-center h-screen">
      <div class="absolute w-full h-screen z-10">
        <div class="relatives w-full h-screen">
          <img src="/images/background.webp"
            alt="Background"
            class="w-full h-full object-cover" />
          <div class="absolute bg-gradient-to-b from-slate-900/0 to-slate-900/100 h-[50vh] w-full bottom-0"></div>
        </div>
      </div>
      <div class="flex justify-end lg:justify-center w-full z-30">
        <AppNavbar />
      </div>
      <div class="flex items-center justify-center grow w-full max-w-[1240px] p-8 mb-36 lg:mb-40 z-20">
        <div class="flex flex-col-reverse lg:flex-row justify-center items-center grow h-[28rem] gap-12">
          <div class="flex flex-col gap-8 h-full">
            <h1 class="grow flex items-end justify-center text-5xl lg:text-7xl lg:justify-start mt-0 lg:mt-24">
              {{ landingData.title }}
            </h1>
            <span class="sm:text-2xl text-slate-400 text-center lg:text-left typing-effect">
              {{ landingData.description }}
            </span>
            <!-- <div class="flex grow items-end justify-center lg:justify-start">
              <Button label="Get Resume" />
            </div> -->
            <div class="flex flex-col grow justify-end lg:items-start gap-8">
              <div class="flex items-end justify-center lg:justify-start">
                <NuxtLink :to="landingData.resumeSrc"
                  target="_blank">
                  <Button label="Get My Resume" />
                </NuxtLink>
              </div>
              <div class="flex flex-wrap items-end gap-4 justify-center lg:justify-start">
                <NuxtLink v-for="link in contactData.externalLinks"
                  :to="link.url"
                  target="_blank">
                  <IconButton
                    :devicon="link.devicon"
                    :fontawesome="link.fontawesome"
                    :color="link.color"
                    :title="link.label" />
                </NuxtLink>
              </div>
            </div>
          </div>
          <div class="flex grow justify-end">
            <div class="size-[16rem] lg:size-[26rem] xl:size-[32rem] flex-shrink-0 mt-12 lg:mt-0">
              <img class="rounded-full object-cover"
                :src="landingData.profilePictureSrc"
                alt="Avatar"/>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-col items-center justify-center w-full gap-36 p-8">
      <div v-if="whatidoData.show"
        id="whatido"
        class="flex flex-col-reverse lg:flex-row h-full w-full max-w-[1240px] items-center">
        <client-only>
          <Vue3Lottie
            width="80%"
            :animationData="whatidoLottie"
          />
        </client-only>
        <div class="flex flex-col justify-between w-full p-4 gap-8">
          <h2 class="text-4xl md:text-5xl text-center lg:text-left">
            {{ whatidoData.title }}
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 justify-between gap-8">
            <Tag v-for="role in whatidoData.roles"
              :text="role" />
          </div>
          <div class="flex flex-wrap gap-8 justify-center">
            <TechStackContainer v-for="item in whatidoData.techStackItems"
              :icon="item.icon"
              :text="item.text" />
          </div>
          <ul class="text-slate-400 space-y-4">
            <li v-for="subtitle in whatidoData.keyPoints"
              class="text-center lg:text-left">
              {{ subtitle }}
            </li>
          </ul>
        </div>
      </div>
      <div v-if="projectData.show"
        id="project"
        class="flex flex-col items-center justify-center w-full max-w-[1240px] gap-12">
        <h2 class="text-4xl md:text-5xl text-center md:text-left">
          {{ projectData.title }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 h-full w-full items-center">
          <Card v-for="project in projectData.projectItems"
            class="shadow-lg transition duration-300 hover:shadow-blue-800/50">
            <template #imgHeader>
              <img class="w-full h-40 object-cover rounded-t-3xl"
                :alt="project.title"
                :src="project.imageSrc" />
            </template>
            <template #header>
              {{ project.title }}
            </template>
            <template #content>
              <span class="text-slate-400 text-sm">{{ project.description }}</span>
            </template>
            <template #footer>
              <div class="flex gap-4 mt-4">
                <NuxtLink v-if="project.codeLink"
                  target="_blank"
                  :to="project.codeLink">
                  <Button label="Code" :textSizeClass="'text-sm'"></Button>
                </NuxtLink>
                <NuxtLink v-if="project.liveLink"
                  target="_blank"
                  :to="project.liveLink">
                  <Button label="Preview" :textSizeClass="'text-sm'"></Button>
                </NuxtLink>
              </div>
            </template>
          </Card>
        </div>
      </div>
      <div v-if="experienceData.show"
        id="experience"
        class="flex flex-col items-center justify-center w-full max-w-[1240px] gap-12">
        <h2 class="text-4xl md:text-5xl text-center">
          {{ experienceData.title }}
        </h2>
        <div class="flex flex-col md:flex-row gap-12 h-full w-full items-center">
          <client-only>
            <Vue3Lottie
              width="80"
              :animationData="experienceLottie"
            />
          </client-only>
          <ExperienceTimeline :items="experienceData.timelineItems" />
        </div>
      </div>
      <div v-if="talkData.show"
        id="talk"
        class="flex flex-col items-center justify-center w-full max-w-[1240px] gap-12">
        <h2 class="text-4xl md:text-5xl text-center md:text-left">
          {{ talkData.title }}
        </h2>
        <div class="flex flex-wrap justify-center gap-12 h-full w-full items-center">
          <Card v-for="talk in talkData.talkItems"
            class="w-full md:w-1/2 lg:w-1/3 shadow-lg transition duration-300 hover:shadow-blue-800/50">
            <template #imgHeader>
              <img class="w-full h-40 object-cover rounded-t-3xl"
                :alt="talk.title"
                :src="talk.imageSrc" />
            </template>
            <template #header>
              {{ talk.title }}
            </template>
            <template #footer>
              <div class="flex gap-4 mt-4">
                <NuxtLink v-if="talk.youtube"
                  target="_blank"
                  :to="talk.youtube">
                  <Button label="YouTube" :textSizeClass="'text-sm'"></Button>
                </NuxtLink>
                <NuxtLink v-if="talk.slide"
                  target="_blank"
                  :to="talk.slide">
                  <Button label="Slide" :textSizeClass="'text-sm'"></Button>
                </NuxtLink>
              </div>
            </template>
          </Card>
        </div>
      </div>
      <div v-if="achievementData.show"
        id="achievement"
        class="flex flex-col items-center justify-center w-full max-w-[1240px]">
        <h2 class="text-4xl md:text-5xl text-center">
          {{ achievementData.title }}
        </h2>
        <NuxtMarquee class="overflow-hidden"
          :pauseOnHover="true"
          :speed="marqueeSpeed">
          <NuxtLink v-for="achievement in achievementData.achievementItems"
            target="_blank"
            :to="achievement.link">
            <Card class="h-[19rem] my-12 mr-12 shadow-lg transition duration-300 hover:scale-105 hover:shadow-blue-800/50 hover:cursor-pointer"
              style="width: 20rem">
              <template #imgHeader>
                <img class="w-full h-40 object-contain rounded-t-3xl bg-slate-200 p-4"
                  :alt="achievement.title"
                  :src="achievement.imageSrc" />
              </template>
              <template #header>
                <span class="line-clamp-2">{{ achievement.title }}</span>
              </template>
              <template #content>
                <span class="text-sm text-slate-400">{{ achievement.provider }}</span>
              </template>
            </Card>
          </NuxtLink>
        </NuxtMarquee>
        <button
          class="rounded-full px-4 py-2 shadow bg-slate-800 border border-slate-600 hover:bg-slate-700"
          @mouseover="marqueeSpeed = 500"
          @mouseleave="marqueeSpeed = 50">
          <fa :icon="faForward" />
          Fast Forward
        </button>
      </div>
      <div v-if="contactData.show"
        id="contactme"
        class="flex flex-col-reverse md:flex-row items-center justify-center w-full max-w-[720px] gap-12 mb-24">
        <div class="flex flex-col item-center md:items-start w-full gap-8">
          <div class="flex flex-col item-center w-full gap-4">
            <h2 class="text-4xl md:text-5xl text-center">
              {{ contactData.title }}
            </h2>
            <span class="text-slate-400 text-center">
              {{ contactData.subtitle }}
            </span>
          </div>
          <div class="flex flex-col-reverse md:flex-row w-full bg-slate-800 border border-slate-600 rounded-3xl items-center justify-center md:justify-start">
            <div class="flex flex-row flex-wrap md:flex-col gap-4 items-center justify-center p-4">
              <NuxtLink v-for="link in contactData.externalLinks"
                :to="link.url"
                target="_blank">
                <IconButton
                  :devicon="link.devicon"
                  :fontawesome="link.fontawesome"
                  :color="link.color"
                  :title="link.label" />
              </NuxtLink>
            </div>
            <div class="flex flex-col gap-4 w-full bg-slate-900 border border-slate-600 rounded-3xl p-8">
              <div>
                <input
                  class="w-full py-2 px-4 bg-slate-800 border border-slate-600 rounded-full shadow focus:outline-none focus:border-blue-800 hover:shadow-blue-800/50"
                  type="text"
                  name="name"
                  placeholder="Name"
                  v-model="form.name" />
                <span class="text-red-500 px-4">
                  {{ formError.name }}
                </span>
              </div>
              <div>
                <input
                  class="w-full py-2 px-4 bg-slate-800 border border-slate-600 rounded-full shadow focus:outline-none focus:border-blue-800 hover:shadow-blue-800/50"
                  type="text"
                  name="email"
                  placeholder="Email"
                  v-model="form.email" />
                <span class="text-red-500 px-4">
                  {{ formError.email }}
                </span>
              </div>
              <div>
                <textarea
                  class="w-full py-2 px-4 bg-slate-800 border border-slate-600 rounded-3xl resize-none shadow focus:outline-none focus:border-blue-800 hover:shadow-blue-800/50"
                  rows="6"  
                  name="message"
                  placeholder="Enter your message..."
                  v-model="form.message" />
                <span class="text-red-500 px-4">
                  {{ formError.message }}
                </span>
              </div>
              <span class="text-center">
                {{ result }}
              </span>
              <Button label="Send Message"
                class="hover:shadow-blue-800/50 shadow"
                :textSizeClass="'text-sm'"
                :backgroundColor="'bg-blue-900'"
                :hoverColor="'hover:bg-blue-700'"
                :borderColor="'border-blue-950'"
                @click="submitForm">
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>  
</template>
<style lang="css" scoped>
.typing-effect {
  overflow: hidden; /* Ensure the text is not visible until the typewriter effect*/
  border-right: 0.15em solid #94a3b8;
  white-space: nowrap; /* Keeps the text on a single line */
  animation: typing 5s steps(30) infinite, blink 1s infinite;
}

/* The typing animation */
@keyframes typing {
  0% { width: 0 }
  50% { width: 100% }
}

@keyframes blink {
  0%, 45% {
    border-color: transparent;
  }
  50%, 100% {
    border-color: #94a3b8;
  }
}
</style>