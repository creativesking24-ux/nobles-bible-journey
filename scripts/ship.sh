#!/usr/bin/env bash
# Ship local changes to production (Vercel).
# Usage:
#   ./scripts/ship.sh              # build + deploy production
#   ./scripts/ship.sh --preview    # build + deploy preview URL
#   ./scripts/ship.sh --message "fix calendar"
#
set -euo pipefail
cd "$(dirname "$0")/.."

PREVIEW=0
MSG=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --preview|-p) PREVIEW=1; shift ;;
    --message|-m) MSG="${2:-}"; shift 2 ;;
    --help|-h)
      sed -n '2,8p' "$0"
      exit 0
      ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

export PATH="${HOME}/.local/node/bin:${PATH}"

echo "→ Building production bundle…"
npm run build

if ! command -v vercel >/dev/null 2>&1 && ! npx --yes vercel --version >/dev/null 2>&1; then
  echo "Installing vercel CLI…"
  npm i -g vercel
fi

# Prefer local vercel binary
VERCEL_CMD=(npx --yes vercel)

if [[ "$PREVIEW" -eq 1 ]]; then
  echo "→ Deploying preview…"
  "${VERCEL_CMD[@]}" --yes
else
  echo "→ Deploying production…"
  "${VERCEL_CMD[@]}" --prod --yes
fi

echo ""
echo "✓ Ship complete."
if [[ -n "$MSG" ]]; then
  echo "  Note: $MSG"
fi
echo ""
echo "Tip: For automatic deploys on every push, connect this repo to Vercel"
echo "     (see DEPLOY.md → Continuous updates)."
