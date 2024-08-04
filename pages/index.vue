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
  { devicon: 'devicon-github-original', url: 'https://github.com/chunkhai96', color: 'bg-slate-800', label: 'GitHub' },
  { devicon: 'devicon-linkedin-plain', url: 'https://www.linkedin.com/in/chunkhai96/', color: 'bg-blue-500', label: 'LinkedIn' },
  { devicon: 'devicon-stackoverflow-plain', url: 'https://stackoverflow.com/users/6851848/andy-pang', color: 'bg-orange-500', label: 'StackOverflow' },
  { fontawesome: faEnvelope, url: 'mailto:andypang96@gmail.com', 'color': 'bg-slate-400', label: 'Email' },
  { devicon: 'devicon-googlecloud-plain', url: 'https://www.cloudskillsboost.google/public_profiles/6afcecb6-2169-472e-b3fc-68c97b626f0a', color: 'bg-red-500', label: 'Google Cloud Skills Boost' },
  { devicon: 'devicon-windows11-original', url: 'https://learn.microsoft.com/en-us/users/andypang/', color: 'bg-blue-500', label: 'Microsoft Learn' }
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
  title: 'Personal Projects',
}
const projectItems = [
  {
    title: 'DevFolio',
    description: 'A dynamic personal portfolio website designed to introduce myself and showcase my creative and professional projects.',
    imageSrc: 'images/project-devfolio.png',
    codeLink: 'https://github.com/chunkhai96/devfolio',
    liveLink: 'https://andypangdev.com'
  },
  {
    title: 'I Have Chosen You',
    description: 'A compassionate religious web application that serves as a platform for those seeking support and assistance.',
    imageSrc: 'images/project-ihavechosenyou.png',
    liveLink: 'https://ihavechosenyou.com/en'
  },
  {
    title: 'RideS',
    description: 'An innovative carpooling app on Android that facilitates easy and affordable transportation solutions for university students.',
    imageSrc: 'images/project-rides.png',
    codeLink: 'https://github.com/chunkhai96/RideS',
    liveLink: 'https://youtu.be/UE8D9PCm3zk?si=wmFT6Wa4glJ9MZ-n'
  },
  {
    title: 'Employee Policy Chatbot',
    description: 'An interactive chatbot to provide quick and accurate answers about employee policies, including sick leave, claims, insurance, etc.',
    imageSrc: 'images/project-policy-chatbot.png'
  },
  {
    title: 'Web Crawler',
    description: 'Crawl and scrape publicly accessible data from websites, including job listings, salary information, property details, etc.',
    imageSrc: 'images/project-web-crawler.jpg'
  },
  {
    title: 'Data Dashboard',
    description: 'An intuitive dashboard that visualizes and analyzes data, empowering users to make informed and strategic decisions.',
    imageSrc: 'images/project-devfolio.png'
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
    description: 'Crafted innovative machine learning solutions to analyze and predict global salary data, encompassing base pay, allowances, and bonuses, covering 140+ countries and 1,300+ unique job roles'
  },
  {
    title: 'Artificial Intelligence Engineer',
    company: 'TalentX',
    duration: 'Jan 2021 - Apr 2022',
    description: 'Led a team of 5 in developing cutting-edge AI solutions that revolutionized talent acquisition, hiring processes, and talent management.'
  },
  {
    title: 'System Engineer',
    company: 'Infineon Technologies',
    duration: 'Jul 2020 - Jan 2021',
    description: 'Engineered and maintained state-of-the-art financial technology solutions, contributing to seamless financial operations and technology integration.'
  },
  {
    title: 'Data Science Intern',
    company: 'Seek',
    duration: 'Jul 2019 - Jan 2020',
    description: 'Developed sophisticated job review classification and sentiment analysis models, servicing 3 distinct markets with multilingual capabilities.'
  }
]

const talkSectionText = {
  title: 'Talks'
}
const talkItems = [
  {
    title: 'Competent in Job Market Through Final Year Project Management',
    imageSrc: 'images/talk-uthm.png',
    youtube: 'https://youtu.be/skoynvqo64o?si=7wzZnsVE4ziiZ4qt',
    slide: 'https://docs.google.com/presentation/d/19JZlfQRdsyLvZ91-RtQGYBnsyXRKvAlCJR03ll6JHEg/edit?usp=sharing'
  }
]

const achievementSectionText = {
  title: 'Achievements and Certifications',
}
const achievementItems = [
  {
    title: 'Microsoft Certified: Azure Fundamentals',
    provider: 'Microsoft',
    link: 'https://learn.microsoft.com/api/credentials/share/en-us/andypang/920020771177B6BE?sharingId=973E5703531249ED',
    imageSrc: 'images/azure-fundamental-logo.png'
  },
  {
    title: 'Natural Language Processing Specialization',
    provider: 'DeepLearning.AI',
    link: 'https://coursera.org/share/3c6e15d0f2306504f6751da1e2195356',
    imageSrc: 'images/deep-learning-ai-logo.png'
  },
  {
    title: 'Data Analyst Nanodegree',
    provider: 'Udacity',
    link: 'https://www.udacity.com/certificate/QRRDHARF',
    imageSrc: 'images/udacity-logo.png'
  },
  {
    title: 'Programming with Google Go Specialization',
    provider: 'University of California Irvine',
    link: 'https://coursera.org/share/a0e910c581580aa9297d14ee71ee2ed6',
    imageSrc: 'images/uci-logo.png'
  },
  {
    title: 'Deep Learning Specialization',
    provider: 'DeepLearning.AI',
    link: 'https://coursera.org/share/b64de4b8cecec71649b37bc147802e65',
    imageSrc: 'images/deep-learning-ai-logo.png'
  },
  {
    title: 'Machine Learning',
    provider: 'Stanford University',
    link: 'https://coursera.org/share/a9326fa001b85ec2459909389f8fee02',
    imageSrc: 'images/stanford-logo.png'
  },
  {
    title: 'Machine Learning on Google Cloud Specialization',
    provider: 'Google Cloud',
    link: 'https://coursera.org/share/23ff1c353e4d9649f9c023e13180e7fc',
    imageSrc: 'images/google-cloud-logo.png'
  },
  {
    title: 'Front-End Web Development with React',
    provider: 'The Hong Kong University of Science and Technology',
    link: 'https://coursera.org/share/ec4d848c78ed50bab7f172a4e0cefe92',
    imageSrc: 'images/hkust-logo.png'
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
      <div class="flex items-center justify-center grow w-full max-w-[1240px] p-8 mb-36 md:mb-40 z-20">
        <div class="flex flex-col-reverse md:flex-row justify-center items-center grow h-[28rem] gap-12">
          <div class="flex flex-col grow gap-8 h-full">
            <h1 class="grow flex items-end justify-center text-5xl md:text-7xl md:justify-start">{{ landingSectionText.title }}</h1>
            <span class="text-2xl text-slate-400 text-center md:text-left">{{ landingSectionText.description }}</span>
            <div class="flex flex-wrap grow items-end gap-4 justify-center md:justify-start">
              <NuxtLink v-for="link in externalLinks"
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
          <div class="size-[16rem] md:size-[28rem] flex-shrink-0 mt-12 md:mt-0">
            <img class="rounded-full object-cover" src="~/assets/images/avatar.png" />
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-col items-center justify-center w-full gap-36 p-8">
      <div class="flex flex-col-reverse md:flex-row h-full w-full max-w-[1240px] items-center">
        <client-only>
          <Vue3Lottie
            width="80%"
            :animationData="whatido"
          />
        </client-only>
        <div class="flex flex-col justify-between w-full p-4 gap-8">
          <h2 class="text-4xl md:text-5xl text-center md:text-left">
            {{ whatIDoSectionText.title }}
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 justify-between gap-8">
            <Tag v-for="role in whatIDoSectionText.roles"
              :text="role" />
          </div>
          <div class="flex flex-wrap gap-8 justify-center">
            <TechStackContainer v-for="item in whatIDoSectionText.techStackItems"
              :icon="item.icon"
              :text="item.text" />
          </div>
          <ul class="text-slate-400 space-y-4">
            <li v-for="subtitle in whatIDoSectionText.subtitles"
              class="text-center md:text-left">
              {{ subtitle }}
            </li>
          </ul>
        </div>
      </div>
      <div class="flex flex-col items-center justify-center w-full max-w-[1240px] gap-12">
        <h2 class="text-4xl md:text-5xl text-center md:text-left">
          {{ projectSectionText.title }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 h-full w-full items-center">
          <Card v-for="project in projectItems"
            class="shadow-lg transition duration-300 hover:shadow-blue-800/50">
            <template #imgHeader>
              <img class="w-full h-40 object-cover rounded-t-3xl"
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
      <div class="flex flex-col items-center justify-center w-full max-w-[1240px] gap-12">
        <h2 class="text-4xl md:text-5xl text-center">
          {{ experienceSectionText.title }}
        </h2>
        <div class="flex flex-col md:flex-row gap-12 h-full w-full items-center">
          <client-only>
            <Vue3Lottie
              width="80"
              :animationData="experience"
            />
          </client-only>
          <ExperienceTimeline :items="experienceTimelineItems" />
        </div>
      </div>
      <div class="flex flex-col items-center justify-center w-full max-w-[1240px] gap-12">
        <h2 class="text-4xl md:text-5xl text-center md:text-left">
          {{ talkSectionText.title }}
        </h2>
        <div class="flex flex-wrap justify-center gap-12 h-full w-full items-center">
          <Card v-for="talk in talkItems"
            class="w-full md:w-1/2 lg:w-1/3 shadow-lg transition duration-300 hover:shadow-blue-800/50">
            <template #imgHeader>
              <img class="w-full h-40 object-cover rounded-t-3xl"
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
      <div class="flex flex-col items-center justify-center w-full max-w-[1240px]">
        <h2 class="text-4xl md:text-5xl text-center">
          {{ achievementSectionText.title }}
        </h2>
        <NuxtMarquee class="overflow-hidden"
          :pauseOnHover="true">
          <NuxtLink v-for="achievement in achievementItems"
            target="_blank"
            :to="achievement.link">
            <Card class="w-80 h-[19rem] my-12 mr-12 shadow-lg transition duration-300 hover:scale-105 hover:shadow-blue-800/50 hover:cursor-pointer">
              <template #imgHeader>
                <img class="w-full h-40 object-contain rounded-t-3xl bg-slate-200 p-4"
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
      </div>
    </div>
  </div>  
</template>