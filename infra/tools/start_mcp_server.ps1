param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("grafana", "meilisearch", "postgres", "redis")]
  [string]$Server
)

$ErrorActionPreference = "Stop"

function Import-EnvFile {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path
  )

  if (-not (Test-Path $Path)) {
    throw "Env file not found: $Path"
  }

  Get-Content -Path $Path | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) {
      return
    }

    $eq = $line.IndexOf("=")
    if ($eq -lt 1) {
      return
    }

    $name = $line.Substring(0, $eq).Trim()
    $value = $line.Substring($eq + 1)
    [Environment]::SetEnvironmentVariable($name, $value)
  }
}

switch ($Server) {
  "grafana" {
    Import-EnvFile "C:\Users\ADMIN\DEV2\PMTL_VN\infra\docker\.env.prod"

    if (-not $env:GRAFANA_URL) {
      if ($env:GRAFANA_ROOT_URL) {
        $env:GRAFANA_URL = $env:GRAFANA_ROOT_URL
      } else {
        $env:GRAFANA_URL = "http://127.0.0.1:3300"
      }
    }

    if (-not $env:GRAFANA_USERNAME) {
      $env:GRAFANA_USERNAME = if ($env:GRAFANA_ADMIN_USER) { $env:GRAFANA_ADMIN_USER } else { "admin" }
    }

    if (-not $env:GRAFANA_PASSWORD -and $env:GRAFANA_ADMIN_PASSWORD) {
      $env:GRAFANA_PASSWORD = $env:GRAFANA_ADMIN_PASSWORD
    }

    & uvx mcp-grafana
    break
  }

  "meilisearch" {
    Import-EnvFile "C:\Users\ADMIN\DEV2\PMTL_VN\infra\docker\.env.dev"

    if ($env:MEILI_HOST) {
      $env:MEILI_HOST = $env:MEILI_HOST -replace "http://meilisearch:7700", "http://127.0.0.1:7700"
    } else {
      $env:MEILI_HOST = "http://127.0.0.1:7700"
    }

    & uvx --from meilisearch-mcp meilisearch-mcp
    break
  }

  "postgres" {
    Import-EnvFile "C:\Users\ADMIN\DEV2\PMTL_VN\infra\docker\.env.dev"

    $hostPort = if ($env:POSTGRES_HOST_PORT) { $env:POSTGRES_HOST_PORT } else { "55432" }
    $db = if ($env:POSTGRES_DB) { $env:POSTGRES_DB } else { "pmtl" }
    $user = if ($env:POSTGRES_USER) { $env:POSTGRES_USER } else { "pmtl" }
    $password = if ($env:POSTGRES_PASSWORD) { $env:POSTGRES_PASSWORD } else { "pmtl" }
    $dsn = "postgresql://${user}:${password}@127.0.0.1:${hostPort}/${db}"

    & cmd /c npx -y @modelcontextprotocol/server-postgres $dsn
    break
  }

  "redis" {
    & uvx --from redis-mcp-server@latest redis-mcp-server --url redis://127.0.0.1:6379/0
    break
  }
}
