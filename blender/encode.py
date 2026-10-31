"""
Encode baked float lightmaps (build/lm_<zone>.npy) to 8-bit PNGs for the web.

  Blender -b --python blender/encode.py -- [zones..]

Encoding (decoded in the runtime shader, see three/lightmap.ts):
  e = L / (L + K)      soft knee keeps highlight range without clipping
  s = sqrt(e)          perceptual spacing for the shadows
Optionally denoised with Blender's OpenImageDenoise via the compositor.
"""
import os
import sys
import numpy as np
import bpy

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, 'blender', 'build')
K = 1.0


def denoise(arr):
  """Run OIDN through the compositor on an HxWx3 float array."""
  h, w, _ = arr.shape
  img = bpy.data.images.new('src', w, h, alpha=False, float_buffer=True)
  rgba = np.ones((h, w, 4), dtype=np.float32)
  rgba[..., :3] = arr
  img.pixels.foreach_set(rgba.ravel())
  sc = bpy.context.scene
  sc.render.resolution_x, sc.render.resolution_y = w, h
  sc.render.resolution_percentage = 100
  sc.view_settings.view_transform = 'Standard'
  sc.display_settings.display_device = 'sRGB'
  tree = bpy.data.node_groups.new('dn', 'CompositorNodeTree')
  sc.compositing_node_group = tree
  n_in = tree.nodes.new('CompositorNodeImage')
  n_in.image = img
  n_dn = tree.nodes.new('CompositorNodeDenoise')
  out = tree.nodes.new('NodeGroupOutput')
  tree.interface.new_socket('Image', in_out='OUTPUT', socket_type='NodeSocketColor')
  tree.links.new(n_in.outputs['Image'], n_dn.inputs['Image'])
  tree.links.new(n_dn.outputs['Image'], out.inputs[0])
  path = os.path.join(BUILD, '_dn.exr')
  sc.render.image_settings.file_format = 'OPEN_EXR'
  sc.render.image_settings.color_depth = '32'
  sc.render.filepath = path
  bpy.ops.render.render(write_still=True)
  res = bpy.data.images.load(path)
  px = np.empty(w * h * 4, dtype=np.float32)
  res.pixels.foreach_get(px)
  return px.reshape(h, w, 4)[..., :3]


def save_png(arr, path):
  h, w, _ = arr.shape
  img = bpy.data.images.new('out', w, h, alpha=False)
  img.colorspace_settings.name = 'Non-Color'
  rgba = np.ones((h, w, 4), dtype=np.float32)
  rgba[..., :3] = arr
  img.pixels.foreach_set(rgba.ravel())
  img.filepath_raw = path
  img.file_format = 'PNG'
  img.save()
  bpy.data.images.remove(img)


def encode(zone, use_denoise=True):
  L = np.load(os.path.join(BUILD, f'lm_{zone}.npy')).astype(np.float32)
  L = np.maximum(L, 0)
  if use_denoise:
    try:
      L = np.maximum(denoise(L), 0)
    except Exception as ex:  # keep going with the raw bake
      print('[encode] denoise failed:', ex)
  e = L / (L + K)
  s = np.sqrt(e)
  save_png(s, os.path.join(BUILD, f'lm_{zone}.png'))
  print(f'[encode] {zone}: L p50={np.percentile(L, 50):.3f} p99={np.percentile(L, 99):.3f} max={L.max():.2f}')


if __name__ == '__main__':
  a = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
  dn = '--raw' not in a
  zones = [z for z in a if not z.startswith('--')] or ['atrium', 'gallery', 'lab', 'corridor', 'terrace']
  for z in zones:
    if os.path.exists(os.path.join(BUILD, f'lm_{z}.npy')):
      encode(z, dn)
