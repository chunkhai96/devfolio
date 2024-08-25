import type { TechStackItem } from "."

const show: boolean = true
const title: string = 'What I Do'
const roles: Array<string> = [
  'AI/ML Engineer',
  'Full Stack Developer',
  'Data Scientist'
]
const techStackItems: Array<TechStackItem>  = [
  {
    icon: 'devicon-python-plain',
    text: 'Python'
  },
  {
    icon: 'devicon-typescript-plain',
    text: 'TypeScript'
  },
  {
    icon: 'devicon-go-original-wordmark',
    text: 'Golang'
  },
  {
    icon: 'devicon-scikitlearn-plain',
    text: 'SciKit-Learn'
  },
  {
    icon: 'devicon-numpy-plain',
    text: 'Numpy'
  },
  {
    icon: 'devicon-azuresqldatabase-plain',
    text: 'SQL'
  },
  {
    icon: 'devicon-vuejs-plain',
    text: 'Vue.js'
  },
  {
    icon: 'devicon-kubernetes-plain',
    text: 'Kubernetes'
  }
]
const keyPoints: Array<string> = [
  '💡 Craft innovative AI solutions that transform problems into intelligent, automated systems',
  '💡 Develop dynamic web applications that provide seamless user experiences',
  '💡 Enabling data-driven decision-making through advanced analytics and visualization'
]

export {
  show,
  title,
  roles,
  techStackItems,
  keyPoints
}