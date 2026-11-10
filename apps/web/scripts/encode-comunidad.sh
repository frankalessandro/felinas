#!/usr/bin/env bash
#
# Videos del mosaico de comunidad (academia). Se abren en el lightbox, no se autocargan.
#   Entrada : $ORIGINALES/IMG_6600.mov, IMG_9947.mov   (fuera del repo)
#   Salida  : public/videos/comunidad-*.mp4 (640x1138, 30 fps, H.264 CRF 32-34, ~4-6 MB)
#             src/assets/academia/video-*.webp (posters)
# Uso: ORIGINALES=/ruta/a/originales bash scripts/encode-comunidad.sh
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="${ORIGINALES:-$ROOT/../../../felinas-originales}"

enc() { # <origen> <salida> <crf> <denoise>
  ffmpeg -v error -y -i "$SRC/$1.mov" -r 30 -vf "$4,scale=640:1138:flags=lanczos" \
    -c:v libx264 -crf "$3" -preset slow -profile:v high -level 4.0 -pix_fmt yuv420p \
    -c:a aac -b:a 64k -ac 2 -movflags +faststart "$ROOT/public/videos/$2.mp4"
}
poster() { # <video> <segundo> <salida>
  ffmpeg -v error -y -ss "$2" -i "$ROOT/public/videos/$1.mp4" -frames:v 1 \
    -vf "scale=640:-2:flags=lanczos" -c:v libwebp -quality 70 "$ROOT/src/assets/academia/$3.webp"
}

enc IMG_9947 comunidad-cypher 34 hqdn3d=5:4:7:5
enc IMG_6600 comunidad-memorias 32 hqdn3d=4:3:6:4
poster comunidad-cypher 2 video-cypher
poster comunidad-memorias 5 video-memorias
