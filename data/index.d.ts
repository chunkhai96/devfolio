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

export type {
  ExternalLink,
  TechStackItem
}
