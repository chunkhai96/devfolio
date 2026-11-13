<script lang="ts" setup>
import { landing, whatido, keyPoints, projects, experience, talks, talk, achievements, achievement, contact, iconUrl, project as projectData } from '~/utils/atelier'
import ContactPanel from './panels/ContactPanel.vue'
</script>
<template>
  <div class="doc">
    <section class="intro" aria-labelledby="doc-name">
      <p class="eyebrow cyan">{{ experience.timelineItems[0].title }} · {{ experience.timelineItems[0].company }}</p>
      <h1 id="doc-name" class="name">{{ landing.title }}</h1>
      <p class="desc">{{ landing.description }}</p>
      <p class="roles">{{ whatido.roles.join(' · ') }}</p>
      <div class="row">
        <a :href="landing.resumeSrc" target="_blank" rel="noopener" class="btn btn-primary"><Icon name="doc" :size="16" />Résumé</a>
        <SocialLinks />
      </div>
    </section>

    <section id="work" class="sec" aria-labelledby="h-work">
      <header><p class="eyebrow">02 / Project Gallery</p><h2 id="h-work">{{ projectData.title }}</h2></header>
      <ul class="projects">
        <li v-for="(p, i) in projects" :key="p.title">
          <img :src="p.imageSrc" :alt="`Screenshot of ${p.title}`" loading="lazy" decoding="async" />
          <div class="pbody">
            <p class="eyebrow">Exhibit {{ String(i + 1).padStart(2, '0') }}</p>
            <h3>{{ p.title }}</h3>
            <p>{{ p.description }}</p>
            <p v-if="p.stack?.length" class="pstack">{{ p.stack.join(' · ') }}</p>
            <div class="plinks">
              <a v-if="p.liveLink" :href="p.liveLink" target="_blank" rel="noopener">{{ /youtu\.?be/.test(p.liveLink) ? 'Watch demo' : 'Live preview' }} <Icon name="arrow-up-right" :size="14" /></a>
              <a v-if="p.codeLink" :href="p.codeLink" target="_blank" rel="noopener">Source code <Icon name="arrow-up-right" :size="14" /></a>
            </div>
          </div>
        </li>
      </ul>
    </section>

    <section id="capabilities" class="sec" aria-labelledby="h-cap">
      <header><p class="eyebrow">03 / Engineering Lab</p><h2 id="h-cap">{{ whatido.title }}</h2></header>
      <ol class="caps">
        <li v-for="(r, i) in whatido.roles" :key="r"><h3>{{ r }}</h3><p>{{ keyPoints[i] }}</p></li>
      </ol>
      <ul class="tools">
        <li v-for="t in whatido.techStackItems" :key="t.text">
          <img v-if="iconUrl(t.icon)" class="glyph-img ic" :src="iconUrl(t.icon)" alt="" aria-hidden="true" />{{ t.text }}
        </li>
      </ul>
    </section>

    <section id="experience" class="sec" aria-labelledby="h-exp">
      <header><p class="eyebrow">04 / Career Corridor</p><h2 id="h-exp">{{ experience.title }}</h2></header>
      <ol class="exp">
        <li v-for="e in experience.timelineItems" :key="e.title + e.company">
          <p class="when">{{ e.duration }}</p>
          <div><h3>{{ e.title }}</h3><p class="org">{{ e.company }}</p><p>{{ e.description }}</p></div>
        </li>
      </ol>
    </section>

    <section id="talks" class="sec" aria-labelledby="h-talks">
      <header><p class="eyebrow">03 / Engineering Lab</p><h2 id="h-talks">{{ talk.title }}</h2></header>
      <div v-for="t in talks" :key="t.title" class="talk">
        <img :src="t.imageSrc" :alt="t.title" loading="lazy" decoding="async" />
        <div>
          <h3>{{ t.title }}</h3>
          <div class="plinks">
            <a v-if="t.youtube" :href="t.youtube" target="_blank" rel="noopener">YouTube <Icon name="arrow-up-right" :size="14" /></a>
            <a v-if="t.slide" :href="t.slide" target="_blank" rel="noopener">Slides <Icon name="arrow-up-right" :size="14" /></a>
          </div>
        </div>
      </div>
    </section>

    <section id="achievements" class="sec" aria-labelledby="h-ach">
      <header><p class="eyebrow">04 / Career Corridor</p><h2 id="h-ach">{{ achievement.title }}</h2></header>
      <ul class="certs">
        <li v-for="a in achievements" :key="a.title">
          <a :href="a.link" target="_blank" rel="noopener">
            <span class="logo"><img :src="a.imageSrc" :alt="`${a.provider} logo`" loading="lazy" /></span>
            <span><strong>{{ a.title }}</strong><small>{{ a.provider }}</small></span>
          </a>
        </li>
      </ul>
    </section>

    <section id="contact" class="sec contact" aria-label="Contact">
      <ContactPanel />
    </section>
    <footer class="foot">© {{ new Date().getFullYear() }} {{ landing.title }} · {{ contact.externalLinks.find(l => l.label === 'Email')?.url.replace('mailto:', '') }}</footer>
  </div>
</template>
<style scoped>
.doc { max-width: 1080px; margin: 0 auto; padding: 120px 24px 48px; }
.cyan { color: var(--ice-cyan); }
.name { font-family: var(--font-display); font-weight: 600; font-size: clamp(3rem, 6vw, 5.5rem); letter-spacing: -0.025em; line-height: 0.98; margin-top: 18px; }
.desc { margin-top: 20px; font-size: 1.3rem; color: var(--porcelain); }
.roles { margin-top: 8px; color: var(--mist); }
.intro { text-align: center; }
.row { margin-top: 28px; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 16px; }
.sec { margin-top: 112px; scroll-margin-top: 88px; }
.sec header { text-align: center; }
.sec header h2 { font-family: var(--font-display); font-weight: 600; font-size: clamp(2rem, 3.4vw, 3.25rem); letter-spacing: -0.015em; margin-top: 10px; }
.projects { margin-top: 36px; display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
.projects li { border: 1px solid var(--hairline); border-radius: 14px; overflow: hidden; background: rgba(26, 34, 41, 0.45); }
.projects img { width: 100%; aspect-ratio: 16/9; object-fit: cover; object-position: top; display: block; border-bottom: 1px solid var(--hairline); }
.pbody { padding: 20px; }
.pbody h3, .caps h3, .exp h3, .talk h3 { font-family: var(--font-display); font-size: 1.35rem; font-weight: 600; margin-top: 6px; }
.pbody p, .caps p, .exp p { color: var(--mist); line-height: 1.6; margin-top: 8px; }
.plinks { margin-top: 14px; display: flex; gap: 18px; flex-wrap: wrap; }
.plinks a { display: inline-flex; align-items: center; gap: 6px; color: var(--porcelain); font-weight: 550; font-size: 0.9375rem; min-height: 32px; }
.plinks a:hover { color: var(--ice-cyan); }
.caps { margin-top: 32px; display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; }
.caps li { border-top: 1px solid var(--hairline); padding-top: 18px; }
.tools { margin-top: 32px; display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.tools li { display: inline-flex; align-items: center; gap: 10px; height: 44px; padding: 0 14px; border: 1px solid var(--hairline); border-radius: 10px; }
.ic { width: 18px; height: 18px; color: var(--mist); }
.exp { margin-top: 28px; }
.exp li { display: grid; grid-template-columns: 200px 1fr; gap: 24px; padding: 24px 0; border-top: 1px solid var(--hairline); }
.when { font-family: var(--font-mono); font-size: 0.8rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--titanium); padding-top: 8px; }
.org { margin-top: 2px !important; }
.talk { margin-top: 28px; display: grid; grid-template-columns: minmax(0, 420px) 1fr; gap: 28px; align-items: center; }
.talk img { width: 100%; border-radius: 12px; border: 1px solid var(--hairline); }
.certs { margin-top: 28px; display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); grid-auto-rows: 1fr; gap: 10px; }
.certs li { display: flex; }   /* every card as tall as the tallest, regardless of title length */
.certs a { flex: 1; display: grid; grid-template-columns: 76px 1fr; gap: 14px; align-items: center; padding: 10px; border: 1px solid var(--hairline); border-radius: 12px; color: var(--porcelain); }
.certs a:hover { border-color: rgba(154, 216, 214, 0.5); }
.certs strong { display: block; font-weight: 550; font-size: 0.95rem; line-height: 1.35; }
.certs small { display: block; color: var(--titanium); margin-top: 2px; }
.logo { display: grid; place-items: center; height: 52px; border-radius: 8px; background: #ece9e1; padding: 6px 8px; }
.logo img { max-width: 100%; max-height: 40px; object-fit: contain; }
.contact { max-width: 640px; margin-left: auto; margin-right: auto; }
.foot { margin-top: 96px; padding-top: 24px; border-top: 1px solid var(--hairline); font-size: 0.85rem; color: var(--titanium); text-align: center; }
@media (max-width: 700px) {
  .doc { padding-top: 96px; }
  .exp li { grid-template-columns: 1fr; gap: 4px; }
  .talk { grid-template-columns: 1fr; }
}
.pstack { font-family: var(--font-mono); font-size: 0.75rem; color: var(--titanium); margin-top: 6px; }
</style>
