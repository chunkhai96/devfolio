import { writeFile, mkdir } from 'node:fs/promises'
import { join, basename } from 'node:path'

/**
 * Dev-only: persist a frame rendered by the browser build (poster image, review snapshots).
 * Disabled outside `nuxt dev`.
 */
export default defineEventHandler(async (event) => {
  if (!import.meta.dev) throw createError({ statusCode: 404 })
  const body = await readBody<{ name: string, dataUrl: string, dir?: 'public' | 'review' | 'images' }>(event)
  const m = body.dataUrl.match(/^data:image\/(webp|png|jpeg);base64,(.+)$/)
  if (!m) throw createError({ statusCode: 400, statusMessage: 'bad image' })
  const dir = body.dir === 'public' ? join(process.cwd(), 'public', 'atelier')
    : body.dir === 'images' ? join(process.cwd(), 'public', 'images')
    : join(process.cwd(), 'docs', 'review')
  await mkdir(dir, { recursive: true })
  const file = join(dir, basename(body.name))
  await writeFile(file, Buffer.from(m[2], 'base64'))
  return { file }
})
