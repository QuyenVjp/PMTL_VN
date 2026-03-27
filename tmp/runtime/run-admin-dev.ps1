$ErrorActionPreference = "Stop"

$env:VITE_API_BASE_URL = "http://localhost:3001"
$env:VITE_ADMIN_URL = "http://localhost:3002"

Set-Location "C:\Users\ADMIN\DEV2\PMTL_VN"
pnpm --filter @pmtl/admin dev -- --host 0.0.0.0 --strictPort
