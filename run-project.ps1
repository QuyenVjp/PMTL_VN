Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = $PSScriptRoot
$hostEnvScript    = Join-Path $repoRoot "infra/scripts/set-host-dev-env.ps1"
$hostPrepareScript = Join-Path $repoRoot "infra/scripts/prepare-host-dev.ps1"

# ── helpers ────────────────────────────────────────────────────────────────────

function Write-Step {
  param([string]$Msg)
  Write-Host "[pmtl] $Msg" -ForegroundColor Cyan
}

function Write-Ok {
  param([string]$Msg)
  Write-Host "[pmtl] ✓ $Msg" -ForegroundColor Green
}

function Write-Warn {
  param([string]$Msg)
  Write-Host "[pmtl] ⚠ $Msg" -ForegroundColor Yellow
}

function Stop-DevPortProcesses {
  param([int[]] $Ports)
  foreach ($port in $Ports) {
    $conns = @(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
    foreach ($conn in $conns) {
      $pid_ = $conn.OwningProcess
      if ($pid_ -and $pid_ -ne $PID) {
        Write-Warn "Giải phóng port $port từ PID $pid_..."
        Stop-Process -Id $pid_ -Force -ErrorAction SilentlyContinue
      }
    }
  }
}

function Assert-NodeVersion {
  # Yêu cầu Node 20.x — chỉ switch nếu cần và nvm có trong PATH
  $rawVersion = (node --version 2>$null) -replace "^v", ""
  $major = [int]($rawVersion -split "\." | Select-Object -First 1)
  if ($major -eq 20) {
    Write-Ok "Node $rawVersion đang dùng."
    return
  }
  Write-Warn "Node $rawVersion khác v20. Đang thử chuyển sang Node 20..."
  $nvmCmd = Get-Command nvm -ErrorAction SilentlyContinue
  if (-not $nvmCmd) {
    Write-Warn "Không tìm thấy nvm. Vẫn tiếp tục với Node hiện tại — có thể gặp lỗi tương thích."
    return
  }
  # Chạy nvm use trực tiếp trong PS (không qua cmd /c để PATH được cập nhật)
  & nvm use 20 | Out-Null
  if ($LASTEXITCODE -ne 0) {
    Write-Warn "nvm use 20 thất bại — tiếp tục với Node $rawVersion."
  } else {
    Write-Ok "Đã chuyển sang Node 20."
  }
}

function Assert-DockerInfra {
  # Kiểm tra postgres/redis/meilisearch đang chạy
  $composeFile = Join-Path $repoRoot "infra/docker/compose.dev.yml"
  if (-not (Test-Path $composeFile)) {
    Write-Warn "Không tìm thấy $composeFile — bỏ qua kiểm tra Docker infra."
    return
  }
  Write-Step "Kiểm tra Docker infra (postgres + redis + meilisearch)..."
  $psOutput = docker compose -f $composeFile ps --format json 2>$null
  if ($LASTEXITCODE -ne 0) {
    Write-Warn "Không lấy được trạng thái compose — tiếp tục, prepare script sẽ tự khôi phục nếu cần."
    return
  }
  # Nếu postgres chưa healthy thì khởi động core infra
  $postgresUp = $psOutput -match '"Service":"postgres"' -and $psOutput -match '"Health":"healthy"'
  if (-not $postgresUp) {
    Write-Step "Khởi động Docker infra core (postgres + redis + meilisearch)..."
    & docker compose -f $composeFile up -d postgres redis meilisearch
    if ($LASTEXITCODE -ne 0) {
      throw "Không thể khởi động Docker infra. Kiểm tra Docker Desktop có đang chạy không."
    }
    Write-Ok "Docker infra đã khởi động — chờ postgres sẵn sàng..."
  } else {
    Write-Ok "Docker infra đang chạy."
  }
}

# ── main ───────────────────────────────────────────────────────────────────────

Push-Location $repoRoot

try {
  Assert-NodeVersion

  Write-Step "Load biến môi trường host dev..."
  . $hostEnvScript
  Write-Ok "Env vars đã load."

  Write-Step "Giải phóng ports 3001 và 3002..."
  Stop-DevPortProcesses -Ports @(3001, 3002)

  Assert-DockerInfra

  Write-Step "Chuẩn bị DB + seed (prisma db push + seed.ts)..."
  & pwsh -ExecutionPolicy Bypass -File $hostPrepareScript
  if ($LASTEXITCODE -ne 0) {
    throw "prepare-host-dev.ps1 thất bại. Xem lỗi phía trên."
  }
  Write-Ok "DB đã sẵn sàng."

  Write-Host ""
  Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
  Write-Host "  PMTL Dev Stack đang khởi động..." -ForegroundColor White
  Write-Host "  API  →  http://127.0.0.1:3001/api/docs  (sẵn sàng sau ~20s)" -ForegroundColor DarkGray
  Write-Host "  Admin → http://127.0.0.1:3002            (sẵn sàng sau ~5s)" -ForegroundColor DarkGray
  Write-Host "  Web  →  http://127.0.0.1:3000            (sẵn sàng sau ~15s)" -ForegroundColor DarkGray
  Write-Host "  Ctrl+C để dừng tất cả." -ForegroundColor DarkGray
  Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
  Write-Host ""

  # Chạy turbo parallel: api + admin + web
  # Lưu ý: NestJS cần ~20s để compile — đừng vào admin ngay.
  & pnpm exec turbo run dev --parallel `
      --filter=@pmtl/api `
      --filter=@pmtl/admin `
      --filter=@pmtl/web

  # Nếu turbo exit (Ctrl+C hoặc crash), exit code được truyền lại
  exit $LASTEXITCODE

} catch {
  Write-Host ""
  Write-Host "[pmtl] LỖI: $_" -ForegroundColor Red
  Write-Host "[pmtl] Stack trace: $($_.ScriptStackTrace)" -ForegroundColor DarkRed
  exit 1
} finally {
  Pop-Location
}
