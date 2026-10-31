"""
Procedural, tileable PBR texture generator for The Digital Atelier.

Run with Blender's bundled Python (has numpy):
  /Applications/Blender.app/Contents/MacOS/Blender -b --python blender/textures.py -- <out_dir>

All noise is built in the frequency domain (FFT), so every map tiles seamlessly.
Albedo maps are neutral detail maps; the runtime tints them per material.
"""
import os
import sys
import numpy as np
import bpy

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'public/textures/src'
os.makedirs(OUT, exist_ok=True)


def freq_grid(h, w):
  fy = np.fft.fftfreq(h)[:, None]
  fx = np.fft.fftfreq(w)[None, :]
  return fy, fx


def norm01(a):
  a = a - a.min()
  return a / max(a.max(), 1e-8)


def fractal(h, w, beta=2.0, seed=0, lo=0.0, hi=0.5, ax=1.0, ay=1.0):
  """Tileable 1/f^beta noise. ax/ay stretch the spectrum for directional grain."""
  rng = np.random.default_rng(seed)
  F = np.fft.fft2(rng.standard_normal((h, w)))
  fy, fx = freq_grid(h, w)
  k = np.sqrt((fx * ax) ** 2 + (fy * ay) ** 2)
  k[0, 0] = 1.0
  amp = k ** (-beta / 2.0)
  amp[(k < lo) | (k > hi)] = 0.0
  amp[0, 0] = 0.0
  return norm01(np.real(np.fft.ifft2(F * amp)))


def band(h, w, center, width, seed=0):
  rng = np.random.default_rng(seed)
  F = np.fft.fft2(rng.standard_normal((h, w)))
  fy, fx = freq_grid(h, w)
  k = np.sqrt(fx ** 2 + fy ** 2)
  amp = np.exp(-((k - center) ** 2) / (2 * width ** 2))
  amp[0, 0] = 0.0
  return norm01(np.real(np.fft.ifft2(F * amp)))


def normal_from_height(hgt, strength):
  dx = (np.roll(hgt, -1, axis=1) - np.roll(hgt, 1, axis=1)) * 0.5
  dy = (np.roll(hgt, -1, axis=0) - np.roll(hgt, 1, axis=0)) * 0.5
  nx = -dx * strength
  ny = -dy * strength
  nz = np.ones_like(hgt)
  ln = np.sqrt(nx ** 2 + ny ** 2 + nz ** 2)
  return np.stack([nx / ln * 0.5 + 0.5, ny / ln * 0.5 + 0.5, nz / ln * 0.5 + 0.5], axis=-1)


def save(name, arr):
  """arr: HxW (gray) or HxWx3 in 0..1, values written as-is (non-color)."""
  if arr.ndim == 2:
    arr = np.stack([arr, arr, arr], axis=-1)
  h, w, _ = arr.shape
  rgba = np.ones((h, w, 4), dtype=np.float32)
  rgba[..., :3] = np.clip(arr, 0, 1)
  img = bpy.data.images.new(name, width=w, height=h, alpha=False, float_buffer=False)
  img.colorspace_settings.name = 'Non-Color'
  img.pixels.foreach_set(rgba.ravel())
  path = os.path.join(OUT, name + '.png')
  img.filepath_raw = path
  img.file_format = 'PNG'
  img.save()
  bpy.data.images.remove(img)
  print('wrote', path)


def smoothstep(e0, e1, x):
  t = np.clip((x - e0) / (e1 - e0), 0, 1)
  return t * t * (3 - 2 * t)


# ---------------------------------------------------------------------------
# Honed basalt floor: 4x4 large-format tiles per texture (texture spans 4.8 m)
# ---------------------------------------------------------------------------
def basalt_floor(n=2048, tiles=4, seed=11):
  cloud = fractal(n, n, 2.2, seed, hi=0.08)
  grain = fractal(n, n, 0.6, seed + 1, lo=0.08)
  speck = band(n, n, 0.32, 0.06, seed + 2)
  crystals = smoothstep(0.78, 0.9, speck)
  dark_specks = smoothstep(0.80, 0.93, band(n, n, 0.22, 0.05, seed + 3))
  base = 0.52 + 0.20 * (cloud - 0.5) + 0.10 * (grain - 0.5)
  base += 0.22 * crystals - 0.16 * dark_specks

  # per-tile tonal variation + grout
  yy, xx = np.mgrid[0:n, 0:n] / n * tiles
  ti, tj = np.floor(yy).astype(int), np.floor(xx).astype(int)
  rng = np.random.default_rng(seed + 9)
  tone = rng.uniform(-0.06, 0.06, (tiles, tiles))
  base += tone[ti % tiles, tj % tiles]
  fy, fx = yy - ti, xx - tj
  edge = np.minimum(np.minimum(fx, 1 - fx), np.minimum(fy, 1 - fy)) * (n / tiles)
  grout = 1.0 - smoothstep(0.6, 2.2, edge)       # ~2 px joint (~5 mm)
  bevel = 1.0 - smoothstep(1.5, 5.0, edge)       # eased arris
  albedo = np.clip(base * (1 - 0.35 * grout), 0, 1)

  rough = 0.58 + 0.10 * (cloud - 0.5) + 0.12 * (grain - 0.5) - 0.12 * crystals + 0.25 * grout
  height = 0.6 * grain * 0.02 + 0.004 * crystals - 0.12 * bevel - 0.18 * grout
  nrm = normal_from_height(height, 3.0)
  save('basalt_floor_albedo', albedo)
  save('basalt_floor_rough', np.clip(rough, 0, 1))
  save('basalt_floor_normal', nrm)


# ---------------------------------------------------------------------------
# Stone wall / plinth detail (charcoal limestone, fine fossil specks)
# ---------------------------------------------------------------------------
def limestone(n=1024, seed=21, name='limestone'):
  cloud = fractal(n, n, 2.4, seed, hi=0.06)
  mid = fractal(n, n, 1.6, seed + 1, lo=0.02, hi=0.2)
  grain = fractal(n, n, 0.4, seed + 2, lo=0.15)
  fossil = smoothstep(0.82, 0.95, band(n, n, 0.12, 0.03, seed + 3))
  pores = smoothstep(0.86, 0.97, band(n, n, 0.38, 0.05, seed + 4))
  albedo = 0.6 + 0.14 * (cloud - 0.5) + 0.08 * (mid - 0.5) + 0.04 * (grain - 0.5)
  albedo += 0.06 * fossil - 0.12 * pores
  rough = 0.72 + 0.08 * (mid - 0.5) + 0.1 * pores - 0.05 * fossil
  height = 0.015 * grain + 0.01 * mid - 0.05 * pores
  save(name + '_albedo', np.clip(albedo, 0, 1))
  save(name + '_rough', np.clip(rough, 0, 1))
  save(name + '_normal', normal_from_height(height, 7.0))


# ---------------------------------------------------------------------------
# Warm ceramic: smooth, faint glaze undulation and micro-imperfection
# ---------------------------------------------------------------------------
def ceramic(n=1024, seed=31):
  cloud = fractal(n, n, 2.6, seed, hi=0.05)
  orange = band(n, n, 0.05, 0.02, seed + 1)
  fine = fractal(n, n, 0.5, seed + 2, lo=0.2)
  albedo = 0.86 + 0.06 * (cloud - 0.5) + 0.015 * (fine - 0.5)
  rough = 0.42 + 0.08 * (cloud - 0.5) + 0.05 * (fine - 0.5)
  height = 0.02 * orange + 0.004 * fine
  save('ceramic_albedo', np.clip(albedo, 0, 1))
  save('ceramic_rough', np.clip(rough, 0, 1))
  save('ceramic_normal', normal_from_height(height, 3.0))


# ---------------------------------------------------------------------------
# Graphite microcement / plaster for ceilings and quiet walls
# ---------------------------------------------------------------------------
def plaster(n=1024, seed=41):
  cloud = fractal(n, n, 2.2, seed, hi=0.1)
  trowel = fractal(n, n, 1.8, seed + 1, lo=0.01, hi=0.12, ax=1.0, ay=2.5)
  fine = fractal(n, n, 0.3, seed + 2, lo=0.25)
  albedo = 0.62 + 0.12 * (cloud - 0.5) + 0.08 * (trowel - 0.5) + 0.03 * (fine - 0.5)
  rough = 0.82 + 0.08 * (trowel - 0.5) + 0.04 * (fine - 0.5)
  height = 0.02 * trowel + 0.006 * fine
  save('plaster_albedo', np.clip(albedo, 0, 1))
  save('plaster_rough', np.clip(rough, 0, 1))
  save('plaster_normal', normal_from_height(height, 4.0))


# ---------------------------------------------------------------------------
# Brushed titanium: directional grain along U
# ---------------------------------------------------------------------------
def brushed(n=1024, seed=51):
  streak = fractal(n, n, 1.0, seed, lo=0.004, ax=0.02, ay=1.0)
  fine = fractal(n, n, 0.6, seed + 1, lo=0.05, ax=0.05, ay=1.0)
  cloud = fractal(n, n, 2.5, seed + 2, hi=0.03)
  albedo = 0.9 + 0.05 * (streak - 0.5) + 0.03 * (cloud - 0.5)
  rough = 0.30 + 0.10 * (streak - 0.5) + 0.08 * (fine - 0.5) + 0.06 * (cloud - 0.5)
  height = 0.03 * streak + 0.02 * fine
  save('brushed_albedo', np.clip(albedo, 0, 1))
  save('brushed_rough', np.clip(rough, 0, 1))
  save('brushed_normal', normal_from_height(height, 2.5))


# ---------------------------------------------------------------------------
# Acoustic fabric: tight basket weave, period 16 px
# ---------------------------------------------------------------------------
def fabric(n=1024, seed=61, period=16):
  yy, xx = np.mgrid[0:n, 0:n].astype(np.float32)
  u = (xx % period) / period
  v = (yy % period) / period
  cell = ((np.floor(xx / period) + np.floor(yy / period)) % 2).astype(np.float32)
  warp = np.sin(np.pi * u) ** 0.6
  weft = np.sin(np.pi * v) ** 0.6
  h = np.where(cell > 0.5, warp * (0.6 + 0.4 * np.sin(np.pi * v)), weft * (0.6 + 0.4 * np.sin(np.pi * u)))
  fuzz = fractal(n, n, 0.3, seed, lo=0.2)
  slub = fractal(n, n, 1.2, seed + 1, lo=0.01, hi=0.1, ax=0.15, ay=1.0)
  cloud = fractal(n, n, 2.4, seed + 2, hi=0.04)
  albedo = 0.6 + 0.18 * (h - 0.5) + 0.06 * (slub - 0.5) + 0.06 * (cloud - 0.5) + 0.05 * (fuzz - 0.5)
  rough = 0.9 + 0.05 * (fuzz - 0.5)
  save('fabric_albedo', np.clip(albedo, 0, 1))
  save('fabric_rough', np.clip(rough, 0, 1))
  save('fabric_normal', normal_from_height(h * 0.25 + 0.05 * fuzz, 3.0))


basalt_floor()
limestone()
limestone(seed=27, name='basalt')
ceramic()
plaster()
brushed()
fabric()
