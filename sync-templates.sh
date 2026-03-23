#!/bin/bash
# Sync templates and brand assets to production
# Usage: ./sync-templates.sh [local|prod]
# - Syncs brand assets via rsync
# - Upserts templates via API (no Docker rebuild needed)

set -e

SERVER="ubuntu@51.79.176.217"
APP_DIR="/opt/snapkit"
ENV="${1:-prod}"

if [ "$ENV" = "local" ]; then
  API="http://localhost:8080"
else
  API="https://snapkit.vibery.app"
  echo "=== Syncing brand assets ==="
  rsync -avz --delete brands/ $SERVER:$APP_DIR/brands/
fi

upsert_template() {
  local id="$1" name="$2" brand="$3" layout="$4" size="$5" params="$6"

  # Try update first, create if not found
  STATUS=$(curl -sk -o /dev/null -w "%{http_code}" -X PUT "$API/api/templates/$id" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$name\",\"brand\":\"$brand\",\"layout\":\"$layout\",\"size\":\"$size\",\"params\":$params}")

  if [ "$STATUS" = "404" ]; then
    curl -sk -X POST "$API/api/templates" \
      -H "Content-Type: application/json" \
      -d "{\"id\":\"$id\",\"name\":\"$name\",\"brand\":\"$brand\",\"layout\":\"$layout\",\"size\":\"$size\",\"params\":$params}"
    echo " [CREATED] $id"
  else
    echo " [UPDATED] $id"
  fi
}

echo "=== Syncing templates ==="

# Trung Nguyen Inner Frame
upsert_template "trungnguyen-inner-frame" \
  "Trung Nguyên Inner Frame" \
  "trungnguyen" \
  "inner-frame" \
  "ig-post" \
  '{"feature_image":"/brands/trungnguyen/inner-frame-default-v2.jpg","frame_image":"/brands/trungnguyen/bottom-frame.png","title":"0986 403 790 – 098 210 3223","subtitle":"trungnguyentw.com"}'

# Trung Nguyen Showcase
upsert_template "trungnguyen-showcase" \
  "Trung Nguyên Showcase" \
  "trungnguyen" \
  "brand-showcase" \
  "ig-post" \
  '{"title":"Robot Máy Ép Nhựa – Xu Hướng Tự Động Hóa Ngành Nhựa","cta_text":"XEM NGAY","footer_text":"0986 403 790 – 098 210 3223\ndinhduong@trungnguyentw.com\ntrungnguyentw.com","accent_color":"#fc7400","title_color":"#FFFFFF","frame_image":"/brands/trungnguyen/frame_left.png","feature_image":"/brands/trungnguyen/sample_cover_2.jpg","logo_scale":"1.5","logo_offset_y":"60"}'

echo "=== Done ==="
