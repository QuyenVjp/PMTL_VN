[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

function Test-Command {
    param([string]$Name)
    return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Show-Status {
    param(
        [Parameter(Mandatory = $true)][string]$Label,
        [Parameter(Mandatory = $true)][bool]$Ok,
        [string]$Detail = ""
    )

    $prefix = if ($Ok) { "OK   " } else { "MISS " }
    $color = if ($Ok) { "Green" } else { "Yellow" }
    if ($Detail) {
        Write-Host "$prefix$Label :: $Detail" -ForegroundColor $color
    }
    else {
        Write-Host "$prefix$Label" -ForegroundColor $color
    }
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$officialRoot = Join-Path $repoRoot "tmp\reference\anthropic"

Write-Host "Claude Code doctor for PMTL_VN" -ForegroundColor Cyan
Write-Host "Repo root: $repoRoot"
Write-Host ""

$hasClaude = Test-Command "claude"
$hasGit = Test-Command "git"
$hasNode = Test-Command "node"
$hasPnpm = Test-Command "pnpm"

$claudeDetail = if ($hasClaude) { (& claude --version).Trim() } else { "not found" }
$gitDetail = if ($hasGit) { (& git --version).Trim() } else { "not found" }
$nodeDetail = if ($hasNode) { (& node --version).Trim() } else { "not found" }
$pnpmDetail = if ($hasPnpm) { (& pnpm --version).Trim() } else { "not found" }

Show-Status -Label "claude binary" -Ok $hasClaude -Detail $claudeDetail
Show-Status -Label "git binary" -Ok $hasGit -Detail $gitDetail
Show-Status -Label "node binary" -Ok $hasNode -Detail $nodeDetail
Show-Status -Label "pnpm binary" -Ok $hasPnpm -Detail $pnpmDetail

Write-Host ""

$requiredPaths = @(
    "CLAUDE.md",
    ".claude\settings.json",
    ".claude\agents\README.md",
    ".claude\commands\multi-cli-router.md",
    ".claude\hooks\session-context.js",
    ".claude\hooks\block-dangerous-bash.js",
    ".claude\hooks\post-edit-context.js",
    ".claude\hooks\post-bash-verify.js",
    ".claude\hooks\stop-guard.js"
)

foreach ($relativePath in $requiredPaths) {
    $absolutePath = Join-Path $repoRoot $relativePath
    Show-Status -Label $relativePath -Ok (Test-Path $absolutePath)
}

Write-Host ""

$officialRepos = @(
    "claude-code",
    "skills",
    "claude-code-action",
    "claude-quickstarts"
)

foreach ($repoName in $officialRepos) {
    $repoPath = Join-Path $officialRoot $repoName
    Show-Status -Label "reference/$repoName" -Ok (Test-Path $repoPath)
}

Write-Host ""
Write-Host "Interactive plugin commands to run in Claude Code if not done yet:" -ForegroundColor Cyan
Write-Host "  /plugin marketplace add anthropics/skills"
Write-Host "  /plugin install document-skills@anthropic-agent-skills"
Write-Host "  /plugin install example-skills@anthropic-agent-skills"
