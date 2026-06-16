#!/usr/bin/env bash
# scripts/refresh-prijslijst.sh
# Ververst de leveranciers-prijslijst in de Supabase Storage-bucket
# `sterkcalc-prijslijsten`. De zoek-API (/api/calculaties/prijslijst) pakt
# automatisch het NIEUWSTE *.json in de bucket — dus na een upload is geen
# code-wijziging of redeploy nodig.
#
# Gebruik:
#   SUPABASE_SERVICE_ROLE_KEY=... \
#   [SUPABASE_URL=https://<project>.supabase.co] \
#   scripts/refresh-prijslijst.sh <PriceCatalogue.xml | .zip> [objectnaam.json]
#
# - Input mag een Ketenstandaard SALES-005 PriceCatalogue-XML zijn, of een ZIP
#   met die XML erin.
# - Objectnaam default = bouwmaat_<MessageDate YYYY-MM>.json (uit de XML),
#   anders bouwmaat_<vandaag>.json. Dated naming = sorteerbaar; nieuwste wint.
# - Upload gaat met de SERVICE_ROLE-key (admin; omzeilt RLS). De bucket houdt
#   alleen een anon-SELECT-policy, dus de browser/zoek-API kan lezen maar niet schrijven.
set -euo pipefail

BUCKET="sterkcalc-prijslijsten"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARSER="$HERE/parse-pricecatalogue.py"

IN="${1:-}"
[ -z "$IN" ] && { echo "gebruik: refresh-prijslijst.sh <catalogus.xml|.zip> [objectnaam.json]" >&2; exit 2; }
[ -f "$IN" ] || { echo "bestand niet gevonden: $IN" >&2; exit 2; }

URL="${SUPABASE_URL:-${NEXT_PUBLIC_SUPABASE_URL:-}}"
KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"
[ -z "$URL" ] && { echo "zet SUPABASE_URL of NEXT_PUBLIC_SUPABASE_URL" >&2; exit 2; }
[ -z "$KEY" ] && { echo "zet SUPABASE_SERVICE_ROLE_KEY (admin-upload vereist)" >&2; exit 2; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# 1) ZIP? → uitpakken en de XML vinden.
XML="$IN"
case "$IN" in
  *.zip|*.ZIP)
    unzip -o "$IN" -d "$TMP" >/dev/null
    XML="$(find "$TMP" -iname '*.xml' | head -1)"
    [ -z "$XML" ] && { echo "geen XML in de ZIP gevonden" >&2; exit 1; }
    ;;
esac

# 2) Objectnaam bepalen (uit <MessageDate>, anders vandaag).
NAAM="${2:-}"
if [ -z "$NAAM" ]; then
  MDATE="$(grep -oE '<MessageDate>[0-9]{4}-[0-9]{2}' "$XML" | head -1 | grep -oE '[0-9]{4}-[0-9]{2}' || true)"
  [ -z "$MDATE" ] && MDATE="$(date +%Y-%m)"
  NAAM="bouwmaat_${MDATE}.json"
fi

# 3) Parsen → compacte JSON (bouw-relevant; --all voor inclusief kleding).
OUT="$TMP/$NAAM"
python3 "$PARSER" "$XML" "$OUT"

# 4) Uploaden (upsert) met service-role.
echo "upload → $URL/storage/v1/object/$BUCKET/$NAAM"
HTTP="$(curl -s -o "$TMP/resp.json" -w '%{http_code}' -X POST \
  "$URL/storage/v1/object/$BUCKET/$NAAM" \
  -H "Authorization: Bearer $KEY" -H "apikey: $KEY" \
  -H "x-upsert: true" -H "Content-Type: application/json" \
  --data-binary @"$OUT")"
if [ "$HTTP" != "200" ] && [ "$HTTP" != "201" ]; then
  echo "upload mislukt (HTTP $HTTP): $(cat "$TMP/resp.json")" >&2
  exit 1
fi
echo "OK — $NAAM geüpload ($(wc -c < "$OUT") bytes). De zoek-API pakt dit automatisch op (cache max 1u)."
