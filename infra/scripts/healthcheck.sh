#!/usr/bin/env sh
set -eu

curl -fsS http://localhost:5173/api/health
curl -fsS http://localhost:3001/api/health

