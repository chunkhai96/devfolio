# Devfolio - Personal Development Portfolio Website
This is a personal portfolio website built on top of [Nuxt 3](https://nuxtjs.org/). It serves as a platform for me to showcase my skills, projects, achievements, and provide a way for potential employers to get in touch with me. 

### [Live Preview](https://www.andypangdev.com/)

## Features

* Responsive design
* Minimalist and modern design
* Dynamic personal portfolio section that displays my projects, experiences, achievements, and other relevant information
* Contact form to facilitate direct communication with me
* Integration with various social media platforms
* Accessibility features

## Technology Stack

* Nuxt 3
* Vue 3
* Tailwind CSS
* TypeScript

## Run the Project Locally

1. Clone the repository
2. Install dependencies by running `npm install` or `pnpm install` or `yarn install` or `bun install`
3. Run the development server by running `npm run dev` or `pnpm run dev` or `yarn dev` or `bun run dev`
4. Open your browser and navigate to `http://localhost:3000`

## Configure with Your Own Content
To personalize the portfolio project for your own need, update the files in the ```/data``` directory. Each file corresponds to a specific section of the website, allowing you to easily configure your information.

#### Configurable Files:
* ```achievement.ts```: List your achievements and certifications.
* ```contact.ts```: Configure your contact information and links.
* ```experience.ts```: Customize your work experience timeline.
* ```landing.ts```: Set the content for the landing page.
* ```project.ts```: Showcase your projects and contributions.
* ```talk.ts```: Highlight talks, presentations, or webinars you’ve delivered.
* ```whatido.ts```: Detail your areas of expertise and services you offer.

#### Example:
```ts
// data/experience.ts

...

const show: boolean = true // Set to false if you want to hide this section
const title: string = 'Working Experience' // Section title
const timelineItems: Array<ExperienceTimelineItem> = [
  // Add or modify the timeline items based on your experience
  ...
]

...

```

## Setting Up the Contact Form
To enable the contact form on your website:

1. Visit [Web3form](https://web3forms.com/) and sign up to get your access key.
2. Copy the access key provided by Web3form.
3. Replace the ```NUXT_PUBLIC_WEB3_FORM_ACCESS_KEY``` value in the .env file with your access key.

## Environment Configuration
1. Copy the ```.env.example``` file and rename it to ```.env```.
2. Replace the placeholder with your own value.

#### Required Variables:
```NUXT_PUBLIC_WEB3_FORM_ACCESS_KEY```: Replace with your actual Web3 form access key.

```NUXT_PUBLIC_SITE_URL```: Replace with the URL where your portfolio will be hosted (e.g., https://www.andypangdev.com).

```NUXT_SITE_ENV```: Replace with either ```development```, ```staging```, or ```production```, depending on your deployment environment. Only ```production``` allowed for indexing.

## Contributing

Contributions are always welcome. If you find any issues or have suggestions, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Acknowledgements

* [Nuxt 3](https://nuxtjs.org/)
* [Tailwind CSS](https://tailwindcss.com/)
* [Font Awesome](https://fontawesome.com/)
* [Devicons](https://devicons.github.io/devicon/)
* [Lottie](https://airbnb.io/lottie/)
