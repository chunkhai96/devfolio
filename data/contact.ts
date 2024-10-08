import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import type { ExternalLinkItem } from '.'

const show: boolean = true
const title: string = 'Contact Me'
const subtitle: string = 'I\'d love to connect! Reach out for questions, collaborations, or a chat.'
const externalLinks: Array<ExternalLinkItem> = [
  {
    devicon: 'devicon-github-original',
    url: 'https://github.com/chunkhai96',
    color: 'bg-slate-800',
    label: 'GitHub'
  },
  {
    devicon: 'devicon-linkedin-plain',
    url: 'https://www.linkedin.com/in/chunkhai96/',
    color: 'bg-blue-500',
    label: 'LinkedIn'
  },
  {
    devicon: 'devicon-stackoverflow-plain',
    url: 'https://stackoverflow.com/users/6851848/andy-pang',
    color: 'bg-orange-500',
    label: 'StackOverflow'
  },
  {
    fontawesome: faEnvelope,
    url: 'mailto:andypang96@gmail.com',
    'color': 'bg-slate-400',
    label: 'Email'
  },
  {
    devicon: 'devicon-googlecloud-plain',
    url: 'https://www.cloudskillsboost.google/public_profiles/6afcecb6-2169-472e-b3fc-68c97b626f0a',
    color: 'bg-red-500',
    label: 'Google Cloud Skills Boost'
  },
  {
    devicon: 'devicon-windows11-original',
    url: 'https://learn.microsoft.com/en-us/users/andypang/',
    color: 'bg-blue-500',
    label: 'Microsoft Learn'
  }
]

export {
  show,
  title,
  subtitle,
  externalLinks
}