#!/usr/bin/env sh
set -eu

service="${1:?service is required}"
lock_dir="node_modules/.docker-dev-install.lock"
stamp_file="node_modules/.docker-dev-lockfile.sha256"
lock_hash="$(sha256sum pnpm-lock.yaml | awk '{print $1}')"
current_hash="$(cat "$stamp_file" 2>/dev/null || true)"

case "$service" in
  web)
    workspace_dir="apps/web"
    required_bin="$workspace_dir/node_modules/next/dist/bin/next"
    ;;
  cms|worker)
    workspace_dir="apps/cms"
    if [ "$service" = "worker" ]; then
      required_bin="$workspace_dir/node_modules/tsx/dist/cli.mjs"
    else
      required_bin="$workspace_dir/node_modules/next/dist/bin/next"
    fi
    ;;
  *)
    echo "[docker-dev] Unknown service: $service" >&2
    exit 1
    ;;
esac

install_deps() {
  echo "[docker-dev] Installing workspace dependencies..."
  rm -rf "$workspace_dir/node_modules"
  CI=true pnpm install --frozen-lockfile --prefer-offline
  printf "%s" "$lock_hash" > "$stamp_file"
}

wait_for_install() {
  while [ -d "$lock_dir" ]; do
    echo "[docker-dev] Waiting for dependency install lock..."
    sleep 2
  done
}

needs_install() {
  [ ! -d node_modules/.pnpm ] || [ "$current_hash" != "$lock_hash" ] || [ ! -d "$workspace_dir/node_modules" ] || [ ! -f "$required_bin" ]
}

if [ ! -d node_modules/.pnpm ] || [ "$current_hash" != "$lock_hash" ]; then
  if [ -d node_modules/.pnpm ] && [ -z "$current_hash" ]; then
    printf "%s" "$lock_hash" > "$stamp_file"
  fi

  current_hash="$(cat "$stamp_file" 2>/dev/null || true)"
fi

while needs_install; do
  if mkdir "$lock_dir" 2>/dev/null; then
    trap 'rmdir "$lock_dir" 2>/dev/null || true' EXIT INT TERM
    install_deps
    rmdir "$lock_dir"
    trap - EXIT INT TERM
  else
    wait_for_install
    current_hash="$(cat "$stamp_file" 2>/dev/null || true)"
  fi
done

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
