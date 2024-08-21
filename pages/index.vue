<script lang="ts" setup>
import { Vue3Lottie } from 'vue3-lottie'
import whatido from '~/assets/lotties/whatido.json'
import experience from '~/assets/lotties/experience.json'
import { faForward } from '@fortawesome/free-solid-svg-icons'
import * as landingData from '@/data/landing'
import type { ExperienceTimelineItem } from '~/components'
import type { Web3FormResponse } from '.'

const config = useRuntimeConfig()

// What I Do Section
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
    { icon: 'devicon-scikitlearn-plain', text: 'SciKit-Learn' },
    { icon: 'devicon-numpy-plain', text: 'Numpy' },
    { icon: 'devicon-azuresqldatabase-plain', text: 'SQL' },
    { icon: 'devicon-vuejs-plain', text: 'Vue.js' },
    { icon: 'devicon-kubernetes-plain', text: 'Kubernetes' }
  ],
  subtitles: [
    '💡 Craft innovative AI solutions that transform problems into intelligent, automated systems',
    '💡 Develop dynamic web applications that provide seamless user experiences',
    '💡 Enabling data-driven decision-making through advanced analytics and visualization'
  ]
}

// Projects Section
const projectSectionText = {
  title: 'Personal Projects',
}
const projectItems = [
  {
    title: 'DevFolio',
    description: 'A dynamic personal portfolio website designed to introduce myself and showcase my creative and professional projects.',
    imageSrc: 'images/project-devfolio.webp',
    codeLink: 'https://github.com/chunkhai96/devfolio',
    liveLink: 'https://andypangdev.com'
  },
  {
    title: 'I Have Chosen You',
    description: 'A compassionate religious web application that serves as a platform for those seeking support and assistance.',
    imageSrc: 'images/project-ihavechosenyou.webp',
    liveLink: 'https://ihavechosenyou.com/en'
  },
  {
    title: 'RideS',
    description: 'An innovative carpooling app on Android that facilitates easy and affordable transportation solutions for university students.',
    imageSrc: 'images/project-rides.webp',
    codeLink: 'https://github.com/chunkhai96/RideS',
    liveLink: 'https://youtu.be/UE8D9PCm3zk?si=wmFT6Wa4glJ9MZ-n'
  },
  {
    title: 'Employee Policy Chatbot',
    description: 'An interactive chatbot to provide quick and accurate answers about employee policies, including sick leave, claims, insurance, etc.',
    imageSrc: 'images/project-policy-chatbot.webp'
  },
  {
    title: 'Web Crawler',
    description: 'Crawl and scrape publicly accessible data from websites, including job listings, salary information, property details, etc.',
    imageSrc: 'images/project-web-crawler.webp'
  },
  {
    title: 'Data Dashboard',
    description: 'An intuitive dashboard that visualizes and analyzes data, empowering users to make informed and strategic decisions.',
    imageSrc: 'images/project-dashboard.webp'
  }
]

// Experience Section
const experienceSectionText = {
  title: 'Working Experience',
}
const experienceTimelineItems: ExperienceTimelineItem[] = [
  {
    title: 'Senior Machine Learning Engineer',
    company: 'Management Resources Consultants (MRC Asia)',
    duration: 'Apr 2022 - Present',
    description: 'Crafted innovative machine learning solutions to analyze and predict global salary data, encompassing base pay, allowances, and bonuses, covering 140+ countries and 1,300+ unique job roles.'
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

// Talks Section
const talkSectionText = {
  title: 'Talks'
}
const talkItems = [
  {
    title: 'Competent in Job Market Through Final Year Project Management',
    imageSrc: 'images/talk-uthm.webp',
    youtube: 'https://youtu.be/skoynvqo64o?si=7wzZnsVE4ziiZ4qt',
    slide: 'https://docs.google.com/presentation/d/19JZlfQRdsyLvZ91-RtQGYBnsyXRKvAlCJR03ll6JHEg/edit?usp=sharing'
  }
]

// Achievements Section
const achievementSectionText = {
  title: 'Achievements and Certifications',
}
const achievementItems = [
  {
    title: 'Microsoft Certified: Azure Fundamentals',
    provider: 'Microsoft',
    link: 'https://learn.microsoft.com/api/credentials/share/en-us/andypang/920020771177B6BE?sharingId=973E5703531249ED',
    imageSrc: 'images/azure-fundamental-logo.webp'
  },
  {
    title: 'Natural Language Processing Specialization',
    provider: 'DeepLearning.AI',
    link: 'https://coursera.org/share/3c6e15d0f2306504f6751da1e2195356',
    imageSrc: 'images/deep-learning-ai-logo.webp'
  },
  {
    title: 'Data Analyst Nanodegree',
    provider: 'Udacity',
    link: 'https://www.udacity.com/certificate/QRRDHARF',
    imageSrc: 'images/udacity-logo.webp'
  },
  {
    title: 'Programming with Google Go Specialization',
    provider: 'University of California Irvine',
    link: 'https://coursera.org/share/a0e910c581580aa9297d14ee71ee2ed6',
    imageSrc: 'images/uci-logo.webp'
  },
  {
    title: 'Deep Learning Specialization',
    provider: 'DeepLearning.AI',
    link: 'https://coursera.org/share/b64de4b8cecec71649b37bc147802e65',
    imageSrc: 'images/deep-learning-ai-logo.webp'
  },
  {
    title: 'Machine Learning',
    provider: 'Stanford University',
    link: 'https://coursera.org/share/a9326fa001b85ec2459909389f8fee02',
    imageSrc: 'images/stanford-logo.webp'
  },
  {
    title: 'Machine Learning on Google Cloud Specialization',
    provider: 'Google Cloud',
    link: 'https://coursera.org/share/23ff1c353e4d9649f9c023e13180e7fc',
    imageSrc: 'images/google-cloud-logo.webp'
  },
  {
    title: 'Front-End Web Development with React',
    provider: 'The Hong Kong University of Science and Technology',
    link: 'https://coursera.org/share/ec4d848c78ed50bab7f172a4e0cefe92',
    imageSrc: 'images/hkust-logo.webp'
  }
]
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
                <NuxtLink v-for="link in landingData.externalLinks"
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
                src="~/assets/images/avatar.webp"
                alt="Avatar"/>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-col items-center justify-center w-full gap-36 p-8">
      <div id="whatido"
        class="flex flex-col-reverse lg:flex-row h-full w-full max-w-[1240px] items-center">
        <client-only>
          <Vue3Lottie
            width="80%"
            :animationData="whatido"
          />
        </client-only>
        <div class="flex flex-col justify-between w-full p-4 gap-8">
          <h2 class="text-4xl md:text-5xl text-center lg:text-left">
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
              class="text-center lg:text-left">
              {{ subtitle }}
            </li>
          </ul>
        </div>
      </div>
      <div id="project"
        class="flex flex-col items-center justify-center w-full max-w-[1240px] gap-12">
        <h2 class="text-4xl md:text-5xl text-center md:text-left">
          {{ projectSectionText.title }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 h-full w-full items-center">
          <Card v-for="project in projectItems"
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
      <div id="experience"
        class="flex flex-col items-center justify-center w-full max-w-[1240px] gap-12">
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
      <div id="talk"
        class="flex flex-col items-center justify-center w-full max-w-[1240px] gap-12">
        <h2 class="text-4xl md:text-5xl text-center md:text-left">
          {{ talkSectionText.title }}
        </h2>
        <div class="flex flex-wrap justify-center gap-12 h-full w-full items-center">
          <Card v-for="talk in talkItems"
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
      <div id="achievement"
        class="flex flex-col items-center justify-center w-full max-w-[1240px]">
        <h2 class="text-4xl md:text-5xl text-center">
          {{ achievementSectionText.title }}
        </h2>
        <NuxtMarquee class="overflow-hidden"
          :pauseOnHover="true"
          :speed="marqueeSpeed">
          <NuxtLink v-for="achievement in achievementItems"
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
      <div id="contactme"
        class="flex flex-col-reverse md:flex-row items-center justify-center w-full max-w-[720px] gap-12 mb-24">
        <div class="flex flex-col item-center md:items-start w-full gap-8">
          <div class="flex flex-col item-center w-full gap-4">
            <h2 class="text-4xl md:text-5xl text-center">
              {{ contactMeSectionText.title }}
            </h2>
            <span class="text-slate-400 text-center">
              {{ contactMeSectionText.description }}
            </span>
          </div>
          <div class="flex flex-col-reverse md:flex-row w-full bg-slate-800 border border-slate-600 rounded-3xl items-center justify-center md:justify-start">
            <div class="flex flex-row flex-wrap md:flex-col gap-4 items-center justify-center p-4">
              <NuxtLink v-for="link in landingData.externalLinks"
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