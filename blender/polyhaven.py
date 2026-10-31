"""
Prepare CC0 scanned materials from Poly Haven (https://polyhaven.com, CC0) for the atelier.

  Blender -b --python blender/polyhaven.py -- <download_dir> <out_dir>

<download_dir> holds the 2K JPG maps (<id>_diff_2k.jpg, <id>_rough_2k.jpg, <id>_nor_gl_2k.jpg).
Albedo is normalised to the luminance and saturation the runtime tints were calibrated
for (see three/materials.ts), so palette control stays in code; roughness/normal pass through.
"""
import os
import sys
import numpy as np
import bpy

SRC, OUT = sys.argv[sys.argv.index('--') + 1:][:2]
os.makedirs(OUT, exist_ok=True)

# poly haven id -> (our texture set, output size, saturation kept, target mean luminance)
MAP = {
  'granite_tile': ('basalt_floor', 2048, 0.35, 0.55),
  'plaster_grey_04': ('limestone', 2048, 0.2, 0.6),
  'grey_plaster_02': ('plaster', 1024, 0.15, 0.62),
  'white_plaster_02': ('ceramic', 1024, 0.45, 0.86),
  'caban': ('fabric', 1024, 0.0, 0.6),
}


def load(path, size):
  img = bpy.data.images.load(path)
  img.colorspace_settings.name = 'Non-Color'
  if img.size[0] != size:
    img.scale(size, size)
  px = np.empty(size * size * 4, dtype=np.float32)
  img.pixels.foreach_get(px)
  bpy.data.images.remove(img)
  return px.reshape(size, size, 4)[..., :3]


def save(arr, path):
  h, w, _ = arr.shape
  img = bpy.data.images.new('o', w, h, alpha=False)
  img.colorspace_settings.name = 'Non-Color'
  rgba = np.ones((h, w, 4), dtype=np.float32)
  rgba[..., :3] = np.clip(arr, 0, 1)
  img.pixels.foreach_set(rgba.ravel())
  img.filepath_raw = path
  img.file_format = 'PNG'
  img.save()
  bpy.data.images.remove(img)


for pid, (name, size, sat, target) in MAP.items():
  diff = load(os.path.join(SRC, f'{pid}_diff_2k.jpg'), size)
  lum = diff @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
  gray = np.repeat(lum[..., None], 3, axis=-1)
  col = gray + (diff - gray) * sat
  col *= target / max(float(lum.mean()), 1e-4)
  save(col, os.path.join(OUT, f'{name}_albedo.png'))
  rough = load(os.path.join(SRC, f'{pid}_rough_2k.jpg'), size)
  save(rough, os.path.join(OUT, f'{name}_rough.png'))
  nrm = load(os.path.join(SRC, f'{pid}_nor_gl_2k.jpg'), size)
  save(nrm, os.path.join(OUT, f'{name}_normal.png'))
  print(f'[polyhaven] {pid} -> {name} ({size}px, mean lum {lum.mean():.3f} -> {target})')
