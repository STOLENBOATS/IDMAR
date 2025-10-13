#!/usr/bin/env bash
set -euo pipefail
REPO_ENV="${REPO:-}"
REPO_ARG="${1:-}"
REPO="${REPO_ENV:-$REPO_ARG}"
if [[ -z "$REPO" ]]; then
  echo "Usage: REPO=owner/name $0  OR  $0 owner/name" >&2
  exit 1
fi
gh auth status -h github.com >/dev/null || { echo "Please run: gh auth login"; exit 1; }
ensure_label () {
  local NAME="$1"; local COLOR="$2"; local DESC="$3"
  if gh label view "$NAME" --repo "$REPO" >/dev/null 2>&1; then
    echo "Updating label: $NAME"
    gh label edit "$NAME" --repo "$REPO" --color "$COLOR" --description "$DESC" >/dev/null
  else
    echo "Creating label: $NAME"
    gh label create "$NAME" --repo "$REPO" --color "$COLOR" --description "$DESC" >/dev/null
  fi
}
echo "==> Using repository: $REPO"
# Priority
ensure_label "Priority:P0" "d73a4a" "Crítico / alta prioridade"
ensure_label "Priority:P1" "fbca04" "Prioridade média"
ensure_label "Priority:P2" "0e8a16" "Prioridade baixa"
# Epics
ensure_label "Epic:Reconstruction" "1d76db" "Reconstrução HIN/WIN de parciais"
ensure_label "Epic:Graph"          "0366d6" "Grafo casco⇄motor⇄trailer/partes"
ensure_label "Epic:Checklists"     "0b6bcb" "Checklists por tipo de embarcação"
ensure_label "Epic:Offline"        "6f42c1" "Modo offline + bundles assinados"
ensure_label "Epic:Forensics"      "a33ea1" "Forense por imagem (OCR + textura)"
ensure_label "Epic:Gateway LEA"    "795548" "Gateway SIS/SIENA/INTERPOL (hit/no-hit)"
ensure_label "Epic:Photo Reuse"    "e99695" "Deteção de reuso de fotos / pHash"
ensure_label "Epic:Intel"          "5319e7" "Hotspots, timelines, perfis de risco"
ensure_label "Epic:Passport"       "ff7b72" "EU Boat Passport (QR/NFC)"
ensure_label "Epic:Security"       "24292e" "Logs imutáveis, assinaturas"
ensure_label "Epic:QA"             "cfd3d7" "Testes de aceitação / qualidade"
ensure_label "Epic:DevOps"         "2c974b" "CI/CD, pipelines, bundles"
echo "Labels done."
