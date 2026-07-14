# Shared VPS Deploy

Use this runbook when PMTL shares one VPS with another production stack such as OmniRoute.

## Safety Rule

Do not stop, restart, or reconfigure the other production stack. PMTL must run as its own Compose project and expose only loopback ports. The host Caddy process owns public `80/443` and routes by hostname.

## Preconditions

- DNS for `PMTL_DOMAIN` and `PMTL_ADMIN_DOMAIN` points to the VPS public IP.
- `infra/docker/.env.prod` is created from `infra/docker/.env.prod.example`.
- Image tags are real immutable release tags:
  - `WEB_IMAGE`
  - `API_IMAGE`
  - `ADMIN_IMAGE`
- Host ports do not collide with existing stacks:
  - `PMTL_WEB_HOST_PORT`, default `5173`
  - `API_HOST_PORT`, default `3001`
  - `ADMIN_HOST_PORT`, default `3002`

## Compose

From the PMTL release directory:

```sh
docker compose \
  --env-file infra/docker/.env.prod \
  -f infra/docker/compose.prod.yml \
  -f infra/docker/compose.shared-vps.yml \
  -p pmtl \
  up -d
```

The shared-VPS override disables the PMTL container Caddy unless the `standalone-edge` profile is explicitly enabled. This avoids binding public `80/443`.

## Host Caddy Routes

Add PMTL hostnames to `/etc/caddy/Caddyfile` without changing existing OmniRoute routes:

```caddy
phapmontamlinh-quantheambotat.vn {
  encode zstd gzip
  respond /api/metrics/* 404
  respond /api/internal/monitoring/* 404

  @api path /api/* /media/*
  handle @api {
    reverse_proxy 127.0.0.1:3001
  }

  handle {
    reverse_proxy 127.0.0.1:5173
  }
}

admin.phapmontamlinh-quantheambotat.vn {
  encode zstd gzip
  respond /api/metrics/* 404
  respond /api/internal/monitoring/* 404

  @api path /api/* /media/*
  handle @api {
    reverse_proxy 127.0.0.1:3001
  }

  handle {
    reverse_proxy 127.0.0.1:3002
  }
}
```

Validate and reload only Caddy:

```sh
caddy validate --config /etc/caddy/Caddyfile
systemctl reload caddy
```

## Verification

```sh
docker compose --env-file infra/docker/.env.prod -f infra/docker/compose.prod.yml -f infra/docker/compose.shared-vps.yml -p pmtl ps
curl -fsS http://127.0.0.1:3001/api/health/live
curl -fsS http://127.0.0.1:5173/
curl -fsS http://127.0.0.1:3002/
curl -I https://phapmontamlinh-quantheambotat.vn/
curl -I https://admin.phapmontamlinh-quantheambotat.vn/
```

If any PMTL check fails, roll back PMTL only:

```sh
docker compose --env-file infra/docker/.env.prod -f infra/docker/compose.prod.yml -f infra/docker/compose.shared-vps.yml -p pmtl down
systemctl reload caddy
```
