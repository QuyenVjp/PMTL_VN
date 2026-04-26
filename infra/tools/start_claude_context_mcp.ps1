param()

$ErrorActionPreference = "Stop"

function Test-TcpPort {
  param(
    [Parameter(Mandatory = $true)]
    [string]$TargetHost,
    [Parameter(Mandatory = $true)]
    [int]$Port,
    [int]$TimeoutMs = 800
  )

  $client = New-Object System.Net.Sockets.TcpClient
  try {
    $result = $client.BeginConnect($TargetHost, $Port, $null, $null)
    $connected = $result.AsyncWaitHandle.WaitOne($TimeoutMs, $false)
    if (-not $connected) {
      return $false
    }

    $client.EndConnect($result) | Out-Null
    return $true
  } catch {
    return $false
  } finally {
    $client.Dispose()
  }
}

function Fail-Prereq {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Message
  )

  [Console]::Error.WriteLine("[claude-context] $Message")
  exit 1
}

function Resolve-EmbeddingProvider {
  if ($env:EMBEDDING_PROVIDER) {
    return $env:EMBEDDING_PROVIDER
  }

  if ($env:OPENAI_API_KEY) {
    return "OpenAI"
  }

  if ($env:VOYAGEAI_API_KEY) {
    return "VoyageAI"
  }

  if ($env:GEMINI_API_KEY) {
    return "Gemini"
  }

  $ollamaHost = if ($env:OLLAMA_HOST) { $env:OLLAMA_HOST } else { "http://127.0.0.1:11434" }
  if ($ollamaHost -match "^https?://([^:/]+)(?::(\d+))?") {
    $hostName = $Matches[1]
    $port = if ($Matches[2]) { [int]$Matches[2] } else { 11434 }
    if (Test-TcpPort -TargetHost $hostName -Port $port) {
      return "Ollama"
    }
  }

  return $null
}

function Resolve-MilvusAddress {
  if ($env:MILVUS_ADDRESS) {
    return $env:MILVUS_ADDRESS
  }

  if ($env:MILVUS_TOKEN) {
    return $null
  }

  if (Test-TcpPort -TargetHost "127.0.0.1" -Port 19530) {
    return "127.0.0.1:19530"
  }

  return $null
}

$provider = Resolve-EmbeddingProvider
if (-not $provider) {
  Fail-Prereq "Missing embedding backend. Set OPENAI_API_KEY / GEMINI_API_KEY / VOYAGEAI_API_KEY, or install and run Ollama on http://127.0.0.1:11434."
}

$env:EMBEDDING_PROVIDER = $provider

if (-not $env:EMBEDDING_MODEL) {
  switch ($provider) {
    "OpenAI" { $env:EMBEDDING_MODEL = "text-embedding-3-small" }
    "VoyageAI" { $env:EMBEDDING_MODEL = "voyage-code-3" }
    "Gemini" { $env:EMBEDDING_MODEL = "gemini-embedding-001" }
    "Ollama" {
      if (-not $env:OLLAMA_MODEL) {
        $env:OLLAMA_MODEL = "nomic-embed-text"
      }
      $env:EMBEDDING_MODEL = $env:OLLAMA_MODEL
      if (-not $env:OLLAMA_HOST) {
        $env:OLLAMA_HOST = "http://127.0.0.1:11434"
      }
    }
  }
}

$milvusAddress = Resolve-MilvusAddress
if ($milvusAddress) {
  $env:MILVUS_ADDRESS = $milvusAddress
}

if (-not $env:MILVUS_ADDRESS -and -not $env:MILVUS_TOKEN) {
  Fail-Prereq "Missing vector database backend. Set MILVUS_TOKEN for Zilliz Cloud, or run local Milvus on 127.0.0.1:19530."
}

if (-not $env:CODE_CHUNKS_COLLECTION_NAME_OVERRIDE) {
  $env:CODE_CHUNKS_COLLECTION_NAME_OVERRIDE = "PMTL_VN"
}

& cmd /c npx -y @zilliz/claude-context-mcp@latest
