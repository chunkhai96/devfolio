import type {
  IconDefinition
} from '@fortawesome/free-solid-svg-icons'

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

type AchievementItem = {
  title: string
  provider: string
  link: string
  imageSrc: string
}

type ExternalLinkItem = {
  devicon?: string
  fontawesome?: IconDefinition
  url: string
  color: string
  label: string
}

export type {
  TechStackItem,
  ProjectItem,
  ExperienceTimelineItem,
  TalkItem,
  AchievementItem,
  ExternalLinkItem,
}
