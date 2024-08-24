import type { AchievementItem } from '.'

const show: boolean = true
const title: string = 'Achievements and Certifications'
const achievementItems: Array<AchievementItem> = [
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

export {
  show,
  title,
  achievementItems
}