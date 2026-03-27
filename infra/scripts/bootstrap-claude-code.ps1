[CmdletBinding()]
param(
    [switch]$InstallOfficial,
    [switch]$IncludeCommunity,
    [switch]$UpdateRefs
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Test-Command {
    param([string]$Name)
    return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Sync-Repo {
    param(
        [Parameter(Mandatory = $true)][string]$Url,
        [Parameter(Mandatory = $true)][string]$Path
    )

    if (Test-Path $Path) {
        if ($UpdateRefs) {
            Write-Step "Updating $(Split-Path $Path -Leaf)"
            git -C $Path fetch --depth 1 origin
            git -C $Path reset --hard origin/HEAD
        }
        else {
            Write-Host "SKIP  $Path (already exists)" -ForegroundColor DarkYellow
        }
        return
    }

    Write-Step "Cloning $Url"
    git clone --depth 1 $Url $Path
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$officialRoot = Join-Path $repoRoot "tmp\reference\anthropic"
$communityRoot = Join-Path $repoRoot "tmp\reference\community"

Write-Step "Claude Code bootstrap for PMTL_VN"
Write-Host "Repo root: $repoRoot"

if (-not (Test-Command "git")) {
    throw "Git is required."
}

if (-not (Test-Path $officialRoot)) {
    New-Item -ItemType Directory -Path $officialRoot -Force | Out-Null
}

if ($InstallOfficial) {
    Write-Step "Running official Claude Code installer for Windows"
    Invoke-Expression ((Invoke-RestMethod "https://claude.ai/install.ps1"))
}

$claudeVersion = $null
if (Test-Command "claude") {
    try {
        $claudeVersion = (& claude --version).Trim()
        Write-Host "Claude Code: $claudeVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "WARN  Claude Code is installed but version check failed." -ForegroundColor Yellow
    }
}
else {
    Write-Host "WARN  Claude Code is not on PATH. Run with -InstallOfficial or install via:" -ForegroundColor Yellow
    Write-Host "      irm https://claude.ai/install.ps1 | iex"
}

Sync-Repo -Url "https://github.com/anthropics/claude-code.git" -Path (Join-Path $officialRoot "claude-code")
Sync-Repo -Url "https://github.com/anthropics/skills.git" -Path (Join-Path $officialRoot "skills")
Sync-Repo -Url "https://github.com/anthropics/claude-code-action.git" -Path (Join-Path $officialRoot "claude-code-action")
Sync-Repo -Url "https://github.com/anthropics/claude-quickstarts.git" -Path (Join-Path $officialRoot "claude-quickstarts")

if ($IncludeCommunity) {
    if (-not (Test-Path $communityRoot)) {
        New-Item -ItemType Directory -Path $communityRoot -Force | Out-Null
    }

    Sync-Repo -Url "https://github.com/hesreallyhim/awesome-claude-code.git" -Path (Join-Path $communityRoot "awesome-claude-code")
    Sync-Repo -Url "https://github.com/ykdojo/claude-code-tips.git" -Path (Join-Path $communityRoot "claude-code-tips")
    Sync-Repo -Url "https://github.com/shanraisshan/claude-code-best-practice.git" -Path (Join-Path $communityRoot "claude-code-best-practice")
}

Write-Host ""
Write-Host "Official references synced under:" -ForegroundColor Green
Write-Host "  $officialRoot"

Write-Host ""
Write-Host "Next steps inside Claude Code:" -ForegroundColor Cyan
Write-Host "  1. cd $repoRoot"
Write-Host "  2. claude"
Write-Host "  3. /plugin marketplace add anthropics/skills"
Write-Host "  4. /plugin install document-skills@anthropic-agent-skills"
Write-Host "  5. /plugin install example-skills@anthropic-agent-skills"
Write-Host ""
Write-Host "PMTL repo-local guidance already exists in:" -ForegroundColor Cyan
Write-Host "  $repoRoot\CLAUDE.md"
Write-Host "  $repoRoot\.claude\settings.json"
Write-Host "  $repoRoot\.claude\agents\README.md"
Write-Host ""
Write-Host "Run doctor after setup:" -ForegroundColor Cyan
Write-Host "  pnpm claude:doctor"
