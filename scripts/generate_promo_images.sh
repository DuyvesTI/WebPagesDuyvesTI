#!/usr/bin/env bash
#
# generate_promo_images.sh
# Regenera las imágenes promocionales de WhatsApp/Instagram (1080x1920)
# a partir de las plantillas HTML ubicadas en assets/promo/.
#
# Uso:
#   bash scripts/generate_promo_images.sh
#
# Requisitos:
#   - Google Chrome o Chromium instalado.
#   - Familia de fuentes Noto Sans completa (Regular a Black) para que
#     las negritas se rendericen de forma idéntica en cada generación.
#
# Salidas:
#   - assets/promo/duyvesti-whatsapp-promo.png         (tema oscuro)
#   - assets/promo/duyvesti-whatsapp-promo-blanco.png  (tema claro)

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROMO_DIR="$ROOT_DIR/assets/promo"

CHROME_BIN="${CHROME_BIN:-}"
if [ -z "$CHROME_BIN" ]; then
  for candidate in google-chrome google-chrome-stable chromium chromium-browser; do
    if command -v "$candidate" > /dev/null 2>&1; then
      CHROME_BIN="$candidate"
      break
    fi
  done
fi

if [ -z "$CHROME_BIN" ]; then
  echo "ERROR: No se encontró Chrome/Chromium. Instálalo o define CHROME_BIN." >&2
  exit 1
fi

render() {
  local html="$1"
  local out="$2"
  echo "Generando $(basename "$out") ..."
  "$CHROME_BIN" \
    --headless=new \
    --disable-gpu \
    --hide-scrollbars \
    --force-device-scale-factor=1 \
    --window-size=1080,1920 \
    --screenshot="$out" \
    "file://$html" > /dev/null 2>&1
}

render "$PROMO_DIR/whatsapp-promo.html" "$PROMO_DIR/duyvesti-whatsapp-promo.png"
render "$PROMO_DIR/whatsapp-promo-light.html" "$PROMO_DIR/duyvesti-whatsapp-promo-blanco.png"

echo "Listo: imágenes promocionales actualizadas en assets/promo/"
