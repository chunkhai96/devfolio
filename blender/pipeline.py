"""
Atelier build pipeline (headless Blender).

  Blender -b --python blender/pipeline.py -- <command> [options]

Commands:
  preview <camera> [samples]   Cycles beauty render of a named camera to build/preview_<camera>.png
  bake [zones..] [--samples N] Bake lightmaps for zones (default all) to build/lm_<zone>.exr
  export                       Write public/atelier/world.glb (+ lightmaps via encode step)
  all                          bake + export
"""
import os
import sys
import json
import math
import time
import bpy
import bmesh
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'blender'))
import world  # noqa: E402

BUILD = os.path.join(ROOT, 'blender', 'build')
OUT = os.path.join(ROOT, 'public', 'atelier')
os.makedirs(BUILD, exist_ok=True)
os.makedirs(OUT, exist_ok=True)

ZONES = {'atrium': 4096, 'gallery': 4096, 'lab': 2048, 'corridor': 4096, 'terrace': 2048}
LM_K = 1.0   # encode knee: e = L / (L + K); stored sqrt(e)

# Preview cameras (Blender coords): loc, target, lens(mm)
CAMERAS = {
  'arrival': ((-5.0, -8.6, 2.1), (-0.6, 4.0, 2.5), 24, 0.16),
  'gallery': ((11.0, -2.5, 2.0), (24.0, 1.5, 2.0), 28, 0.05),
  'lab': ((-11.5, -4.5, 2.2), (-21.0, 3.0, 1.6), 28, 0.05),
  'corridor': ((0.8, 10.8, 2.0), (-0.5, 24.0, 2.0), 28, 0.05),
  'terrace': ((-3.0, 36.0, 2.0), (2.0, 46.0, 1.6), 28, 0.05),
  'bay': ((12.2, 1.2, 2.0), (14.6, 6.8, 2.1), 35, 0.0),
  'contact': ((-1.4, 38.6, 1.6), (0.0, 40.6, 0.8), 40, 0.0),
  'plinth': ((-4.0, -5.0, 1.4), (0.0, 0.0, 0.35), 35, 0.0),
}


def args():
  return sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []


def setup_cycles(samples):
  sc = bpy.context.scene
  sc.render.engine = 'CYCLES'
  prefs = bpy.context.preferences.addons['cycles'].preferences
  prefs.compute_device_type = 'METAL'
  prefs.get_devices()
  for d in prefs.devices:
    d.use = d.type == 'METAL'
  sc.cycles.device = 'GPU'
  sc.cycles.samples = samples
  sc.cycles.use_adaptive_sampling = False
  sc.cycles.max_bounces = 8
  sc.cycles.diffuse_bounces = 5
  sc.cycles.glossy_bounces = 3
  sc.cycles.transmission_bounces = 6
  sc.cycles.transparent_max_bounces = 6
  sc.cycles.sample_clamp_indirect = 8.0
  sc.cycles.caustics_reflective = False
  sc.cycles.caustics_refractive = False
  sc.view_settings.view_transform = 'AgX'
  sc.view_settings.look = 'None'


# ---------------------------------------------------------------------------
# Hidden-face culling: drop faces that touch other geometry or face the void
# ---------------------------------------------------------------------------
def build_bvh(objs):
  verts, polys = [], []
  for ob in objs:
    me = ob.data
    off = len(verts)
    verts.extend([ob.matrix_world @ v.co for v in me.vertices])
    polys.extend([[off + i for i in p.vertices] for p in me.polygons])
  return BVHTree.FromPolygons(verts, polys, epsilon=0.0)


HEMI = [Vector(v).normalized() for v in (
  (0, 0, 1), (0.6, 0, 0.8), (-0.6, 0, 0.8), (0, 0.6, 0.8), (0, -0.6, 0.8),
  (0.9, 0.3, 0.3), (-0.9, 0.3, 0.3), (0.3, -0.9, 0.3), (-0.3, 0.9, 0.3),
  (0.7, 0.7, 0.1), (-0.7, -0.7, 0.1), (0.7, -0.7, 0.1), (-0.7, 0.7, 0.1))]


def cull(ob, bvh, outdoor=False):
  bm = bmesh.new()
  bm.from_mesh(ob.data)
  bm.faces.ensure_lookup_table()
  kill = []
  for f in bm.faces:
    n = f.normal
    c = f.calc_center_median()
    p = c + n * 0.0008
    hitp, _, _, d = bvh.ray_cast(p, n, 0.004)
    if hitp is not None:
      kill.append(f)
      continue
    if outdoor:
      continue
    # tangent frame for hemisphere test
    t = n.orthogonal().normalized()
    b = n.cross(t)
    escaped = 0
    for h in HEMI:
      dirv = (t * h.x + b * h.y + n * h.z).normalized()
      if bvh.ray_cast(p, dirv, 200.0)[0] is None:
        escaped += 1
    if escaped == len(HEMI):
      kill.append(f)
  bmesh.ops.delete(bm, geom=kill, context='FACES')
  bm.to_mesh(ob.data)
  bm.free()
  return len(kill)


def lightmap_uv(ob):
  me = ob.data
  if 'lightmap' not in me.uv_layers:
    me.uv_layers.new(name='lightmap')
  me.uv_layers.active = me.uv_layers['lightmap']
  bpy.ops.object.select_all(action='DESELECT')
  ob.select_set(True)
  bpy.context.view_layer.objects.active = ob
  bpy.ops.object.mode_set(mode='EDIT')
  bpy.ops.mesh.select_all(action='SELECT')
  bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=0.0, area_weight=0.0,
                           correct_aspect=True, scale_to_bounds=False)
  bpy.ops.uv.pack_islands(rotate=True, margin_method='FRACTION', margin=0.0012, shape_method='AABB')
  bpy.ops.object.mode_set(mode='OBJECT')
  me.uv_layers.active = me.uv_layers['uv']
  for i, l in enumerate(me.uv_layers):
    l.active_render = (l.name == 'uv')


def prepare():
  t = time.time()
  objs = world.build_scene()
  statics = [o for n, o in objs.items() if n.endswith(('_lm', '_metal', '_fx')) or n == 'proxy' or n.startswith('screen_')]
  bvh = build_bvh([o for o in statics if o.name != 'proxy'])
  for name, ob in objs.items():
    if name.endswith('_lm'):
      k = cull(ob, bvh, outdoor=(name == 'terrace_lm'))
      print(f'[cull] {name}: removed {k} faces, {len(ob.data.polygons)} left')
  bvh2 = build_bvh([o for o in statics if o.name != 'proxy'])
  for name, ob in objs.items():
    if name.endswith('_metal'):
      k = cull(ob, bvh2, outdoor=True)
      print(f'[cull] {name}: removed {k}')
  for name, ob in objs.items():
    if name.endswith('_lm'):
      lightmap_uv(ob)
  print(f'[prepare] {time.time() - t:.1f}s')
  return objs


def preview(cam_names, samples=96):
  objs = prepare()
  setup_cycles(samples)
  sc = bpy.context.scene
  sc.cycles.use_denoising = True
  sc.render.resolution_x, sc.render.resolution_y = 1600, 900
  sc.view_settings.exposure = -1.0
  for ob in sc.objects:
    if ob.name.startswith('hit_'):
      ob.hide_render = True
  for cam_name in cam_names:
    render_cam(sc, cam_name)


def render_cam(sc, cam_name):
  loc, tgt, lens, shift = CAMERAS[cam_name]
  cd = bpy.data.cameras.new('cam')
  cd.lens = lens
  cd.shift_y = shift
  cd.sensor_width = 36
  cam = bpy.data.objects.new('cam', cd)
  sc.collection.objects.link(cam)
  cam.location = loc
  cam.rotation_euler = (Vector(tgt) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
  sc.camera = cam
  sc.render.filepath = os.path.join(BUILD, f'preview_{cam_name}.png')
  bpy.ops.render.render(write_still=True)
  print('[preview] wrote', sc.render.filepath)


def bake(zones, samples):
  objs = prepare()
  setup_cycles(samples)
  sc = bpy.context.scene
  for ob in sc.objects:
    if ob.name.startswith('hit_'):
      ob.hide_render = True
  sc.render.bake.margin = 6
  sc.render.bake.margin_type = 'EXTEND'
  sc.render.bake.use_clear = True
  for zone in zones:
    res = ZONES[zone]
    ob = objs[f'{zone}_lm']
    img = bpy.data.images.new(f'lm_{zone}', res, res, alpha=False, float_buffer=True)
    for m in ob.data.materials:
      nt = m.node_tree
      node = nt.nodes.get('BAKE') or nt.nodes.new('ShaderNodeTexImage')
      node.name = 'BAKE'
      node.image = img
      nt.nodes.active = node
    bpy.ops.object.select_all(action='DESELECT')
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob
    t = time.time()
    bpy.ops.object.bake(type='DIFFUSE', pass_filter={'DIRECT', 'INDIRECT'}, uv_layer='lightmap',
                        margin=6, use_clear=True)
    print(f'[bake] {zone} {res}px in {time.time() - t:.1f}s')
    px = np.empty(res * res * 4, dtype=np.float32)
    img.pixels.foreach_get(px)
    np.save(os.path.join(BUILD, f'lm_{zone}.npy'), px.reshape(res, res, 4)[..., :3])
  bpy.ops.wm.save_as_mainfile(filepath=os.path.join(BUILD, 'atelier.blend'))


def export():
  bpy.ops.wm.open_mainfile(filepath=os.path.join(BUILD, 'atelier.blend'))
  sc = bpy.context.scene
  bpy.ops.object.select_all(action='DESELECT')
  for ob in sc.objects:
    if ob.type == 'MESH' and ob.name != 'proxy':
      ob.select_set(True)
  # strip bake image nodes so the exporter doesn't embed them
  for m in bpy.data.materials:
    if m.node_tree and 'BAKE' in m.node_tree.nodes:
      m.node_tree.nodes.remove(m.node_tree.nodes['BAKE'])
  bpy.ops.export_scene.gltf(
    filepath=os.path.join(OUT, 'world.glb'), export_format='GLB', use_selection=True,
    export_texcoords=True, export_normals=True, export_materials='EXPORT', export_yup=True,
    export_lights=False, export_cameras=False, export_extras=False, export_apply=True,
    export_image_format='NONE', export_vertex_color='ACTIVE', export_all_vertex_colors=False)
  print('[export] world.glb')


if __name__ == '__main__':
  a = args()
  cmd = a[0] if a else 'all'
  if cmd == 'preview':
    preview(a[1].split(',') if len(a) > 1 else ['arrival'], int(a[2]) if len(a) > 2 else 96)
  elif cmd == 'bake':
    samples = 384
    zs = []
    i = 1
    while i < len(a):
      if a[i] == '--samples':
        samples = int(a[i + 1]); i += 2
      else:
        zs.append(a[i]); i += 1
    bake(zs or list(ZONES), samples)
  elif cmd == 'export':
    export()
  elif cmd == 'all':
    bake(list(ZONES), 384)
    export()
