#!/usr/bin/env bash
#
# Genera los videos web de F Productions a partir de los originales de camara.
#
#   Entrada : src/assets/fproductions/*.mp4   (ignorados por git, ~420 MB)
#   Salida  : public/videos/*.mp4             (versionados, ~35 MB)
#             src/assets/fproductions/posters/*.webp
#
# Uso:  bash scripts/encode-reels.sh
# Requiere ffmpeg en el PATH.
#
# Dos perfiles, porque el coste de cada clip es distinto:
#
#   loop-*  Acompanamiento. Mudo, duracion completa, intercalado entre las fotos de
#           GallerySection y con autoplay al entrar en viewport. Es lo unico que se
#           descarga solo, pero nunca los tres a la vez: el filmstrip es horizontal,
#           asi que solo baja el clip que el visitante tiene delante.
#
#   reel-*  Protagonista. Con audio, duracion completa, se descarga recien al abrir
#           el lightbox. Al no autocargarse puede permitirse mas calidad.
#
# El denoise no es cosmetico: el grano de sensor de los originales consume bitrate
# sin aportar nada visible, y quitarlo bajo el peso ~35% a igualdad de CRF.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/src/assets/fproductions"
VID="$ROOT/public/videos"
POS="$SRC/posters"

command -v ffmpeg >/dev/null || { echo "ffmpeg no esta en el PATH."; exit 1; }
mkdir -p "$VID" "$POS"

DN="hqdn3d=4:3:6:4"
SC="scale=720:1280:force_original_aspect_ratio=decrease:flags=lanczos"

kb() { echo "$(( $(stat -c%s "$1") / 1024 )) KB"; }

# encode_loop <archivo-origen> <nombre-salida>
encode_loop() {
  ffmpeg -v error -y -i "$SRC/$1" \
    -an -r 30 -vf "$DN,$SC" \
    -c:v libx264 -crf 32 -preset slow -profile:v high -level 4.0 \
    -pix_fmt yuv420p -movflags +faststart "$VID/$2.mp4"
  echo "  loop  $2.mp4  $(kb "$VID/$2.mp4")"
}

# encode_reel <archivo-origen> <nombre-salida>
encode_reel() {
  ffmpeg -v error -y -i "$SRC/$1" -r 30 -vf "$DN,$SC" \
    -c:v libx264 -crf 30 -preset slow -profile:v high -level 4.0 \
    -pix_fmt yuv420p -c:a aac -b:a 96k -ac 2 -movflags +faststart "$VID/$2.mp4"
  echo "  reel  $2.mp4  $(kb "$VID/$2.mp4")"
}

# poster <nombre-salida> <segundo>  — se extrae del MP4 ya comprimido para que
# el still coincida exactamente con el primer fotograma que vera el visitante.
poster() {
  ffmpeg -v error -y -ss "$2" -i "$VID/$1.mp4" -frames:v 1 \
    -vf "scale=720:-2:flags=lanczos" -c:v libwebp -quality 82 "$POS/$1.webp"
  echo "  post  $1.webp  $(kb "$POS/$1.webp")"
}

echo "== LOOPS (mudos, completos) =="
encode_loop "IMG_3144.mp4" "loop-3144"
encode_loop "IMG_3199.mp4" "loop-3199"
encode_loop "IMG_3414.mp4" "loop-3414"

echo "== REELS (con audio, completos) =="
encode_reel "IMG_2543.mp4" "reel-2543"
encode_reel "IMG_3155.mp4" "reel-3155"
encode_reel "IMG_3410.MP4" "reel-3410"
encode_reel "IMG_3413.mp4" "reel-3413"
encode_reel "IMG_9167.mp4" "reel-9167"

echo "== POSTERS =="
poster "loop-3144" 1 ; poster "loop-3199" 1 ; poster "loop-3414" 1
poster "reel-2543" 3 ; poster "reel-3155" 8 ; poster "reel-3410" 3
poster "reel-3413" 5 ; poster "reel-9167" 5

echo
echo "Autocarga (loops):  $(du -ch "$VID"/loop-*.mp4 | tail -1 | cut -f1)"
echo "Bajo demanda:       $(du -ch "$VID"/reel-*.mp4 | tail -1 | cut -f1)"
