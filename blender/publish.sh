#!/usr/bin/env bash
# Convert build outputs into web assets under public/atelier.
#   blender/publish.sh [textures]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUILD="$ROOT/blender/build"
OUT="$ROOT/public/atelier"
mkdir -p "$OUT/textures"

for f in "$BUILD"/lm_*.png; do
  z=$(basename "$f" .png)
  cwebp -quiet -q 98 -m 6 -sharp_yuv "$f" -o "$OUT/$z.webp"
  w=$(sips -g pixelWidth "$f" | awk '/pixelWidth/ {print $2}')
  mw=$((w / 2)); [[ "$z" == "lm_terrace" ]] && mw=$w   # terrace: small coursed stone needs full texel density on phones
  cwebp -quiet -q 90 -m 6 -sharp_yuv -resize $mw 0 "$f" -o "$OUT/${z}_m.webp"
done

if [[ "${1:-}" == "textures" ]]; then
  TMP="$BUILD/tex"
  mkdir -p "$TMP"
  /Applications/Blender.app/Contents/MacOS/Blender -b --python "$ROOT/blender/textures.py" -- "$TMP" > /dev/null
  # stone floor/walls, plaster, ceramic and fabric come from Poly Haven scans (blender/polyhaven.py);
  # only the procedural sets are regenerated here
  for f in "$TMP"/basalt_[anr]*.png "$TMP"/brushed_*.png; do
    n=$(basename "$f" .png)
    q=88; [[ "$n" == *_normal ]] && q=92
    cwebp -quiet -q $q -m 6 "$f" -o "$OUT/textures/$n.webp"
    cwebp -quiet -q 72 -resize 512 0 -m 6 "$f" -o "$OUT/textures/${n}_m.webp"
  done
fi

# geometry: meshopt compression (lossless positions; uv1 kept at full precision)
npx --yes @gltf-transform/cli@4 meshopt "$OUT/world.glb" "$OUT/world.glb" --level medium --quantize-texcoord 16 > /dev/null 2>&1 \
  || echo "meshopt step skipped"
ls -la "$OUT" "$OUT/textures" | awk '{print $5, $9}'
