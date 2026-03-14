PNPM := pnpm

.PHONY: install dev build lint typecheck format docker-dev docker-prod

install:
	$(PNPM) install

dev:
	$(PNPM) dev

build:
	$(PNPM) build

lint:
	$(PNPM) lint

typecheck:
	$(PNPM) typecheck

format:
	$(PNPM) format:write

docker-dev:
	docker compose -f infra/docker/compose.dev.yml up --build

docker-prod:
	docker compose -f infra/docker/compose.prod.yml up -d

