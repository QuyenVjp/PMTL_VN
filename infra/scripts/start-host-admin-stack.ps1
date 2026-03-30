Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$setHostEnv = Join-Path $repoRoot "infra/scripts/set-host-dev-env.ps1"
$prepareHostDev = Join-Path $repoRoot "infra/scripts/prepare-host-dev.ps1"
$ensurePortFree = Join-Path $repoRoot "infra/scripts/ensure-port-free.ts"

function Invoke-Checked {
  param(
    [string]$FilePath,
    [string[]]$ArgumentList
  )

  & $FilePath @ArgumentList
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed: $FilePath $($ArgumentList -join ' ')"
  }
}

Push-Location $repoRoot

try {
  . $setHostEnv

  # Ensure host dev dependencies are up, schema is synced, and seed data exists.
  Invoke-Checked -FilePath "pwsh" -ArgumentList @(
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    $prepareHostDev
  )

  # Re-apply host env in the current process so turbo children inherit it.
  . $setHostEnv

  Invoke-Checked -FilePath "pnpm" -ArgumentList @("exec", "tsx", $ensurePortFree, "3001", "api")
  Invoke-Checked -FilePath "pnpm" -ArgumentList @("exec", "tsx", $ensurePortFree, "3002", "admin")

  & pnpm exec turbo run dev --parallel --filter=@pmtl/api --filter=@pmtl/admin
  exit $LASTEXITCODE
}
finally {
  Pop-Location
}
