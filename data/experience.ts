import type { ExperienceTimelineItem } from '.'

const show: boolean = true
const title: string = 'Working Experience'
const timelineItems: Array<ExperienceTimelineItem> = [
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

export { 
  show,
  title,
  timelineItems
}