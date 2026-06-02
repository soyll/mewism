#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${ROOT}/icon.png"
ASSETS="${ROOT}/assets"
ICONSET="${ASSETS}/icon.iconset"

if [[ ! -f "${SRC}" ]]; then
  echo "Missing ${SRC}. Add a 512×512 (or larger) PNG first." >&2
  exit 1
fi

mkdir -p "${ASSETS}"
cp "${SRC}" "${ASSETS}/icon.png"

rm -rf "${ICONSET}"
mkdir -p "${ICONSET}"

sips -z 16 16 "${SRC}" --out "${ICONSET}/icon_16x16.png" >/dev/null
sips -z 32 32 "${SRC}" --out "${ICONSET}/icon_16x16@2x.png" >/dev/null
sips -z 32 32 "${SRC}" --out "${ICONSET}/icon_32x32.png" >/dev/null
sips -z 64 64 "${SRC}" --out "${ICONSET}/icon_32x32@2x.png" >/dev/null
sips -z 128 128 "${SRC}" --out "${ICONSET}/icon_128x128.png" >/dev/null
sips -z 256 256 "${SRC}" --out "${ICONSET}/icon_128x128@2x.png" >/dev/null
sips -z 256 256 "${SRC}" --out "${ICONSET}/icon_256x256.png" >/dev/null
sips -z 512 512 "${SRC}" --out "${ICONSET}/icon_256x256@2x.png" >/dev/null
sips -z 512 512 "${SRC}" --out "${ICONSET}/icon_512x512.png" >/dev/null
sips -z 1024 1024 "${SRC}" --out "${ICONSET}/icon_512x512@2x.png" >/dev/null

iconutil -c icns "${ICONSET}" -o "${ASSETS}/icon.icns"
rm -rf "${ICONSET}"

magick "${SRC}" -define icon:auto-resize=256,128,64,48,32,16 "${ASSETS}/icon.ico"

echo "Generated ${ASSETS}/icon.png, icon.icns, icon.ico"
