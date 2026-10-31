<script lang="ts" setup>
import { contact, landing } from '~/utils/atelier'

interface Web3FormResponse { success: boolean, message: string }
const config = useRuntimeConfig()
const form = reactive({ name: '', email: '', message: '' })
const errors = reactive({ name: '', email: '', message: '' })
const status = ref<'idle' | 'sending' | 'success' | 'error'>('idle')
const result = ref('')

function validate() {
  errors.name = form.name.trim() ? '' : 'Please enter your name.'
  errors.email = !form.email.trim() ? 'Please enter your email.' : (/^\S+@\S+\.\S+$/.test(form.email) ? '' : 'That email address looks incomplete.')
  errors.message = form.message.trim() ? '' : 'Please write a short message.'
  return !errors.name && !errors.email && !errors.message
}

async function submit() {
  if (!validate()) return
  status.value = 'sending'
  result.value = 'Sending…'
  try {
    const res = await $fetch<Web3FormResponse>('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { access_key: config.public.web3FormAccessKey, subject: 'New Submission from andypangdev.com', ...form },
    })
    if (res.success) {
      status.value = 'success'
      result.value = 'Thanks — your message is on its way.'
      form.name = form.email = form.message = ''
    } else {
      status.value = 'error'
      result.value = 'Something went wrong. Please try again or use email.'
    }
  } catch {
    status.value = 'error'
    result.value = 'Something went wrong. Please try again or use email.'
  }
}
</script>
<template>
  <article>
    <p class="eyebrow">05 <span class="sep">/</span> Connection Terrace</p>
    <h2 id="panel-title" tabindex="-1" class="ptitle">{{ contact.title }}</h2>
    <p class="lede">{{ contact.subtitle }}</p>
    <form class="form" novalidate @submit.prevent="submit">
      <div class="field">
        <label for="cf-name">Name</label>
        <input id="cf-name" v-model="form.name" type="text" name="name" autocomplete="name" :aria-invalid="!!errors.name" :aria-describedby="errors.name ? 'cf-name-e' : undefined" />
        <p v-if="errors.name" id="cf-name-e" class="err">{{ errors.name }}</p>
      </div>
      <div class="field">
        <label for="cf-email">Email</label>
        <input id="cf-email" v-model="form.email" type="email" name="email" autocomplete="email" :aria-invalid="!!errors.email" :aria-describedby="errors.email ? 'cf-email-e' : undefined" />
        <p v-if="errors.email" id="cf-email-e" class="err">{{ errors.email }}</p>
      </div>
      <div class="field">
        <label for="cf-msg">Message</label>
        <textarea id="cf-msg" v-model="form.message" name="message" rows="5" :aria-invalid="!!errors.message" :aria-describedby="errors.message ? 'cf-msg-e' : undefined" />
        <p v-if="errors.message" id="cf-msg-e" class="err">{{ errors.message }}</p>
      </div>
      <div class="send">
        <button type="submit" class="btn btn-primary" :disabled="status === 'sending'">Send message <Icon name="arrow-right" :size="16" /></button>
        <p class="status" :class="status" role="status" aria-live="polite">{{ result }}</p>
      </div>
    </form>
    <section class="elsewhere" aria-labelledby="elsewhere-h">
      <h3 id="elsewhere-h" class="eyebrow">Elsewhere</h3>
      <SocialLinks labels />
      <a :href="landing.resumeSrc" target="_blank" rel="noopener" class="resume"><Icon name="doc" :size="16" />Résumé <Icon name="arrow-up-right" :size="14" /></a>
    </section>
  </article>
</template>
<style scoped>
.sep { color: rgba(138, 150, 158, 0.6); margin: 0 6px; }
.ptitle { font-family: var(--font-display); font-weight: 600; font-size: clamp(2rem, 2.6vw, 2.6rem); line-height: 1.05; letter-spacing: -0.015em; margin-top: 14px; }
.lede { margin-top: 14px; color: var(--mist); line-height: 1.6; font-size: 1.0625rem; }
.form { margin-top: 26px; display: grid; gap: 16px; }
label { display: block; font-size: 0.8125rem; font-weight: 500; color: var(--mist); margin-bottom: 6px; }
input, textarea {
  width: 100%; background: rgba(10, 13, 17, 0.7); border: 1px solid rgba(138, 150, 158, 0.32); border-radius: 10px;
  padding: 12px 14px; color: var(--porcelain); font-size: 1rem; transition: border-color 180ms; resize: vertical;
}
input:hover, textarea:hover { border-color: rgba(138, 150, 158, 0.55); }
input:focus, textarea:focus { outline: none; border-color: var(--ice-cyan); box-shadow: 0 0 0 3px rgba(154, 216, 214, 0.15); }
[aria-invalid='true'] { border-color: #e0a39a; }
.err { margin-top: 6px; font-size: 0.8125rem; color: #f0b8af; }
.send { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-top: 4px; }
.status { font-size: 0.875rem; color: var(--mist); }
.status.success { color: var(--ice-cyan); }
.status.error { color: #f0b8af; }
.elsewhere { margin-top: 34px; padding-top: 22px; border-top: 1px solid var(--hairline); }
.elsewhere .eyebrow { margin-bottom: 12px; }
.resume { margin-top: 10px; display: inline-flex; align-items: center; gap: 8px; color: var(--porcelain); font-size: 0.9375rem; min-height: 44px; }
.resume:hover { color: #fff; }
</style>
