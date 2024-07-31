<script lang="ts" setup>
import { Vue3Lottie } from 'vue3-lottie'
import whatido from '~/assets/lotties/whatido.json'
import experience from '~/assets/lotties/experience.json'
import credlyLogo from '~/assets/images/credly-logo.svg'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import type { ExperienceTimelineItem } from '~/components'

const landingSectionText = {
  title: 'Andy Pang',
  description: 'I solve problems through innovation using code.'
}
const externalLinks = [
  { devicon: 'devicon-github-original', url: 'https://github.com/chunkhai96', color: 'bg-slate-800' },
  { devicon: 'devicon-linkedin-plain', url: 'https://www.linkedin.com/in/chunkhai96/', color: 'bg-blue-500' },
  { devicon: 'devicon-stackoverflow-plain', url: 'https://stackoverflow.com/users/6851848/andy-pang', color: 'bg-orange-500' },
  { fontawesome: faEnvelope, url: 'mailto:andypang96@gmail.com' },
  { src: credlyLogo, url: 'https://www.credly.com/users/andy-pang.da6734f2' },
]

const whatIDoSectionText = {
  title: 'What I Do',
  roles: [
    'AI/ML Engineer',
    'Full Stack Developer',
    'Data Scientist'
  ],
  techStackItems: [
    { icon: 'devicon-python-plain', text: 'Python' },
    { icon: 'devicon-typescript-plain' , text: 'TypeScript' },
    { icon: 'devicon-go-original-wordmark', text: 'Golang' },
    { icon: 'devicon-azuresqldatabase-plain', text: 'SQL' },
    { icon: 'devicon-vuejs-plain', text: 'Vue.js' },
    { icon: 'devicon-nuxtjs-plain', text: 'Nuxt.js' },
    { icon: 'devicon-docker-plain', text: 'Docker' },
    { icon: 'devicon-kubernetes-plain', text: 'Kubernetes' }
  ],
  subtitles: [
    '💡 Craft innovative AI solutions that transform problems into intelligent, automated systems',
    '💡 Develop dynamic web applications that provide seamless user experiences',
    '💡 Enabling data-driven decision-making through advanced analytics and visualization'
  ]
}

const projectSectionText = {
  title: 'Projects',
}
const projectItems = [
  {
    title: 'DevFolio',
    description: 'Personal portfolio website',
    imageSrc: '/devfolio.png',
    codeLink: 'https://github.com/andy-pang/devfolio',
    liveLink: 'https://devfolio.co/'
  }
]

const experienceSectionText = {
  title: 'Working Experience',
}
const experienceTimelineItems: ExperienceTimelineItem[] = [
  {
    title: 'Senior Machine Learning Engineer',
    company: 'Management Resources Consultants (MRC Asia)',
    duration: 'Apr 2022 - Present',
    description: 'Crafted global salary data includes basic salary, allowances and bonuses using machine learning. Coveraged over 180+ countries worldwide with 1,300+ different jobs.'
  },
  {
    title: 'Artificial Intelligence Engineer',
    company: 'TalentX',
    duration: 'Jan 2021 - Apr 2022',
    description: 'Led a team of 5 to build AI solutions to improve effieciency of talent acquisition, hiring, and talent management.'
  },
  {
    title: 'System Engineer',
    company: 'Infineon Technologies',
    duration: 'Jul 2020 - Jan 2021',
    description: 'Develop and maintain financial technology solutions.'
  },
  {
    title: 'Data Science Intern',
    company: 'Seek',
    duration: 'Jul 2019 - Jan 2020',
    description: 'Develop job reviews classification and sentiment analysis models serving more than 3 markets with different languages.'
  }
]

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
      <div class="z-20">
        <AppNavbar />
      </div>
      <div class="flex items-center justify-center grow w-full max-w-[1240px] p-8 mb-40 z-20">
        <div class="flex items-center grow h-[28rem]">
          <div class="flex flex-col grow gap-8 h-full">
            <h1 class="text-7xl grow flex items-end">{{ landingSectionText.title }}</h1>
            <span class="text-2xl text-slate-400">{{ landingSectionText.description }}</span>
            <div class="flex grow items-end gap-4">
              <NuxtLink v-for="link in externalLinks"
                :to="link.url"
                target="_blank">
                <IconButton
                  :devicon="link.devicon"
                  :src="link.src"
                  :fontawesome="link.fontawesome"
                  :color="link.color" />
              </NuxtLink>
            </div>
          </div>
          <div class="size-[28rem] flex-shrink-0">
            <img class="rounded-full object-cover" src="~/assets/images/avatar.png" />
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-col items-center justify-center w-full gap-36 p-8">
      <div class="flex h-full w-full max-w-[1240px] items-center">
        <client-only>
          <Vue3Lottie
            width="80%"
            :animationData="whatido"
          />
        </client-only>
        <div class="flex flex-col justify-between w-full p-4 gap-8">
          <h2 class="text-5xl">
            {{ whatIDoSectionText.title }}
          </h2>
          <div class="flex justify-between gap-8">
            <Tag v-for="role in whatIDoSectionText.roles"
              :text="role" />
          </div>
          <div class="flex flex-wrap gap-8 justify-center">
            <TechStackContainer v-for="item in whatIDoSectionText.techStackItems"
              :icon="item.icon"
              :text="item.text" />
          </div>
          <ul class="text-slate-400 space-y-4">
            <li v-for="subtitle in whatIDoSectionText.subtitles">
              {{ subtitle }}
            </li>
          </ul>
        </div>
      </div>
      <div class="flex flex-col items-center justify-center w-full max-w-[1240px] gap-12">
        <h2 class="text-5xl">
          {{ projectSectionText.title }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 h-full w-full items-center">
          <Card v-for="project in projectItems">
            <template #imgHeader>
              <img class="w-full h-full object-cover" :src="project.imageSrc" />
            </template>
            <template #header>
              {{ project.title }}
            </template>
            <template #content>
              {{ project.description }}
            </template>
            <template #footer>

            </template>
          </Card>
        </div>
      </div>
      <div class="flex flex-col items-center justify-center w-full max-w-[1240px] gap-12">
        <h2 class="text-5xl">
          {{ experienceSectionText.title }}
        </h2>
        <div class="flex gap-12 h-full w-full items-center">
          <client-only>
            <Vue3Lottie
              width="80%"
              :animationData="experience"
            />
          </client-only>
          <ExperienceTimeline :items="experienceTimelineItems" />
        </div>
      </div>
    </div>
  </div>  
</template>