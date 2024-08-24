import type { TalkItem } from '.'

const show: boolean = true
const title: string = 'Talks'
const talkItems: Array<TalkItem> = [
  {
    title: 'Competent in Job Market Through Final Year Project Management',
    imageSrc: 'images/talk-uthm.webp',
    youtube: 'https://youtu.be/skoynvqo64o?si=7wzZnsVE4ziiZ4qt',
    slide: 'https://docs.google.com/presentation/d/19JZlfQRdsyLvZ91-RtQGYBnsyXRKvAlCJR03ll6JHEg/edit?usp=sharing'
  }
]

export {
  show,
  title,
  talkItems
}