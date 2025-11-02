#!/usr/bin/env bash
# Auto-commit and push every 10 minutes (macOS/Linux)
# Stop with Ctrl+C
while true; do
  git add .
  git commit -m "auto: save $(date '+%Y-%m-%d %H:%M:%S')" >/dev/null 2>&1 || true
  git push
  sleep 600
done
