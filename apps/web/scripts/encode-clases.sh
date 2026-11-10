#!/usr/bin/env bash
#
# Videos de las clases (academia). Reemplazan los trailers de YouTube: 2 por clase, autoalojados.
#   Entrada : $ORIGINALES/clases/*  (fuera del repo, ~230 MB)
#   Salida  : public/videos/clase-<clase>-<n>.mp4          (se abren bajo demanda en el lightbox)
# Uso: ORIGINALES=/ruta/a/originales bash scripts/encode-clases.sh
#
# 640 px de ancho: la tarjeta mide como maximo ~350 px css (700 px a 2x). Denoise suave y CRF 31:
# son tomas con poca luz y mucho grano de sensor, que consume bitrate sin aportar nada visible.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="${ORIGINALES:-$ROOT/../../../felinas-originales}/clases"
VID="$ROOT/public/videos"
mkdir -p "$VID"

DN="hqdn3d=3:2:5:3"
V="$DN,scale=640:1138:flags=lanczos"      # vertical 9:16
# Horizontal 16:9 grabado de lado dentro de un cuadro vertical: transpose=2 lo endereza.
H="transpose=2,$DN,scale=720:-2:flags=lanczos"

# enc <origen> <salida> <filtro>
enc() {
  ffmpeg -v error -y -i "$SRC/$1" -r 30 -vf "$3" \
    -c:v libx264 -crf 31 -preset slow -profile:v high -level 4.0 -pix_fmt yuv420p \
    -c:a aac -b:a 64k -ac 2 -movflags +faststart "$VID/$2.mp4"
  ffmpeg -v error -y -ss "$4" -i "$VID/$2.mp4" -frames:v 1 -vf "scale=540:-2:flags=lanczos" \
    -c:v libwebp -quality 70 "$POS/$2.webp"
  echo "  $2  $(( $(stat -c%s "$VID/$2.mp4") / 1024 )) KB"
}

enc "hiphop.MOV"                 clase-urbano-hiphop "$V"
enc "house.MP4"                  clase-urbano-house "$V"
enc "twerk recreativo 1.MP4"     clase-twerk-recreativo-1 "$V"
enc "terk recrativo 2.MP4"       clase-twerk-recreativo-2 "$H"
enc "twerk avanzado 1.MP4"       clase-twerk-avanzado-1 "$V"
enc "tuwerk avanzado 2.MP4"      clase-twerk-avanzado-2 "$V"
enc "breaking.MP4"               clase-breaking-1 "$V"
enc "breaking 2.MP4"             clase-breaking-2 "$V"
enc "flex 1 y 2.MOV"             clase-flex-1 "$V"
enc "flex 2 y 1.MOV"             clase-flex-2 "$V"
echo "Total: $(du -ch "$VID"/clase-*.mp4 | tail -1 | cut -f1)"
