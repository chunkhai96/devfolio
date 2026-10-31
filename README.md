# Devfolio - Personal Development Portfolio Website
This is a personal portfolio website built on top of [Nuxt 3](https://nuxtjs.org/). It serves as a platform for me to showcase my skills, projects, achievements, and provide a way for potential employers to get in touch with me. 

### [Live Preview](https://www.andypangdev.com/)

## Features

* **The Digital Atelier** — an explorable 3D architectural portfolio (see [DESIGN.md](DESIGN.md)): an arrival atrium with a kinetic sculpture, a project gallery, an engineering lab, a career corridor and a contact terrace
* Point-and-click exploration with routed camera travel, discoverable markers, a room guide with floor plan, and deep links (`/#work/devfolio`, `/#experience`, `/#contact`…)
* Readable HTML panels for every exhibit; keyboard, Escape/back and reduced-motion support
* Text view at `/overview` (also the automatic fallback when WebGL 2 is unavailable)
* Contact form, résumé and social links

## Technology Stack

* Nuxt 3, Vue 3, TypeScript, Tailwind CSS
* three.js + pmndrs `postprocessing` (AgX tone mapping, bloom, MSAA/SMAA)
* Blender 5 (headless Python) for the architecture, Cycles-baked lightmaps and procedural PBR textures — no paid assets

## The 3D pipeline

All world art is generated from code, so it is reproducible and reviewable.

| Path | Role |
|---|---|
| `blender/world.py` | Procedural architecture, furniture, lights and exhibit placement (Blender coords, metres) |
| `blender/textures.py` | Procedural tileable PBR maps (dark basalt, brushed titanium) from FFT noise |
| `blender/polyhaven.py` | Normalises CC0 Poly Haven scans (floor, walls, plaster, ceramic, felt) to the palette |
| `blender/pipeline.py` | Hidden-face culling, lightmap UVs, Cycles bake, glTF export, preview renders |
| `blender/encode.py` | OIDN denoise + soft-knee encoding of lightmaps (decoded in `three/materials.ts`) |
| `blender/publish.sh` | WebP lightmaps (desktop + mobile), textures, meshopt-compressed `world.glb` → `public/atelier/` |
| `three/` | Runtime: engine, materials (lightmap decode, box-projected reflections), kinetic sculpture, sky, camera rig |

Rebuild the world after editing `blender/world.py` (needs Blender 5.x; ~10 min on Apple Silicon):

```bash
B=/Applications/Blender.app/Contents/MacOS/Blender
$B -b --python blender/pipeline.py -- bake --samples 256   # or: bake atrium gallery
$B -b --python blender/encode.py --
$B -b --python blender/pipeline.py -- export
blender/publish.sh textures
```

Quick lighting previews without baking: `$B -b --python blender/pipeline.py -- preview arrival,corridor 64`.

Checks: `yarn check:webkit` (Safari-engine device flows + axe) and `node scripts/review-capture.mjs` (review snapshots), both against a running production build.

Content still comes only from `/data` — the 3D screens, panels and text view all render from the same files.

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
* [three.js](https://threejs.org/) and [postprocessing](https://github.com/pmndrs/postprocessing)
* [Blender](https://www.blender.org/)
* [Devicons](https://devicons.github.io/devicon/) (MIT) — technology and profile glyphs
* Fonts: Space Grotesk, Inter, IBM Plex Mono (SIL OFL) via Fontsource
* Scanned materials from [Poly Haven](https://polyhaven.com) (CC0): granite_tile (Charlotte Baglioni), plaster_grey_04, grey_plaster_02, white_plaster_02 (Rob Tuytel), caban (colormass / Rico Cilliers) — prepared by `blender/polyhaven.py`; scanned furniture (CC0): mid_century_lounge_chair, modern_coffee_table_01, metal_stool_01 — placed by `three/props.ts`
