#!/usr/bin/env sh
set -eu

service="${1:?service is required}"
lock_dir="node_modules/.docker-dev-install.lock"
stamp_file="node_modules/.docker-dev-lockfile.sha256"
lock_hash="$(sha256sum pnpm-lock.yaml | awk '{print $1}')"
current_hash="$(cat "$stamp_file" 2>/dev/null || true)"

install_deps() {
  echo "[docker-dev] Installing workspace dependencies..."
  pnpm install --frozen-lockfile=false --prefer-offline
  printf "%s" "$lock_hash" > "$stamp_file"
}

wait_for_install() {
  while [ -d "$lock_dir" ]; do
    echo "[docker-dev] Waiting for dependency install lock..."
    sleep 2
  done
}

if [ ! -d node_modules/.pnpm ] || [ "$current_hash" != "$lock_hash" ]; then
  if mkdir "$lock_dir" 2>/dev/null; then
    trap 'rmdir "$lock_dir" 2>/dev/null || true' EXIT INT TERM
    install_deps
    rmdir "$lock_dir"
    trap - EXIT INT TERM
  else
    wait_for_install
  fi
fi

case "$service" in
  web)
    exec pnpm --filter @pmtl/web dev:container
    ;;
  cms)
    pnpm --filter @pmtl/cms db:sync
    exec pnpm --filter @pmtl/cms dev:container
    ;;
  worker)
    exec pnpm --filter @pmtl/cms worker:container
    ;;
  *)
    echo "[docker-dev] Unknown service: $service" >&2
    exit 1
    ;;
esac
