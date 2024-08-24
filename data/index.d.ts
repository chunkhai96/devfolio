import type {
  IconDefinition
} from '@fortawesome/free-solid-svg-icons'

type ExternalLink = {
  devicon?: string
  fontawesome?: IconDefinition
  url: string
  color: string
  label: string
}

type TechStackItem = {
  icon: string,
  text: string
}

type ProjectItem = {
  title: string
  description: string
  imageSrc: string
  codeLink?: string
  liveLink?: string
}

export type ExperienceTimelineItem = {
  title: string,
  company: string,
  duration: string,
  description: string
}

type TalkItem = {
  title: string
  imageSrc: string
  youtube?: string
  slide?: string
}

export type {
  ExternalLink,
  TechStackItem,
  ProjectItem,
  ExperienceTimelineItem,
  TalkItem
}
