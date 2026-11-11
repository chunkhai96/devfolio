"""
The Digital Atelier — procedural world builder.

Builds the full architectural campus in Blender (Z-up, metres) from code so the
art is reproducible and reviewable. Used by pipeline.py (bake + export).

Zones (Blender coords, X east / Y north):
  atrium    x[-9, 9]     y[-9, 9]     ceiling 10 (oculus 7x7)
  gallery   x[9.6, 34]   y[-6, 6]     ceiling 7.6   (projects)
  lab       x[-26, -9.6] y[-7, 7]     ceiling 7.6   (capabilities, talks)
  corridor  x[-3.5, 3.5] y[9.6, 34]   ceiling 7.6   (experience, certifications)
  terrace   x[-12, 12]   y[34, 47]    open sky      (contact)
"""
import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Euler

MATS = [
  'basalt_floor', 'stone_wall', 'plaster', 'ceramic', 'fabric', 'basalt', 'black',
  'titanium', 'titanium_dark',
  'glass', 'oled', 'emit_warm', 'emit_cyan', 'sky', 'water',
]
LIGHTMAPPED = {'basalt_floor', 'stone_wall', 'plaster', 'ceramic', 'fabric', 'basalt', 'black'}
METAL = {'titanium', 'titanium_dark'}

# Linear-ish base colours used for the bake (bounce colour) — runtime uses textures.
BAKE_COLOR = {
  'basalt_floor': (0.055, 0.058, 0.062), 'stone_wall': (0.11, 0.115, 0.12),
  'plaster': (0.075, 0.08, 0.088), 'ceramic': (0.62, 0.58, 0.52), 'fabric': (0.10, 0.105, 0.11),
  'basalt': (0.035, 0.037, 0.04), 'black': (0.01, 0.01, 0.01),
  'titanium': (0.45, 0.47, 0.48), 'titanium_dark': (0.12, 0.13, 0.14), 'water': (0.01, 0.012, 0.015),
}

WARM = (1.0, 0.80, 0.62)      # ~4000 K
WARM_SOFT = (1.0, 0.86, 0.72)
NEUTRAL = (1.0, 0.92, 0.84)


def kelvin_mix(c, s):
  return tuple(1 - s + s * v for v in c)


# ---------------------------------------------------------------------------
# Geometry builder: accumulates faces into one bmesh per (object name)
# ---------------------------------------------------------------------------
class Builder:
  def __init__(self):
    self.bms = {}
    self.lights = []
    self.zone = 'atrium'

  def bm(self, obj):
    if obj in ('metal', 'fx'):
      obj = f'{self.zone}_{obj}'
    if obj not in self.bms:
      b = bmesh.new()
      b.loops.layers.uv.new('uv')
      b.loops.layers.color.new('tone')
      self.bms[obj] = b
    return self.bms[obj]

  # -- low level ------------------------------------------------------------
  def _emit(self, obj, verts, faces, mat, smooth_faces=None, uvs=None, tone=None):
    b = self.bm(obj)
    uvl = b.loops.layers.uv['uv']
    col = b.loops.layers.color['tone']
    tc = tone or (1.0, 1.0, 1.0, 1.0)
    mi = MATS.index(mat)
    vs = [b.verts.new(v) for v in verts]
    for fi, f in enumerate(faces):
      try:
        nf = b.faces.new([vs[i] for i in f])
      except ValueError:
        continue
      nf.material_index = mi
      nf.smooth = bool(smooth_faces and smooth_faces[fi])
      for loop in nf.loops:
        loop[col] = tc
      if uvs is not None:
        for loop, i in zip(nf.loops, f):
          loop[uvl].uv = uvs[i]
      else:
        nf.normal_update()
        n = nf.normal
        ax = max(range(3), key=lambda k: abs(n[k]))
        for loop in nf.loops:
          co = loop.vert.co
          if ax == 2:
            loop[uvl].uv = (co.x, co.y)
          elif ax == 0:
            loop[uvl].uv = (co.y, co.z)
          else:
            loop[uvl].uv = (co.x, co.z)

  def box(self, obj, c, s, mat, bevel=0.0, rot=(0, 0, 0), m=None, tone=None):
    """Axis box centre c, size s; optional chamfer (flat shaded)."""
    tb = bmesh.new()
    bmesh.ops.create_cube(tb, size=1.0)
    bmesh.ops.scale(tb, vec=Vector(s), verts=tb.verts)
    if bevel > 0:
      bmesh.ops.bevel(tb, geom=list(tb.edges), offset=min(bevel, min(s) * 0.45), segments=1,
                      affect='EDGES', profile=0.5, clamp_overlap=True)
    M = m if m is not None else Matrix.Translation(Vector(c)) @ Euler(rot).to_matrix().to_4x4()
    verts = [M @ v.co for v in tb.verts]
    idx = {v: i for i, v in enumerate(tb.verts)}
    faces = [[idx[v] for v in f.verts] for f in tb.faces]
    tb.free()
    self._emit(obj, verts, faces, mat, tone=tone)

  def prism(self, obj, corners, mat, bevel=0.0):
    """8 corners: bottom (x0y0, x1y0, x1y1, x0y1) then top in the same order."""
    tb = bmesh.new()
    vs = [tb.verts.new(Vector(c)) for c in corners]
    for f in ((0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)):
      tb.faces.new([vs[i] for i in f])
    bmesh.ops.recalc_face_normals(tb, faces=tb.faces)
    if bevel > 0:
      bmesh.ops.bevel(tb, geom=list(tb.edges), offset=bevel, segments=1, affect='EDGES', profile=0.5, clamp_overlap=True)
    idx = {v: i for i, v in enumerate(tb.verts)}
    verts = [v.co.copy() for v in tb.verts]
    faces = [[idx[v] for v in f.verts] for f in tb.faces]
    tb.free()
    self._emit(obj, verts, faces, mat)

  def bx(self, obj, x0, x1, y0, y1, z0, z1, mat, bevel=0.0):
    self.box(obj, ((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2),
             (abs(x1 - x0), abs(y1 - y0), abs(z1 - z0)), mat, bevel)

  def lathe(self, obj, profile, mat, segs=64, center=(0, 0, 0), smooth=True, cap=True,
            arc=(0, 2 * math.pi), m=None):
    """profile: list of (r, z) from bottom to top."""
    cx, cy, cz = center
    full = abs(arc[1] - arc[0] - 2 * math.pi) < 1e-6
    n = segs if full else segs + 1
    verts, faces, sm = [], [], []
    for i in range(n):
      a = arc[0] + (arc[1] - arc[0]) * i / segs
      ca, sa = math.cos(a), math.sin(a)
      for r, z in profile:
        verts.append(Vector((cx + r * ca, cy + r * sa, cz + z)))
    P = len(profile)
    for i in range(segs):
      i2 = (i + 1) % n
      for j in range(P - 1):
        a, b_, c, d = i * P + j, i2 * P + j, i2 * P + j + 1, i * P + j + 1
        faces.append([a, b_, c, d])
        # flat if the profile segment is horizontal (caps / ledges)
        dz = profile[j + 1][1] - profile[j][1]
        sm.append(smooth and abs(dz) > 1e-6)
    if cap and full:
      if profile[0][0] > 1e-6:
        faces.append([i * P for i in reversed(range(n))]); sm.append(False)
      if profile[-1][0] > 1e-6:
        faces.append([i * P + P - 1 for i in range(n)]); sm.append(False)
    if m is not None:
      verts = [m @ v for v in verts]
    self._emit(obj, verts, faces, mat, sm)

  def quad(self, obj, corners, mat, uvs=((0, 0), (1, 0), (1, 1), (0, 1))):
    self._emit(obj, [Vector(c) for c in corners], [[0, 1, 2, 3]], mat, uvs=list(uvs))

  # -- lights ---------------------------------------------------------------
  def area(self, name, loc, target, size, power, color=WARM, size_y=None, spread=180):
    self.lights.append(dict(kind='AREA', name=name, loc=loc, target=target, size=size,
                            size_y=size_y, power=power, color=color, spread=spread))

  def spot(self, name, loc, target, power, angle=40, blend=0.6, radius=0.15, color=WARM):
    self.lights.append(dict(kind='SPOT', name=name, loc=loc, target=target, power=power,
                            angle=angle, blend=blend, radius=radius, color=color))

  def point(self, name, loc, power, radius=0.1, color=WARM):
    self.lights.append(dict(kind='POINT', name=name, loc=loc, power=power, radius=radius, color=color))


# ---------------------------------------------------------------------------
# Architectural kit
# ---------------------------------------------------------------------------
def solid_wall_x(B, obj, x0, x1, y0, y1, z0, z1, openings, mat):
  """Wall slab running along X between y0..y1 with rectangular openings (ox0, ox1, oz0, oz1)."""
  cuts = sorted(openings)
  cur = x0
  for ox0, ox1, oz0, oz1 in cuts:
    if ox0 > cur:
      B.bx(obj, cur, ox0, y0, y1, z0, z1, mat)
    if oz1 < z1:
      B.bx(obj, ox0, ox1, y0, y1, oz1, z1, mat)
    if oz0 > z0:
      B.bx(obj, ox0, ox1, y0, y1, z0, oz0, mat)
    cur = ox1
  if cur < x1:
    B.bx(obj, cur, x1, y0, y1, z0, z1, mat)


def solid_wall_y(B, obj, y0, y1, x0, x1, z0, z1, openings, mat):
  cuts = sorted(openings)
  cur = y0
  for oy0, oy1, oz0, oz1 in cuts:
    if oy0 > cur:
      B.bx(obj, x0, x1, cur, oy0, z0, z1, mat)
    if oz1 < z1:
      B.bx(obj, x0, x1, oy0, oy1, oz1, z1, mat)
    if oz0 > z0:
      B.bx(obj, x0, x1, oy0, oy1, z0, oz0, mat)
    cur = oy1
  if cur < y1:
    B.bx(obj, x0, x1, cur, y1, z0, z1, mat)


def clad(B, obj, axis, plane, facing, a0, a1, z0, z1, pw, rows, openings, mat,
         depth=0.06, gap=0.008, bevel=0.004, jitter=0.0):
  """Stone panel cladding on a wall plane.
  axis 'x': wall runs along X at y=plane, facing +1/-1 in Y. axis 'y': along Y at x=plane.
  Panels whose centre falls in an opening are skipped."""
  n = max(1, round((a1 - a0) / pw))
  w = (a1 - a0) / n
  zs = rows if isinstance(rows, (list, tuple)) else [z0 + (z1 - z0) * k / rows for k in range(rows + 1)]
  for i in range(n):
    for r in range(len(zs) - 1):
      ca = a0 + (i + 0.5) * w
      cz = (zs[r] + zs[r + 1]) / 2
      h = zs[r + 1] - zs[r]
      if any(o[0] < ca < o[1] and o[2] < cz < o[3] for o in openings):
        continue
      dd = depth
      cn = plane + facing * dd / 2
      size_a, size_z = w - gap, h - gap
      # natural stone: each slab has its own tone (deterministic hash)
      hsh = math.sin(ca * 12.9898 + cz * 78.233 + plane * 37.719) * 43758.5453
      hsh -= math.floor(hsh)
      hs2 = math.sin(ca * 93.989 + cz * 67.345 + plane * 11.13) * 24634.6345
      hs2 -= math.floor(hs2)
      t = 0.70 + 0.30 * hsh
      tone = (t * (0.98 + 0.02 * hs2), t * 0.99, t * (1.0 - 0.02 * hs2) + 0.01, 1.0)
      if axis == 'x':
        B.box(obj, (ca, cn, cz), (size_a, dd, size_z), mat, bevel, tone=tone)
      else:
        B.box(obj, (cn, ca, cz), (dd, size_a, size_z), mat, bevel, tone=tone)


def portal(B, axis, plane0, plane1, a0, a1, z1, frame=0.05, cl=0.06):
  """Titanium-lined reveal through a wall thickness, with a slim proud frame on both faces."""
  t = 0.012
  plane0, plane1 = plane0 - cl, plane1 + cl
  if axis == 'x':   # opening through a wall perpendicular to Y
    B.bx('metal', a0, a0 + t, plane0, plane1, 0, z1, 'titanium')
    B.bx('metal', a1 - t, a1, plane0, plane1, 0, z1, 'titanium')
    B.bx('metal', a0, a1, plane0, plane1, z1 - t, z1, 'titanium')
    for p, s in ((plane0, -1), (plane1, 1)):
      B.bx('metal', a0 - frame, a0 + 0.004, p - 0.02 * (s < 0), p + 0.02 * (s > 0), 0, z1 + frame, 'titanium', 0.003)
      B.bx('metal', a1 - 0.004, a1 + frame, p - 0.02 * (s < 0), p + 0.02 * (s > 0), 0, z1 + frame, 'titanium', 0.003)
      B.bx('metal', a0 - frame, a1 + frame, p - 0.02 * (s < 0), p + 0.02 * (s > 0), z1 - 0.004, z1 + frame, 'titanium', 0.003)
  else:
    B.bx('metal', plane0, plane1, a0, a0 + t, 0, z1, 'titanium')
    B.bx('metal', plane0, plane1, a1 - t, a1, 0, z1, 'titanium')
    B.bx('metal', plane0, plane1, a0, a1, z1 - t, z1, 'titanium')
    for p, s in ((plane0, -1), (plane1, 1)):
      B.bx('metal', p - 0.02 * (s < 0), p + 0.02 * (s > 0), a0 - frame, a0 + 0.004, 0, z1 + frame, 'titanium', 0.003)
      B.bx('metal', p - 0.02 * (s < 0), p + 0.02 * (s > 0), a1 - 0.004, a1 + frame, 0, z1 + frame, 'titanium', 0.003)
      B.bx('metal', p - 0.02 * (s < 0), p + 0.02 * (s > 0), a0 - frame, a1 + frame, z1 - 0.004, z1 + frame, 'titanium', 0.003)


def bench(B, obj, cx, cy, length, along='x', depth=0.52, h=0.44):
  """Gallery bench: chamfered basalt slab with a shadow-gap underside, on two brushed-titanium
  sled frames (posts, foot rail and a cross rail) set in from the ends."""
  def P(u, v, z):  # local bench coords -> world (u along the length)
    return (cx + u, cy + v, z) if along == 'x' else (cx + v, cy + u, z)

  def S(su, sv, sz):
    return (su, sv, sz) if along == 'x' else (sv, su, sz)
  t = 0.075
  B.box(obj, P(0, 0, h - t / 2), S(length, depth, t), 'basalt', 0.01)
  B.box(obj, P(0, 0, h - t - 0.012), S(length - 0.12, depth - 0.1, 0.024), 'black')
  rail = 0.034
  for su in (-1, 1):
    u = su * (length / 2 - 0.32)
    for sv in (-1, 1):
      B.box('metal', P(u, sv * (depth / 2 - 0.07), (h - t - 0.024) / 2), S(rail, rail, h - t - 0.024), 'titanium', 0.003)
    B.box('metal', P(u, 0, rail / 2), S(rail, depth - 0.1, rail), 'titanium', 0.003)
    B.box('metal', P(u, 0, h - t - 0.024 - rail / 2), S(rail, depth - 0.1, rail), 'titanium', 0.003)
  B.box('metal', P(0, 0, 0.14), S(length - 0.64, rail * 0.8, rail * 0.8), 'titanium_dark', 0.003)


def screen(B, name, center, w, h, normal, bezel=0.02, depth=0.035, frame_mat='titanium_dark', lean=0.0):
  """Display: thin housing + emissive OLED quad (own object, UV 0..1).
  normal = horizontal facing direction (towards viewer); lean = radians the top leans back."""
  n = Vector(normal).normalized()
  upv = Vector((0, 0, 1))
  right = upv.cross(n).normalized()
  back = -n
  rot = Matrix((right, back, upv)).transposed().to_4x4()   # local: x right, y into wall, z up
  M = Matrix.Translation(Vector(center)) @ rot @ Matrix.Rotation(-lean, 4, 'X')
  B.box('metal', None, (w + 2 * bezel, depth, h + 2 * bezel), frame_mat, 0.006,
        m=M @ Matrix.Translation((0, depth / 2, 0)))
  hw, hh = w / 2, h / 2
  if w > 1.0:
    fw, gap, proud = 0.016, 0.006, 0.006
    ox, oz = hw + bezel + gap + fw / 2, hh + bezel + gap + fw / 2
    for (fx_, fz_, sx_, sz_) in ((0, oz, 2 * ox + fw, fw), (0, -oz, 2 * ox + fw, fw), (ox, 0, fw, 2 * oz - fw), (-ox, 0, fw, 2 * oz - fw)):
      B.box('metal', None, (sx_, depth + proud, sz_), 'titanium', 0.003,
            m=M @ Matrix.Translation((fx_, (depth - proud) / 2, fz_)))
  cs = [M @ Vector((x, -0.0015, z)) for x, z in ((-hw, -hh), (hw, -hh), (hw, hh), (-hw, hh))]
  B.quad(name, cs, 'oled')
  return M


def hit(B, name, c, s):
  B.box(name, c, s, 'black')


# ---------------------------------------------------------------------------
# Zones
# ---------------------------------------------------------------------------
H_WING = 7.6
PORTAL_H = 7.08
PANEL_Z0 = 0.12


def build_atrium(B):
  B.zone = 'atrium'
  o = 'atrium_lm'
  # floor slab (top at z=0) + recessed shadow gap channel around perimeter
  B.bx(o, -9.0, 9.0, -9.0, 9.0, -0.3, 0.0, 'basalt_floor')
  # walls: structural backing (plaster, visible in joints) + stone cladding
  op_n = [(-2.25, 2.25, 0, PORTAL_H)]
  op_ew = [(-2.25, 2.25, 0, PORTAL_H)]
  solid_wall_x(B, o, -9.6, 9.6, 9.06, 9.6, 0, 10.0, op_n, 'black')        # north
  solid_wall_x(B, o, -9.6, 9.6, -9.6, -9.06, 0, 10.0, [], 'black')        # south
  solid_wall_y(B, o, -9.06, 9.06, 9.06, 9.6, 0, 10.0, op_ew, 'black')     # east
  solid_wall_y(B, o, -9.06, 9.06, -9.6, -9.06, 0, 10.0, op_ew, 'black')   # west
  ztop = 9.4
  clad(B, o, 'x', 9.06, -1, -9.06, 9.06, PANEL_Z0, ztop, 1.5, 4, op_n, 'stone_wall')
  clad(B, o, 'x', -9.06, 1, -9.06, 9.06, PANEL_Z0, ztop, 1.5, 4, [], 'stone_wall')
  clad(B, o, 'y', 9.06, -1, -9.06, 9.06, PANEL_Z0, ztop, 1.5, 4, op_ew, 'stone_wall')
  clad(B, o, 'y', -9.06, 1, -9.06, 9.06, PANEL_Z0, ztop, 1.5, 4, op_ew, 'stone_wall')
  # base reveal: titanium skirting set back in the shadow gap
  for (x0, x1, y0, y1) in ((-9.06, 9.06, 9.0, 9.06), (-9.06, 9.06, -9.06, -9.0)):
    for a0, a1 in (((-9.06, -2.25), (2.25, 9.06)) if y0 > 0 else ((-9.06, 9.06),)):
      B.bx('metal', a0, a1, y0, y1, 0.0, 0.1, 'titanium_dark')
  for (x0, x1) in ((9.0, 9.06), (-9.06, -9.0)):
    for a0, a1 in ((-9.06, -2.25), (2.25, 9.06)):
      B.bx('metal', x0, x1, a0, a1, 0.0, 0.1, 'titanium_dark')

  # ceiling: plaster soffit at 10 with coffers, perimeter wall-wash slot, oculus 7x7
  oc = 3.5
  B.bx(o, -9.6, 9.6, oc, 9.6, 10.0, 10.4, 'plaster')
  B.bx(o, -9.6, 9.6, -9.6, -oc, 10.0, 10.4, 'plaster')
  B.bx(o, -9.6, -oc, -oc, oc, 10.0, 10.4, 'plaster')
  B.bx(o, oc, 9.6, -oc, oc, 10.0, 10.4, 'plaster')
  # dropped soffit band leaving a 0.39 m wall-wash slot against the stone
  e0, e1 = 8.01, 8.61
  B.bx(o, -e1, e1, e0, e1, 9.4, 10.0, 'plaster', 0.008)
  B.bx(o, -e1, e1, -e1, -e0, 9.4, 10.0, 'plaster', 0.008)
  B.bx(o, e0, e1, -e0, e0, 9.4, 10.0, 'plaster', 0.008)
  B.bx(o, -e1, -e0, -e0, e0, 9.4, 10.0, 'plaster', 0.008)
  # coffer beams on a 3 m grid (stop at the oculus)
  for g in (-6.0, -3.0, 3.0, 6.0):
    for (u0, u1) in ((-e0, -oc - 0.4), (oc + 0.4, e0)) if abs(g) < oc else ((-e0, e0),):
      B.bx(o, g - 0.18, g + 0.18, u0, u1, 9.5, 10.0, 'plaster', 0.008)
      B.bx(o, u0, u1, g - 0.18, g + 0.18, 9.5, 10.0, 'plaster', 0.008)
  # oculus: ceramic-lined light well 10 -> 12, with a trough lip hiding uplights
  w = 0.05
  B.bx(o, -oc, oc, oc - w, oc, 10.0, 12.0, 'ceramic')
  B.bx(o, -oc, oc, -oc, -oc + w, 10.0, 12.0, 'ceramic')
  B.bx(o, oc - w, oc, -oc + w, oc - w, 10.0, 12.0, 'ceramic')
  B.bx(o, -oc, -oc + w, -oc + w, oc - w, 10.0, 12.0, 'ceramic')
  t0 = oc - w - 0.42
  B.bx(o, -oc + w, oc - w, t0, oc - w, 9.78, 9.82, 'plaster')
  B.bx(o, -oc + w, oc - w, -oc + w, -t0, 9.78, 9.82, 'plaster')
  B.bx(o, t0, oc - w, -t0, t0, 9.78, 9.82, 'plaster')
  B.bx(o, -oc + w, -t0, -t0, t0, 9.78, 9.82, 'plaster')
  for (x0_, x1_, y0_, y1_) in ((-t0 - 0.02, t0 + 0.02, t0, t0 + 0.02), (-t0 - 0.02, t0 + 0.02, -t0 - 0.02, -t0),   # closes the corners
                               (t0, t0 + 0.02, -t0, t0), (-t0 - 0.02, -t0, -t0, t0)):
    B.bx('metal', x0_, x1_, y0_, y1_, 9.78, 10.12, 'titanium', 0.003)
  B.quad('fx', [(-oc, -oc, 12.0), (-oc, oc, 12.0), (oc, oc, 12.0), (oc, -oc, 12.0)], 'sky')
  for g in (-1.75, 0.0, 1.75):
    B.bx('metal', g - 0.03, g + 0.03, -oc, oc, 11.86, 11.98, 'titanium_dark')
    B.bx('metal', -oc, oc, g - 0.03, g + 0.03, 11.86, 11.98, 'titanium_dark')

  # wall-wash lights in the slot, aimed at walls (grazing stone)
  for name, loc, tgt, size in (
    ('ww_n', (0, 8.8, 9.75), (0, 9.6, 3.0), 16.8), ('ww_s', (0, -8.8, 9.75), (0, -9.6, 3.0), 16.8),
    ('ww_e', (8.8, 0, 9.75), (9.6, 0, 3.0), 16.8), ('ww_w', (-8.8, 0, 9.75), (-9.6, 0, 3.0), 16.8)):
    sx, sy = (size, 0.12) if name in ('ww_n', 'ww_s') else (0.12, size)
    B.area(name, loc, tgt, size=sx, size_y=sy, power={'ww_n': 1100, 'ww_s': 380, 'ww_e': 560, 'ww_w': 560}[name], color=WARM)
  for name, loc, tgt, sx, sy in (('cu_n', (0, 8.3, 9.38), (0, 6.0, 10.0), 16.0, 0.08), ('cu_s', (0, -8.3, 9.38), (0, -6.0, 10.0), 16.0, 0.08),
                                 ('cu_e', (8.3, 0, 9.38), (6.0, 0, 10.0), 0.08, 16.0), ('cu_w', (-8.3, 0, 9.38), (-6.0, 0, 10.0), 0.08, 16.0)):
    B.area(name, loc, tgt, size=sx, size_y=sy, power=160, color=WARM_SOFT)
  # oculus uplights washing the ceramic reveal
  m_ = oc - w - 0.2
  for i, (loc, tgt) in enumerate((((0, m_, 9.9), (0, oc - 0.6, 12)), ((0, -m_, 9.9), (0, -oc + 0.6, 12)),
                                  ((m_, 0, 9.9), (oc - 0.6, 0, 12)), ((-m_, 0, 9.9), (-oc + 0.6, 0, 12)))):
    B.area(f'oc_{i}', loc, tgt, size=6.6 if i < 2 else 0.1, size_y=0.1 if i < 2 else 6.6, power=520, color=WARM_SOFT)
  # hero downlight pool on the plinth
  B.spot('hero_spot', (0, 0, 11.6), (0, 0, 0), power=7000, angle=34, blend=0.75, radius=0.5, color=NEUTRAL)
  B.area('hero_fill', (0, 0, 11.5), (0, 0, 0), size=5.0, size_y=5.0, power=500, color=(0.80, 0.86, 0.95))

  # hero plinth: dark basalt foot, recessed warm seam, ceramic drum with titanium band and a
  # polished basalt top inset (mirrors the sculpture above)
  B.lathe(o, [(0, 0), (3.2, 0), (3.2, 0.10), (3.17, 0.13), (0, 0.13)], 'basalt', segs=128)
  B.lathe(o, [(0, 0.13), (2.20, 0.13), (2.20, 0.17), (0, 0.17)], 'black', segs=128)
  B.lathe(o, [(2.36, 0.17), (2.36, 0.50), (2.34, 0.52), (2.18, 0.52), (2.18, 0.47)], 'ceramic', segs=128, cap=False)
  B.lathe(o, [(0, 0.47), (2.18, 0.47), (2.18, 0.50), (0, 0.50)], 'basalt', segs=128)
  B.lathe('metal', [(2.362, 0.40), (2.372, 0.40), (2.372, 0.43), (2.362, 0.43)], 'titanium', segs=128, cap=False)
  B.lathe('fx', [(2.21, 0.135), (2.21, 0.165)], 'emit_warm', segs=128, smooth=True, cap=False)
  # sculpture suspension: titanium ring + 4 hangers
  ring_z = 9.2
  B.lathe('metal', [(2.95, ring_z - 0.05), (3.05, ring_z - 0.05), (3.05, ring_z + 0.05), (2.95, ring_z + 0.05), (2.95, ring_z - 0.05)],
          'titanium', segs=128, cap=False)
  # ring hangs on fine cables (runtime), no rigid rods

  # benches: one quiet foreground monolith (left), one facing the gallery
  bench(B, o, -5.6, -3.4, 3.2, along='y')
  bench(B, o, 5.8, 4.2, 3.2, along='y')
  # destination hit volumes (portals)
  hit(B, 'hit_dest_gallery', (9.3, 0, 3.5), (0.8, 4.5, 7))
  hit(B, 'hit_dest_lab', (-9.3, 0, 3.5), (0.8, 4.5, 7))
  hit(B, 'hit_dest_corridor', (0, 9.3, 3.5), (4.5, 0.8, 7))
  hit(B, 'hit_hero', (0, 0, 4.5), (5.4, 5.4, 9.0))
  portal(B, 'x', 9.06, 9.6, -2.25, 2.25, PORTAL_H)
  portal(B, 'y', 9.06, 9.6, -2.25, 2.25, PORTAL_H)
  portal(B, 'y', -9.6, -9.06, -2.25, 2.25, PORTAL_H)


def wing_ceiling(B, o, x0, x1, y0, y1, slot_axis, slot_w=1.2, slot_from=None, slot_to=None):
  """Plaster ceiling at H_WING with a recessed luminous slot running along slot_axis."""
  z0, z1 = H_WING, H_WING + 0.4
  if slot_axis is None:
    B.bx(o, x0, x1, y0, y1, z0, z1, 'plaster')
    return
  if slot_axis == 'x':
    cy = (y0 + y1) / 2
    a, b = slot_from if slot_from is not None else x0, slot_to if slot_to is not None else x1
    B.bx(o, x0, x1, y0, cy - slot_w / 2, z0, z1, 'plaster')
    B.bx(o, x0, x1, cy + slot_w / 2, y1, z0, z1, 'plaster')
    B.bx(o, x0, a, cy - slot_w / 2, cy + slot_w / 2, z0, z1, 'plaster')
    B.bx(o, b, x1, cy - slot_w / 2, cy + slot_w / 2, z0, z1, 'plaster')
    B.bx(o, a, b, cy - slot_w / 2, cy + slot_w / 2, z1 + 0.5, z1 + 0.6, 'plaster')
    B.bx(o, a, b, cy - slot_w / 2 - 0.02, cy - slot_w / 2, z1, z1 + 0.5, 'ceramic')
    B.bx(o, a, b, cy + slot_w / 2, cy + slot_w / 2 + 0.02, z1, z1 + 0.5, 'ceramic')
    B.quad('fx', [(a, cy - slot_w / 2 + 0.05, z1 + 0.35), (b, cy - slot_w / 2 + 0.05, z1 + 0.35),
                  (b, cy + slot_w / 2 - 0.05, z1 + 0.35), (a, cy + slot_w / 2 - 0.05, z1 + 0.35)][::-1], 'emit_warm')
  else:
    cx = (x0 + x1) / 2
    a, b = slot_from if slot_from is not None else y0, slot_to if slot_to is not None else y1
    B.bx(o, x0, cx - slot_w / 2, y0, y1, z0, z1, 'plaster')
    B.bx(o, cx + slot_w / 2, x1, y0, y1, z0, z1, 'plaster')
    B.bx(o, cx - slot_w / 2, cx + slot_w / 2, y0, a, z0, z1, 'plaster')
    B.bx(o, cx - slot_w / 2, cx + slot_w / 2, b, y1, z0, z1, 'plaster')
    B.bx(o, cx - slot_w / 2, cx + slot_w / 2, a, b, z1 + 0.5, z1 + 0.6, 'plaster')
    B.bx(o, cx - slot_w / 2 - 0.02, cx - slot_w / 2, a, b, z1, z1 + 0.5, 'ceramic')
    B.bx(o, cx + slot_w / 2, cx + slot_w / 2 + 0.02, a, b, z1, z1 + 0.5, 'ceramic')
    B.quad('fx', [(cx - slot_w / 2 + 0.05, a, z1 + 0.35), (cx + slot_w / 2 - 0.05, a, z1 + 0.35),
                  (cx + slot_w / 2 - 0.05, b, z1 + 0.35), (cx - slot_w / 2 + 0.05, b, z1 + 0.35)][::-1], 'emit_warm')


GALLERY_BAYS = [  # (x centre, side +1 north / -1 south, treatment)
  (14.2, 1, 'wall'), (21.6, 1, 'easel'), (29.0, 1, 'lectern'),
  (14.2, -1, 'wall'), (21.6, -1, 'lectern'), (29.0, -1, 'easel'),
]
PROJECT_ORDER = [0, 2, 3, 1, 4, 5]  # data/project.ts index per bay


def build_gallery(B):
  B.zone = 'gallery'
  o = 'gallery_lm'
  x0, x1, y0, y1 = 9.6, 34.0, -6.0, 6.0
  B.bx(o, x0, x1, y0, y1, -0.3, 0.0, 'basalt_floor')
  wing_ceiling(B, o, x0, x1, y0, y1, 'x', slot_w=1.6, slot_from=11.0, slot_to=32.6)
  bay_w, bay_d, bay_h = 5.2, 0.8, 4.6
  for side in (1, -1):
    yi = y1 if side > 0 else y0
    ops = [(cx - bay_w / 2, cx + bay_w / 2, 0.0, bay_h) for cx, s, _ in GALLERY_BAYS if s == side]
    yb0, yb1 = (yi, yi + 1.2) if side > 0 else (yi - 1.2, yi)
    solid_wall_x(B, o, x0, x1, yb0, yb1, 0, H_WING, ops, 'black')
    clad(B, o, 'x', yi, -side, x0, x1, PANEL_Z0, H_WING, 1.525, 3, ops, 'stone_wall')
    for cx, s, kind in GALLERY_BAYS:
      if s != side:
        continue
      back = yi + side * bay_d
      # niche: fabric back, ceramic sill, stone returns, concealed head light
      if side > 0:
        B.bx(o, cx - bay_w / 2, cx + bay_w / 2, back, back + 0.05, 0, bay_h, 'ceramic')
      else:
        B.bx(o, cx - bay_w / 2, cx + bay_w / 2, back - 0.05, back, 0, bay_h, 'ceramic')
      ya, yb = sorted((yi, back))
      B.bx(o, cx - bay_w / 2, cx + bay_w / 2, ya, yb, 0.0, 0.14, 'ceramic', 0.006)
      B.bx(o, cx - bay_w / 2, cx + bay_w / 2, ya, yb, bay_h - 0.25, bay_h, 'plaster')
      B.bx('fx', cx - bay_w / 2 + 0.1, cx + bay_w / 2 - 0.1, ya + 0.05, yb - 0.05, bay_h - 0.252, bay_h - 0.25, 'emit_warm')
      B.area(f'bay_{cx}_{side}', (cx, (ya + yb) / 2, bay_h - 0.3), (cx, back, 1.0), size=4.6, size_y=0.12, power=190, color=WARM)
      # portal frame trims
      B.bx('metal', cx - bay_w / 2 - 0.012, cx - bay_w / 2, ya - 0.002, yb, 0, bay_h, 'titanium')
      B.bx('metal', cx + bay_w / 2, cx + bay_w / 2 + 0.012, ya - 0.002, yb, 0, bay_h, 'titanium')
      B.bx('metal', cx - bay_w / 2, cx + bay_w / 2, ya - 0.002, yb, bay_h, bay_h + 0.012, 'titanium')
      idx = PROJECT_ORDER[GALLERY_BAYS.index((cx, s, kind))]
      face = (0, -side, 0)
      if kind == 'wall':
        cy = back - side * 0.06
        screen(B, f'screen_project_{idx}', (cx, cy, 2.2), 3.4, 1.5, face, bezel=0.025, depth=0.04)
        hit(B, f'hit_project_{idx}', (cx, (yi + back) / 2, 2.2), (4.0, 1.2, 2.4))
        B.spot(f'sp_{idx}', (cx, yi - side * 3.2, H_WING - 0.2), (cx, back, 2.2), power=700, angle=30, blend=0.7, radius=0.1)
      elif kind == 'easel':
        # freestanding totem: slim titanium portal frame on a ceramic foot, display in the upper field
        cy = yi - side * 1.1
        tw, th = 2.9, 2.75
        B.box(o, (cx, cy, 0.07), (tw + 0.3, 0.62, 0.14), 'ceramic', 0.008)
        B.box(o, (cx, cy, 0.035), (tw + 0.18, 0.5, 0.07), 'black')
        for dx in (-tw / 2, tw / 2):
          for gx in (-0.016, 0.016):   # each post: two bars either side of a shadow gap
            B.box('metal', (cx + dx + gx, cy, 0.14 + th / 2), (0.02, 0.09, th), 'titanium', 0.003)
          B.box('metal', (cx + dx, cy, 0.14 + th / 2), (0.014, 0.06, th - 0.02), 'titanium_dark')
          B.box('metal', (cx + dx, cy, 0.146), (0.13, 0.17, 0.012), 'titanium', 0.003)          # shoe plate
        B.box('metal', (cx, cy, 0.14 + th), (tw + 0.052, 0.09, 0.045), 'titanium', 0.004)
        for dx in (-tw / 2, tw / 2):
          B.box('metal', (cx + dx, cy, 0.14 + th + 0.03), (0.07, 0.1, 0.016), 'titanium_dark', 0.003)  # cap blocks
        B.box('metal', (cx, cy, 1.02), (tw, 0.07, 0.03), 'titanium_dark', 0.003)
        screen(B, f'screen_project_{idx}', (cx, cy - side * 0.012, 1.95), 2.55, 1.13, face, bezel=0.02, depth=0.03)
        hit(B, f'hit_project_{idx}', (cx, cy, 1.5), (3.2, 1.0, 3.0))
        B.spot(f'sp_{idx}', (cx, cy - side * 3.0, H_WING - 0.2), (cx, cy, 1.4), power=820, angle=28, blend=0.7, radius=0.1)
      else:  # lectern: brushed-titanium cheeks holding a sloped ceramic desk over a recessed toe kick
        cy = yi - side * 1.0
        lw, ld = 1.9, 0.78
        B.box(o, (cx, cy, 0.05), (lw - 0.1, ld - 0.12, 0.1), 'black')                      # toe kick
        B.box(o, (cx, cy, 0.5), (lw - 0.08, ld, 0.8), 'ceramic', 0.008)                    # body
        B.box(o, (cx, cy, 0.905), (lw - 0.14, ld - 0.08, 0.01), 'black')                    # shadow gap under the desk
        zf, zb = (0.98, 1.12) if side > 0 else (1.12, 0.98)   # low edge faces the visitor
        y_lo, y_hi = cy - ld / 2 - 0.01, cy + ld / 2 + 0.01
        for dx in (-1, 1):
          xa, xb = cx + dx * lw / 2 - 0.022, cx + dx * lw / 2 + 0.022
          B.prism('metal', [(xa, y_lo, 0.0), (xb, y_lo, 0.0), (xb, y_hi, 0.0), (xa, y_hi, 0.0),
                            (xa, y_lo, zf), (xb, y_lo, zf), (xb, y_hi, zb), (xa, y_hi, zb)], 'titanium', 0.004)
        B.box('metal', (cx, cy, 0.2), (lw - 0.07, ld + 0.004, 0.012), 'titanium', 0.002)
        # fluted visitor face: dark titanium reveals between the cheeks, and a brushed kick strip
        yf = cy - side * (ld / 2 + 0.003)
        for k in range(9):
          B.box('metal', (cx - 0.72 + k * 0.18, yf, 0.56), (0.014, 0.006, 0.6), 'titanium_dark')
        B.box('metal', (cx, yf, 0.125), (lw - 0.12, 0.006, 0.05), 'titanium', 0.002)
        screen(B, f'screen_project_{idx}', (cx, cy + side * 0.02, 1.16), 1.6, 0.72, face, bezel=0.02,
               lean=math.radians(56))
        B.box('metal', (cx, cy + side * 0.2, 1.06), (1.2, 0.08, 0.2), 'titanium_dark', 0.004)
        hit(B, f'hit_project_{idx}', (cx, cy, 1.0), (2.2, 1.2, 2.0))
        B.spot(f'sp_{idx}', (cx, cy - side * 3.0, H_WING - 0.2), (cx, cy, 0.9), power=780, angle=26, blend=0.7, radius=0.1)
  # end wall
  solid_wall_y(B, o, y0 - 1.2, y1 + 1.2, x1, x1 + 0.6, 0, H_WING, [], 'black')
  clad(B, o, 'y', x1, -1, y0, y1, PANEL_Z0, H_WING, 1.5, 3, [], 'stone_wall')
  B.area('gal_end', (x1 - 0.5, 0, H_WING - 0.15), (x1, 0, 2.0), size=0.1, size_y=11.0, power=320)
  # index wall: the hall's terminus, a large display listing every exhibit
  screen(B, 'screen_gallery_index', (x1 - 0.12, 0, 2.75), 6.6, 2.75, (-1, 0, 0), bezel=0.03, depth=0.05)
  hit(B, 'hit_gallery_index', (x1 - 0.6, 0, 2.75), (1.0, 7.0, 3.2))
  bench(B, o, 31.4, 0, 3.4, along='y')
  # long museum bench down the hall's axis: a resting point facing the exhibits
  bench(B, o, 21.6, 0.0, 6.0, along='x', depth=0.6)
  # atrium-side wall of the gallery (back of atrium east wall) cladding
  clad(B, o, 'y', 9.6, 1, y0, y1, PANEL_Z0, H_WING, 1.5, 3, [(-2.25, 2.25, 0, PORTAL_H)], 'stone_wall')
  for side in (1, -1):
    B.area(f'gal_up_{side}', (21.8, side * 5.6, H_WING - 1.2), (21.8, side * 6.0, H_WING + 0.4), size=22.0, size_y=0.1, power=260, color=WARM_SOFT)
  # luminous ceiling slot light
  B.area('gal_slot', (21.8, 0, H_WING + 0.7), (21.8, 0, 0), size=21.0, size_y=1.3, power=600, color=NEUTRAL)


def build_lab(B):
  B.zone = 'lab'
  o = 'lab_lm'
  x0, x1, y0, y1 = -26.0, -9.6, -7.0, 7.0
  B.bx(o, x0, x1, y0, y1, -0.3, 0.0, 'basalt_floor')
  wing_ceiling(B, o, x0, x1, y0, y1, None)
  solid_wall_x(B, o, x0 - 0.6, x1, y1, y1 + 0.6, 0, H_WING, [], 'black')
  solid_wall_x(B, o, x0 - 0.6, x1, y0 - 0.6, y0, 0, H_WING, [], 'black')
  solid_wall_y(B, o, y0, y1, x0 - 0.6, x0, 0, H_WING, [], 'black')
  # north & south walls: acoustic fabric panels in titanium frames above a stone dado
  for side in (1, -1):
    yi = y1 if side > 0 else y0
    clad(B, o, 'x', yi, -side, x0, x1, PANEL_Z0, 1.2, 1.64, 1, [], 'stone_wall')
    clad(B, o, 'x', yi, -side, x0, x1, 1.2, H_WING - 0.6, 1.64, 2, [], 'fabric', depth=0.05, gap=0.03, bevel=0.01)
    B.bx(o, x0, x1, yi - side * 0.02 if side > 0 else yi, yi if side > 0 else yi + 0.02, H_WING - 0.6, H_WING, 'plaster')
    # shadow-line trim between dado and fabric
    ya, yb = sorted((yi, yi - side * 0.075))
    B.bx('metal', x0, x1, ya, yb, 1.19, 1.215, 'titanium')
  clad(B, o, 'y', x0, 1, y0, y1, PANEL_Z0, H_WING, 1.4, 3, [], 'stone_wall')
  clad(B, o, 'y', -9.6, -1, y0, y1, PANEL_Z0, H_WING, 1.5, 3, [(-2.25, 2.25, 0, PORTAL_H)], 'stone_wall')

  # capability consoles along the north wall: ceramic foot, single tapered titanium blade, cantilevered display
  for i, cx in enumerate((-21.5, -17.8, -14.1)):
    cy = y1 - 1.6
    B.box(o, (cx, cy + 0.05, 0.045), (1.36, 0.68, 0.09), 'basalt', 0.018)
    B.box(o, (cx, cy + 0.05, 0.02), (1.24, 0.56, 0.04), 'black')
    B.box(o, (cx, cy + 0.05, 0.12), (0.9, 0.42, 0.06), 'ceramic', 0.008)
    for bdx in (-0.36, 0.36):
      for bdy in (-0.14, 0.14):
        B.lathe('metal', [(0.0, 0.15), (0.02, 0.15), (0.02, 0.157), (0.014, 0.163), (0.0, 0.163)], 'titanium', segs=12, center=(cx + bdx, cy + 0.05 + bdy, 0))
    for pdx in (-0.17, 0.17):
      B.prism('metal', [(cx + pdx - 0.045, cy + 0.0, 0.15), (cx + pdx + 0.045, cy + 0.0, 0.15), (cx + pdx + 0.045, cy + 0.14, 0.15), (cx + pdx - 0.045, cy + 0.14, 0.15),
                        (cx + pdx - 0.026, cy + 0.03, 1.14), (cx + pdx + 0.026, cy + 0.03, 1.14), (cx + pdx + 0.026, cy + 0.11, 1.14), (cx + pdx - 0.026, cy + 0.11, 1.14)], 'titanium', 0.005)
    B.box('metal', (cx, cy + 0.07, 0.46), (0.32, 0.05, 0.04), 'titanium_dark', 0.004)       # stretcher
    B.lathe('metal', [(0.009, 0.15), (0.009, 1.13)], 'titanium_dark', segs=8, center=(cx, cy + 0.12, 0), cap=False)   # cable spine
    B.box('metal', (cx, cy + 0.06, 1.16), (0.5, 0.1, 0.06), 'titanium_dark', 0.006)
    B.box('metal', (cx, cy + 0.1, 1.3), (0.36, 0.12, 0.16), 'titanium_dark', 0.01)        # hinge block behind the display
    screen(B, f'screen_cap_{i}', (cx, cy - 0.02, 1.5), 1.6, 0.9, (0, -1, 0), lean=math.radians(12))
    hit(B, f'hit_cap_{i}', (cx, cy, 1.1), (1.9, 1.1, 2.2))
    B.spot(f'cap_sp_{i}', (cx, cy - 3.2, H_WING - 0.2), (cx, cy, 0.8), power=320, angle=30, blend=0.8, radius=0.1)
  # tool wall (west end): large framed display for the tech stack
  screen(B, 'screen_stack', (x0 + 0.13, 0, 2.7), 6.4, 2.8, (1, 0, 0), bezel=0.03, depth=0.05)
  hit(B, 'hit_stack', (x0 + 0.6, 0, 2.7), (1.0, 7.0, 3.2))
  B.area('lab_end', (x0 + 1.6, 0, H_WING - 0.2), (x0, 0, 2.5), size=0.1, size_y=11, power=300)
  # lecture screen on the south wall (talks)
  screen(B, 'screen_talk', (-17.8, y0 + 0.12, 2.6), 3.6, 2.02, (0, 1, 0), bezel=0.025, depth=0.04)
  hit(B, 'hit_talk', (-17.8, y0 + 0.6, 2.6), (4.2, 1.0, 2.6))
  # central worktable: ceramic top on titanium blade legs
  tx0, tx1 = -22.4, -13.2
  B.box(o, ((tx0 + tx1) / 2, 0, 0.9), (tx1 - tx0, 1.5, 0.05), 'ceramic', 0.008)
  for lx in (tx0 + 0.5, (tx0 + tx1) / 2, tx1 - 0.5):
    B.box('metal', (lx, 0, 0.44), (0.05, 1.2, 0.86), 'titanium', 0.004)
  B.box('metal', ((tx0 + tx1) / 2, 0, 0.82), (tx1 - tx0 - 0.8, 0.06, 0.04), 'titanium_dark', 0.004)
  # bar stools are scanned CC0 models placed at runtime (three/props.ts); proxies give them baked contact shadows
  for sx in (-20.6, -17.8, -15.0):
    for sy in (-1.25, 1.25):
      B.lathe('proxy', [(0, 0.0), (0.17, 0.0), (0.17, 0.02), (0.03, 0.05), (0.03, 0.74), (0.18, 0.74), (0.18, 0.80), (0, 0.80)], 'titanium', segs=16, center=(sx, sy, 0))
  # linear pendants over the table
  for py in (-0.35, 0.35):
    B.box('metal', ((tx0 + tx1) / 2, py, 3.0), (tx1 - tx0 - 0.6, 0.08, 0.06), 'titanium_dark', 0.004)
    B.bx('fx', tx0 + 0.32, tx1 - 0.32, py - 0.03, py + 0.03, 2.968, 2.969, 'emit_warm')
    for lx in (tx0 + 0.8, tx1 - 0.8):
      B.lathe('metal', [(0.004, 3.03), (0.004, H_WING)], 'titanium', segs=6, center=(lx, py, 0))
    B.area(f'pend_{py}', ((tx0 + tx1) / 2, py, 2.95), ((tx0 + tx1) / 2, py, 0), size=tx1 - tx0 - 0.8, size_y=0.06, power=430)
  for side in (1, -1):
    B.area(f'lab_up_{side}', ((x0 + x1) / 2, side * 6.6, H_WING - 1.2), ((x0 + x1) / 2, side * 7.0, H_WING + 0.4), size=15.0, size_y=0.1, power=200, color=WARM_SOFT)
  for k in range(int((x1 - x0 - 1.2) / 0.36)):
    sx_ = x0 + 0.6 + k * 0.36
    B.bx('metal', sx_ - 0.02, sx_ + 0.02, y0 + 0.4, y1 - 0.4, H_WING - 0.42, H_WING - 0.04, 'titanium_dark')
  for ry in (y0 + 0.6, 0.0, y1 - 0.6):
    B.bx('metal', x0 + 0.4, x1 - 0.4, ry - 0.015, ry + 0.015, H_WING - 0.04, H_WING, 'titanium')
  B.area('lab_wash', ((x0 + x1) / 2, 0, H_WING - 0.05), ((x0 + x1) / 2, 0, 0), size=13, size_y=8, power=160, color=NEUTRAL)
  # grazing wall-wash down the fabric walls from the baffle edge, so the long walls read as lit surfaces
  for side in (1, -1):
    B.area(f'lab_graze_{side}', ((x0 + x1) / 2, side * 6.25, H_WING - 0.5), ((x0 + x1) / 2, side * 7.0, 0.8), size=15.4, size_y=0.12, power=420, color=WARM_SOFT)


def build_corridor(B):
  B.zone = 'corridor'
  o = 'corridor_lm'
  x0, x1, y0, y1 = -3.5, 3.5, 9.6, 34.0
  B.bx(o, x0, x1, y0, y1, -0.3, 0.0, 'basalt_floor')
  wing_ceiling(B, o, x0, x1, y0, y1, 'y', slot_w=0.5, slot_from=10.4, slot_to=33.2)
  pw = (y1 - y0) / 19
  niches = [(y0 + (c + 0.5) * pw, i) for i, c in enumerate((2, 6, 10, 14))]   # oldest role nearest the atrium
  nh = 1.5 * pw
  ops_w = [(cy - nh, cy + nh, 0.9, 3.5) for cy, _ in niches]
  rows_w = [PANEL_Z0, 0.9, 3.5, 5.55, H_WING]
  solid_wall_y(B, o, y0, y1, x0 - 1.0, x0, 0, H_WING, ops_w, 'black')
  solid_wall_y(B, o, y0, y1, x1, x1 + 0.6, 0, H_WING, [], 'black')
  clad(B, o, 'y', x0, 1, y0, y1, PANEL_Z0, H_WING, pw, rows_w, ops_w, 'stone_wall')
  clad(B, o, 'y', x1, -1, y0, y1, PANEL_Z0, H_WING, pw, 3, [], 'stone_wall')
  # back of atrium north wall
  clad(B, o, 'x', 9.6, 1, x0, x1, PANEL_Z0, H_WING, 1.4, 3, [(-2.25, 2.25, 0, PORTAL_H)], 'stone_wall')
  nd = 0.6
  for cy, i in niches:
    # warm niche cut through the cladding; shallow enough that its returns never hide the display
    B.bx(o, x0 - nd, x0 - nd + 0.05, cy - nh, cy + nh, 0.9, 3.5, 'ceramic')
    B.bx(o, x0 - nd, x0 + 0.06, cy - nh, cy + nh, 0.86, 0.9, 'ceramic', 0.004)
    B.bx(o, x0 - nd, x0, cy - nh - 0.02, cy - nh, 0.86, 3.5, 'ceramic')
    B.bx(o, x0 - nd, x0, cy + nh, cy + nh + 0.02, 0.86, 3.5, 'ceramic')
    B.bx('metal', x0 - nd, x0, cy - nh - 0.02, cy + nh + 0.02, 3.5, 3.54, 'titanium_dark')   # dark reveal housing the downlight
    screen(B, f'screen_role_{i}', (x0 - nd + 0.1, cy, 2.2), 2.6, 1.3, (1, 0, 0), bezel=0.015, depth=0.03)
    hit(B, f'hit_role_{i}', (x0 - 0.15, cy, 2.2), (1.0, 2 * nh, 2.6))
    B.area(f'niche_{i}', (x0 - nd / 2, cy, 3.45), (x0 - nd + 0.1, cy, 0.9), size=0.4, size_y=2 * nh - 0.3, power=160 + 40 * i, color=WARM)
  for k in range(1, 19):
    fy = y0 + k * pw
    if any(abs(fy - (13.0 + c * 5.0)) < 0.95 for c in range(4)):
      continue   # keep fins clear of the certification frames
    B.bx('metal', x1 - 0.06 - 0.16, x1 - 0.06, fy - 0.018, fy + 0.018, PANEL_Z0, H_WING - 0.02, 'titanium')
  # certification wall: 8 framed panels, 2 rows x 4
  for k in range(8):
    col, row = k % 4, k // 4
    cy = 13.0 + col * 5.0
    cz = 2.95 - row * 1.15
    screen(B, f'screen_cert_{k}', (x1 - 0.1, cy, cz), 1.3, 0.72, (-1, 0, 0), bezel=0.025, depth=0.03, frame_mat='titanium_dark')
    hit(B, f'hit_cert_{k}', (x1 - 0.4, cy, cz), (0.8, 1.8, 1.0))
  for col in range(4):
    cy = 13.0 + col * 5.0
    B.spot(f'cert_sp_{col}', (x1 - 2.6, cy, H_WING - 0.2), (x1, cy, 2.4), power=230, angle=28, blend=0.8, radius=0.08)
  for side in (1, -1):
    B.area(f'cor_up_{side}', (side * 3.1, 21.8, H_WING - 1.0), (side * 3.5, 21.8, H_WING + 0.4), size=0.1, size_y=22.0, power=150, color=WARM_SOFT)
  B.area('cor_slot', (0, 21.8, H_WING + 0.7), (0, 21.8, 0), size=0.4, size_y=22.5, power=900, color=WARM)
  # concealed cornice uplights washing the soffit, so the ceiling keeps readable shadow detail
  for side in (1, -1):
    B.bx('metal', side * 3.5 - (0.3 if side > 0 else 0.0), side * 3.5 + (0.0 if side > 0 else 0.3), y0 + 0.4, y1 - 0.4, H_WING - 0.62, H_WING - 0.58, 'titanium_dark', 0.003)
    B.area(f'cor_ceil_{side}', (side * 3.25, 21.8, H_WING - 0.56), (side * 0.8, 21.8, H_WING + 0.3), size=0.12, size_y=23.0, power=520, color=WARM_SOFT)
  hit(B, 'hit_dest_terrace', (0, 34.0, 3.0), (7.0, 0.8, 6.0))
  B.spot('cor_door', (0, 32.6, H_WING - 0.1), (0, 33.2, 0), power=380, angle=60, blend=0.9, radius=0.1)
  # threshold to the terrace: slim titanium portal
  portal(B, 'x', 33.94, 34.06, -3.5, 3.5, H_WING - 0.01, frame=0.04)


def build_terrace(B):
  B.zone = 'terrace'
  o = 'terrace_lm'
  x0, x1, y0, y1 = -12.0, 12.0, 34.0, 47.0
  B.bx(o, x0, x1, y0, y1, -0.3, 0.0, 'basalt_floor')
  # façade (outer face of corridor end)
  solid_wall_x(B, o, x0, x1, y0 - 0.6, y0, 0, 8.2, [(-3.5, 3.5, 0, H_WING)], 'black')
  clad(B, o, 'x', y0, 1, x0, x1, PANEL_Z0, 8.2, 1.6, 3, [(-3.5, 3.5, 0, H_WING)], 'stone_wall')
  # cantilevered canopy with downlights
  B.box(o, (0, y0 + 2.6, 4.75), (x1 - x0, 5.2, 0.3), 'plaster', 0.01)
  B.box('metal', (0, y0 + 5.2, 4.75), (x1 - x0 + 0.02, 0.02, 0.32), 'titanium')
  for jx in range(-11, 12, 2):   # soffit panel joints (odd metres: never under a face centre, which the culler probes)
    B.bx(o, jx - 0.008, jx + 0.008, y0 + 0.1, y0 + 5.15, 4.597, 4.6, 'black')
  for dx in (-9, -6, -3, 3, 6, 9):
    B.lathe('fx', [(0.0, 4.598), (0.06, 4.598)], 'emit_warm', segs=24, center=(dx, y0 + 2.6, 0), cap=False)
    B.spot(f'can_{dx}', (dx, y0 + 2.6, 4.55), (dx, y0 + 2.9, 0), power=420, angle=50, blend=0.85, radius=0.05)
  # concealed cove along the façade washing the canopy soffit
  B.area('canopy_cove', (0, y0 + 0.3, 4.3), (0, y0 + 1.6, 6.5), size=x1 - x0 - 1.0, size_y=0.08, power=900, color=WARM_SOFT)
  # side parapets: stone upstand + frameless glass + titanium cap
  for (a0, a1) in ((x0, x0 + 0.35), (x1 - 0.35, x1)):
    B.bx(o, a0, a1, y0, y1, 0.0, 0.42, 'basalt', 0.01)
  B.bx('fx', x0 + 0.16, x0 + 0.18, y0, y1 - 0.1, 0.42, 1.08, 'glass')
  B.bx('fx', x1 - 0.18, x1 - 0.16, y0, y1 - 0.1, 0.42, 1.08, 'glass')
  B.bx('metal', x0 + 0.13, x0 + 0.21, y0, y1, 1.08, 1.11, 'titanium', 0.004)
  B.bx('metal', x1 - 0.21, x1 - 0.13, y0, y1, 1.08, 1.11, 'titanium', 0.004)
  for (gx0, gx1) in ((x0 + 0.12, x0 + 0.22), (x1 - 0.22, x1 - 0.12)):
    B.bx('metal', gx0, gx1, y0, y1, 0.40, 0.46, 'titanium_dark', 0.003)          # glass shoe channel
    for py in [y0 + 1.0 + 2.0 * k for k in range(7)]:
      B.bx('metal', gx0 + 0.03, gx1 - 0.03, py - 0.02, py + 0.02, 0.46, 1.08, 'titanium', 0.002)
  # infinity-edge reflecting pool along the view edge; water meets the sea beyond
  py0, py1, wz = 43.2, y1, 0.34
  B.bx(o, x0 + 0.35, x1 - 0.35, py0, py0 + 0.4, 0.0, wz + 0.04, 'basalt', 0.01)       # coping
  B.bx(o, x0 + 0.35, x1 - 0.35, py0 + 0.4, y1, 0.0, 0.02, 'black')                  # basin floor
  B.bx(o, x0 + 0.35, x1 - 0.35, y1 - 0.06, y1, 0.0, wz - 0.004, 'basalt')           # weir wall
  B.bx('metal', x0 + 0.35, x1 - 0.35, y1 - 0.065, y1, wz - 0.006, wz - 0.002, 'titanium_dark')
  B.quad('fx', [(x0 + 0.35, py0 + 0.4, wz), (x1 - 0.35, py0 + 0.4, wz), (x1 - 0.35, y1 + 0.02, wz), (x0 + 0.35, y1 + 0.02, wz)], 'water')
  B.bx('fx', x0 + 0.5, x1 - 0.5, py0 + 0.4, py0 + 0.41, wz - 0.06, wz - 0.03, 'emit_warm')
  B.area('pool_edge', (0, py0 + 0.45, wz - 0.02), (0, py0 + 3.0, 0.0), size=x1 - x0 - 1.2, size_y=0.04, power=120, color=WARM)
  # contact plinth: tapered cast-stone lectern, sloped titanium top, slim cyan seam (the one interactive accent)
  cx, cy = 0.0, 40.6
  w0, d0, w1, d1, hf, hb = 0.62, 0.34, 0.54, 0.28, 1.0, 1.12
  def wd(z):   # taper of the body at height z
    t = (z - 0.08) / (hf - 0.08)
    return w0 + (w1 - w0) * t, d0 + (d1 - d0) * t
  zg0, zg1 = 0.74, 0.77
  wa, da = wd(zg0)
  wb, db = wd(zg1)
  B.prism(o, [(cx - w0, cy - d0, 0.08), (cx + w0, cy - d0, 0.08), (cx + w0, cy + d0, 0.08), (cx - w0, cy + d0, 0.08),
              (cx - wa, cy - da, zg0), (cx + wa, cy - da, zg0), (cx + wa, cy + da, zg0), (cx - wa, cy + da, zg0)], 'ceramic', 0.008)
  B.box(o, (cx, cy, (zg0 + zg1) / 2), (2 * wa - 0.05, 2 * da - 0.05, zg1 - zg0 + 0.01), 'black')
  B.prism(o, [(cx - wb, cy - db, zg1), (cx + wb, cy - db, zg1), (cx + wb, cy + db, zg1), (cx - wb, cy + db, zg1),
              (cx - w1, cy - d1, hf), (cx + w1, cy - d1, hf), (cx + w1, cy + d1, hb), (cx - w1, cy + d1, hb)], 'ceramic', 0.008)
  for sxc in (-1, 1):   # brushed cheeks following the taper, bridging both courses
    pts = []
    for z, wz, dz, zf_, zb_ in ((0.08, w0, d0, 0.08, 0.08), (hf, w1, d1, hf, hb)):
      xi, xo = sorted((cx + sxc * (wz - 0.004), cx + sxc * (wz + 0.014)))
      pts.append([(xi, cy - dz + 0.05, zf_), (xo, cy - dz + 0.05, zf_), (xo, cy + dz - 0.05, zb_), (xi, cy + dz - 0.05, zb_)])
    B.prism('metal', pts[0] + pts[1], 'titanium', 0.003)
  B.prism(o, [(cx - w0 + 0.06, cy - d0 + 0.06, 0.0), (cx + w0 - 0.06, cy - d0 + 0.06, 0.0), (cx + w0 - 0.06, cy + d0 - 0.06, 0.0), (cx - w0 + 0.06, cy + d0 - 0.06, 0.0),
              (cx - w0 + 0.06, cy - d0 + 0.06, 0.08), (cx + w0 - 0.06, cy - d0 + 0.06, 0.08), (cx + w0 - 0.06, cy + d0 - 0.06, 0.08), (cx - w0 + 0.06, cy + d0 - 0.06, 0.08)], 'black')
  ins = 0.05
  B.prism('metal', [(cx - w1 + ins, cy - d1 + ins, hf + (hb - hf) * (ins / (2 * d1)) - 0.004), (cx + w1 - ins, cy - d1 + ins, hf + (hb - hf) * (ins / (2 * d1)) - 0.004),
                    (cx + w1 - ins, cy + d1 - ins, hb - (hb - hf) * (ins / (2 * d1)) - 0.004), (cx - w1 + ins, cy + d1 - ins, hb - (hb - hf) * (ins / (2 * d1)) - 0.004),
                    (cx - w1 + ins, cy - d1 + ins, hf + (hb - hf) * (ins / (2 * d1)) + 0.006), (cx + w1 - ins, cy - d1 + ins, hf + (hb - hf) * (ins / (2 * d1)) + 0.006),
                    (cx + w1 - ins, cy + d1 - ins, hb - (hb - hf) * (ins / (2 * d1)) + 0.006), (cx - w1 + ins, cy + d1 - ins, hb - (hb - hf) * (ins / (2 * d1)) + 0.006)], 'titanium', 0.002)
  B.bx('fx', cx - w1 + 0.04, cx + w1 - 0.04, cy - d1 - 0.004, cy - d1 - 0.001, hf - 0.06, hf - 0.045, 'emit_cyan')
  B.box(o, (cx, cy, 0.04), (2 * w0 + 0.24, 2 * d0 + 0.24, 0.08), 'basalt', 0.008)

  # display set into the sloped top (content drawn at runtime)
  slope = math.atan2(hb - hf, 2 * d1)
  screen(B, 'screen_contact', (cx, cy, (hf + hb) / 2 + 0.012), 2 * w1 - 0.2, 2 * d1 / math.cos(slope) - 0.16, (0, -1, 0),
         bezel=0.012, depth=0.008, lean=math.pi / 2 - slope)
  B.spot('contact_sp', (cx - 1.5, cy - 2.6, 4.5), (cx, cy, 0.9), power=260, angle=26, blend=0.8, radius=0.06)
  hit(B, 'hit_contact', (cx, cy, 0.9), (1.8, 1.2, 1.9))
  # lounge facing the horizon: scanned CC0 lounge chairs and table placed at runtime; proxies cast their baked shadows
  for (lx, ly) in ((-7.1, 40.5), (-4.5, 40.5)):
    B.box('proxy', (lx, ly, 0.28), (0.9, 0.95, 0.5), 'titanium', 0.05)
  B.box('proxy', (-5.8, 41.7, 0.36), (1.2, 0.6, 0.05), 'titanium', 0.01)
  B.area('lounge_lamp', (-5.8, 39.6, 4.55), (-5.8, 41.0, 0.0), size=1.6, size_y=1.6, power=120, color=WARM)
  # horizon portal: freestanding basalt frame on the building's axis, lined in titanium, washed from below
  pw_, ph_, pd_, t_ = 4.4, 5.2, 0.55, 0.55
  py_ = 42.75
  j = 0.012                      # stone joint
  zb, zt = 0.12, ph_ - t_        # legs stand on plinth blocks and carry the lintel
  for sx in (-1, 1):
    lcx = sx * (pw_ / 2 + t_ / 2)
    B.box(o, (lcx, py_, (zb + zt) / 2), (t_ - 0.05, pd_ - 0.05, zt - zb), 'black')            # core seen through joints
    sw = (t_ - 2 * j) / 3
    for k in range(3):           # three staves per leg, middle one in running bond
      x0s = lcx - t_ / 2 + k * (sw + j)
      n = 7
      ch = (zt - zb) / n
      zs = [zb] + [zb + ch * (c + (0.5 if k == 1 else 0.0)) for c in range(1, n)] + [zt]
      for za, zc in zip(zs[:-1], zs[1:]):
        B.bx(o, x0s, x0s + sw, py_ - pd_ / 2, py_ + pd_ / 2, za + j / 2, zc - j / 2, 'stone_wall', 0.006)
    B.box(o, (lcx, py_, 0.09), (t_ + 0.12, pd_ + 0.12, 0.06), 'basalt', 0.012)                 # plinth block
    B.box('metal', (sx * (pw_ / 2 + 0.006), py_, (zb + zt) / 2), (0.012, pd_ - 0.04, zt - zb), 'titanium')
    B.area(f'portal_up_{sx}', (sx * (pw_ / 2 + t_ / 2), py_ - pd_ / 2 - 0.5, 0.06), (sx * (pw_ / 2 + t_ / 2), py_ - pd_ / 2, ph_ * 0.8), size=0.5, size_y=0.16, power=95, color=WARM)
  # lintel: five voussoir blocks on a dark core, a shadow reveal and a proud basalt cap
  B.box(o, (0, py_, ph_ - t_ / 2), (pw_ + 2 * t_ - 0.05, pd_ - 0.05, t_ - 0.03), 'black')
  span = pw_ + 2 * t_
  bw = (span - 4 * j) / 5
  for k in range(5):
    xa = -span / 2 + k * (bw + j)
    B.bx(o, xa, xa + bw, py_ - pd_ / 2, py_ + pd_ / 2, ph_ - t_ + j / 2, ph_, 'stone_wall', 0.006)
  B.box(o, (0, py_, ph_ + 0.008), (span - 0.06, pd_ - 0.06, 0.016), 'black')
  B.box(o, (0, py_, ph_ + 0.056), (span + 0.1, pd_ + 0.1, 0.08), 'basalt', 0.012)
  B.box('metal', (0, py_, ph_ - t_ - 0.006), (pw_, pd_ - 0.04, 0.012), 'titanium')
  B.box(o, (0, py_, 0.03), (pw_ + 2 * t_ + 0.2, pd_ + 0.2, 0.06), 'basalt', 0.006)
  # low titanium bollards along the side parapets: the terrace's practical lights at dusk
  for bx_ in (x0 + 0.75, x1 - 0.75):
    for by in (36.5, 39.5, 42.5):
      B.lathe('metal', [(0.0, 0.0), (0.07, 0.0), (0.07, 0.62), (0.0, 0.62)], 'titanium_dark', segs=24, center=(bx_, by, 0))
      B.lathe('fx', [(0.071, 0.46), (0.071, 0.56)], 'emit_warm', segs=24, center=(bx_, by, 0), cap=False)
      B.point(f'bol_{bx_}_{by}', (bx_, by, 0.5), 18, radius=0.04, color=WARM)
  B.area('ter_glow', (0, y0 + 0.4, 8.0), (0, y1, 0), size=8, size_y=0.3, power=240, color=WARM_SOFT)


# ---------------------------------------------------------------------------
# Hero sculpture proxy (for baked contact shadow only; animated at runtime)
# ---------------------------------------------------------------------------
def sculpture_layout(spacing=0.24, radius=2.6):
  pts = []
  n = int(radius / spacing) + 1
  for i in range(-n, n + 1):
    for j in range(-n, n + 1):
      x = i * spacing + (spacing / 2 if j % 2 else 0)
      y = j * spacing * 0.866
      if x * x + y * y <= radius * radius:
        pts.append((x, y))
  return pts


def build_sculpture_proxy(B):
  for x, y in sculpture_layout():
    r = math.hypot(x, y)
    z = 6.0 + 0.45 * math.cos(r * 1.4)
    B.lathe('proxy', [(0, -0.07), (0.028, -0.02), (0.028, 0.02), (0, 0.07)], 'titanium', segs=8, center=(x, y, z))


def build_all():
  B = Builder()
  build_atrium(B)
  build_gallery(B)
  build_lab(B)
  build_corridor(B)
  build_terrace(B)
  build_sculpture_proxy(B)
  return B


# ---------------------------------------------------------------------------
# Scene creation
# ---------------------------------------------------------------------------
def make_materials():
  mats = {}
  for name in MATS:
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    if name in ('emit_warm', 'emit_cyan', 'sky', 'oled'):
      em = nt.nodes.new('ShaderNodeEmission')
      em.inputs['Color'].default_value = {
        'emit_warm': (1.0, 0.82, 0.64, 1), 'emit_cyan': (0.6, 0.85, 0.84, 1),
        'sky': (0.05, 0.075, 0.13, 1), 'oled': (0.06, 0.07, 0.08, 1)}[name]
      em.inputs['Strength'].default_value = {'emit_warm': 6.0, 'emit_cyan': 2.0, 'sky': 1.0, 'oled': 1.0}[name]
      nt.links.new(em.outputs[0], out.inputs[0])
    else:
      bs = nt.nodes.new('ShaderNodeBsdfPrincipled')
      if name == 'glass':
        bs.inputs['Base Color'].default_value = (0.8, 0.85, 0.85, 1)
        bs.inputs['Transmission Weight'].default_value = 1.0
        bs.inputs['Roughness'].default_value = 0.02
      else:
        c = BAKE_COLOR[name]
        bs.inputs['Base Color'].default_value = (*c, 1)
        bs.inputs['Roughness'].default_value = 0.35 if name in METAL else (0.05 if name == 'water' else 0.7)
        bs.inputs['Metallic'].default_value = 1.0 if name in METAL else 0.0
      nt.links.new(bs.outputs[0], out.inputs[0])
    mats[name] = m
  return mats


def make_world():
  w = bpy.data.worlds.get('twilight') or bpy.data.worlds.new('twilight')
  bpy.context.scene.world = w
  w.use_nodes = True
  nt = w.node_tree
  nt.nodes.clear()
  out = nt.nodes.new('ShaderNodeOutputWorld')
  bg = nt.nodes.new('ShaderNodeBackground')
  tc = nt.nodes.new('ShaderNodeTexCoord')
  sep = nt.nodes.new('ShaderNodeSeparateXYZ')
  ramp = nt.nodes.new('ShaderNodeValToRGB')
  mr = nt.nodes.new('ShaderNodeMapRange')
  mr.inputs['From Min'].default_value = -0.1
  mr.inputs['From Max'].default_value = 1.0
  nt.links.new(tc.outputs['Generated'], sep.inputs[0])
  nt.links.new(sep.outputs['Z'], mr.inputs['Value'])
  nt.links.new(mr.outputs['Result'], ramp.inputs['Fac'])
  cr = ramp.color_ramp
  cr.elements[0].position = 0.0
  cr.elements[0].color = (0.012, 0.012, 0.016, 1)
  cr.elements[1].position = 1.0
  cr.elements[1].color = (0.018, 0.035, 0.075, 1)
  for pos, col in ((0.08, (0.05, 0.035, 0.03)), (0.095, (0.42, 0.24, 0.13)), (0.16, (0.16, 0.11, 0.12)), (0.4, (0.045, 0.06, 0.11))):
    e = cr.elements.new(pos)
    e.color = (*col, 1)
  nt.links.new(ramp.outputs['Color'], bg.inputs['Color'])
  bg.inputs['Strength'].default_value = 1.0
  nt.links.new(bg.outputs[0], out.inputs[0])


def to_object(name, bm, mats, collection):
  me = bpy.data.meshes.new(name)
  bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0001) if name.endswith('_lm') and False else None
  bm.to_mesh(me)
  bm.free()
  for m in MATS:
    me.materials.append(mats[m])
  if me.color_attributes:
    me.color_attributes.active_color_index = 0
    me.color_attributes.render_color_index = 0
  ob = bpy.data.objects.new(name, me)
  collection.objects.link(ob)
  return ob


def make_lights(B, collection):
  for L in B.lights:
    ld = bpy.data.lights.new(L['name'], L['kind'])
    ld.color = L['color']
    ld.energy = L['power']
    if L['kind'] == 'AREA':
      ld.shape = 'RECTANGLE'
      ld.size = L['size']
      ld.size_y = L['size_y'] or L['size']
      ld.spread = math.radians(L.get('spread', 180))
    elif L['kind'] == 'SPOT':
      ld.spot_size = math.radians(L['angle'])
      ld.spot_blend = L['blend']
      ld.shadow_soft_size = L['radius']
    else:
      ld.shadow_soft_size = L['radius']
    ob = bpy.data.objects.new(L['name'], ld)
    ob.location = L['loc']
    if 'target' in L:
      d = Vector(L['target']) - Vector(L['loc'])
      ob.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    collection.objects.link(ob)


def build_scene():
  bpy.ops.wm.read_factory_settings(use_empty=True)
  scene = bpy.context.scene
  mats = make_materials()
  make_world()
  B = build_all()
  col = scene.collection
  objs = {}
  for name, bm in list(B.bms.items()):
    objs[name] = to_object(name, bm, mats, col)
  lcol = bpy.data.collections.new('lights')
  col.children.link(lcol)
  make_lights(B, lcol)
  return objs
