#!/usr/bin/env bash
# NET4ZERO — przebudowa output.css z Tailwinda.
#
# Repo celowo nie trzyma package.json (Vercel ma widzieć projekt jako czysto
# statyczny), więc Tailwind uruchamiamy przez npx z przypiętą wersją.
# Wersję trzymamy tu, żeby CSS budował się identycznie u każdego.
#
# Uruchamiaj ZAWSZE po dodaniu/zmianie klas w HTML — output.css jest commitowany
# i to on ląduje na produkcji.
set -euo pipefail

TAILWIND_VERSION="3.4.19"
cd "$(dirname "$0")/.."

echo "→ tailwindcss@${TAILWIND_VERSION}: src/input.css → output.css"
npx --yes "tailwindcss@${TAILWIND_VERSION}" \
  -c tailwind.config.js \
  -i src/input.css \
  -o output.css \
  --minify

echo "→ walidacja"
python3 tools/check-site.py --quiet
