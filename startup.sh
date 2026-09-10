#!/bin/bash
set -eu
cd /workspace
if curl -sf -o /dev/null http://127.0.0.1:8080/; then
  exit 0
fi
nohup npm run dev >/tmp/mizan-dev.log 2>&1 &
for _ in $(seq 1 60); do
  if curl -sf -o /dev/null http://127.0.0.1:8080/; then
    exit 0
  fi
  sleep 0.5
done
exit 0
