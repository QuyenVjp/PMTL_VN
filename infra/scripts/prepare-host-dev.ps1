Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$apiRoot = Join-Path $repoRoot "apps/api"
$apiBinRoot = Join-Path $apiRoot "node_modules/.bin"
$prismaCli = Join-Path $apiBinRoot "prisma.CMD"
$tsxCli = Join-Path $apiBinRoot "tsx.CMD"

Push-Location $repoRoot

try {
  . (Join-Path $repoRoot "infra/scripts/set-host-dev-env.ps1")

  if (-not (Test-Path $prismaCli)) {
    throw "Không tìm thấy Prisma CLI tại '$prismaCli'. Hãy chạy 'pnpm install' trước."
  }

  if (-not (Test-Path $tsxCli)) {
    throw "Không tìm thấy TSX CLI tại '$tsxCli'. Hãy chạy 'pnpm install' trước."
  }

  Push-Location $apiRoot
  try {
    Write-Host "[host-prepare] Applying Prisma schema..." -ForegroundColor Cyan
    & $prismaCli db push --schema=./prisma/schema.prisma
    if ($LASTEXITCODE -ne 0) {
      Write-Host "[host-prepare] Schema drift detected. Force-resetting local dev schema..." -ForegroundColor Yellow
      & $prismaCli db push --schema=./prisma/schema.prisma --force-reset
      if ($LASTEXITCODE -ne 0) {
        throw "Lệnh 'prisma db push --force-reset' thất bại."
      }
    }

    Write-Host "[host-prepare] Seeding host dev data..." -ForegroundColor Cyan
    & $tsxCli prisma/seed.ts
    if ($LASTEXITCODE -ne 0) {
      throw "Lệnh 'tsx prisma/seed.ts' thất bại."
    }
  }
  finally {
    Pop-Location
  }
}
finally {
  Pop-Location
}
