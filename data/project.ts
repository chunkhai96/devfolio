import type { ProjectItem } from '.'

const show: boolean = true
const title: string = 'Personal Projects'
const projectItems: Array<ProjectItem> = [
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

export {
  show,
  title,
  projectItems
}