# Gera o pacote .zip pronto para upload na Chrome Web Store.
# Uso: .\scripts\build.ps1

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root "chrome-extension"
$dist = Join-Path $root "dist"
$zipPath = Join-Path $dist "exportacao-csv-extension.zip"

if (-not (Test-Path (Join-Path $src "manifest.json"))) {
    throw "manifest.json não encontrado em $src"
}

$files = @(
    "manifest.json",
    "background.js",
    "content.js",
    "popup.html",
    "popup.js",
    "icons\icon16.png",
    "icons\icon48.png",
    "icons\icon128.png"
)

foreach ($file in $files) {
    if (-not (Test-Path (Join-Path $src $file))) {
        throw "Arquivo obrigatório ausente: $file"
    }
}

New-Item -ItemType Directory -Force -Path $dist | Out-Null
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

$staging = Join-Path $env:TEMP "chrome-extension-build-$(Get-Random)"
New-Item -ItemType Directory -Force -Path $staging | Out-Null

try {
    foreach ($file in $files) {
        $target = Join-Path $staging $file
        $targetDir = Split-Path $target -Parent
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
        }
        Copy-Item (Join-Path $src $file) $target -Force
    }

    Compress-Archive -Path (Join-Path $staging "*") -DestinationPath $zipPath -Force
}
finally {
    Remove-Item $staging -Recurse -Force -ErrorAction SilentlyContinue
}

$version = (Get-Content (Join-Path $src "manifest.json") -Raw | ConvertFrom-Json).version
Write-Host ""
Write-Host "Pacote gerado com sucesso!" -ForegroundColor Green
Write-Host "  Versao:  $version"
Write-Host "  Arquivo: $zipPath"
Write-Host "  Tamanho: $([math]::Round((Get-Item $zipPath).Length / 1KB, 1)) KB"
Write-Host ""
Write-Host "Proximo passo: faca upload deste ZIP no Chrome Web Store Developer Dashboard."
