# Gera screenshot 1280x800 para a Chrome Web Store.
# Uso: .\scripts\generate-store-screenshot.ps1

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$width = 1280
$height = 800
$outDir = Join-Path (Split-Path -Parent $PSScriptRoot) "dist"
$outPath = Join-Path $outDir "screenshot-1280x800.png"

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$bmp = New-Object System.Drawing.Bitmap $width, $height
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

# Fundo gradiente (mesmas cores do popup)
$rect = New-Object System.Drawing.Rectangle 0, 0, $width, $height
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $rect,
    [System.Drawing.Color]::FromArgb(245, 247, 250),
    [System.Drawing.Color]::FromArgb(195, 207, 226),
    45
)
$g.FillRectangle($brush, $rect)
$brush.Dispose()

# Titulo da loja
$titleFont = New-Object System.Drawing.Font "Segoe UI", 36, ([System.Drawing.FontStyle]::Bold)
$subFont = New-Object System.Drawing.Font "Segoe UI", 18
$titleBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(44, 62, 80))
$subBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(52, 73, 94))

$g.DrawString("Exportacao Automatica de CSV", $titleFont, $titleBrush, 80, 120)
$g.DrawString("Oracle Cloud (Alloha) - exporte varios dias em um clique", $subFont, $subBrush, 80, 175)

# Card simulando o popup (lado direito)
$cardX = 720
$cardY = 90
$cardW = 480
$cardH = 620
$cardRect = New-Object System.Drawing.RectangleF $cardX, $cardY, $cardW, $cardH
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$radius = 16
$path.AddArc($cardX, $cardY, $radius * 2, $radius * 2, 180, 90)
$path.AddArc($cardX + $cardW - $radius * 2, $cardY, $radius * 2, $radius * 2, 270, 90)
$path.AddArc($cardX + $cardW - $radius * 2, $cardY + $cardH - $radius * 2, $radius * 2, $radius * 2, 0, 90)
$path.AddArc($cardX, $cardY + $cardH - $radius * 2, $radius * 2, $radius * 2, 90, 90)
$path.CloseFigure()
$g.FillPath((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)), $path)
$g.DrawPath((New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(230, 234, 237), 1)), $path)

$popupFont = New-Object System.Drawing.Font "Segoe UI", 20, ([System.Drawing.FontStyle]::Bold)
$labelFont = New-Object System.Drawing.Font "Segoe UI", 11, ([System.Drawing.FontStyle]::Bold)
$fieldFont = New-Object System.Drawing.Font "Segoe UI", 12
$mutedBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(52, 73, 94))
$fieldBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(44, 62, 80))

$g.DrawString("Exportacao Automatica", $popupFont, $fieldBrush, ($cardX + 24), ($cardY + 24))

function Draw-Field($x, $y, $w, $h, $text) {
    $fieldRect = New-Object System.Drawing.RectangleF $x, $y, $w, $h
    $g.FillRectangle((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)), $fieldRect)
    $g.DrawRectangle((New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(232, 234, 237), 2)), $x, $y, $w, $h)
    $g.DrawString($text, $fieldFont, $fieldBrush, ($x + 12), ($y + 10))
}

$y = $cardY + 80
$g.DrawString("PERIODO", $labelFont, $mutedBrush, ($cardX + 24), $y)
$y += 28
$g.DrawString("Ano:", $labelFont, $mutedBrush, ($cardX + 24), $y)
Draw-Field ($cardX + 24) ($y + 22) 420 42 "2026"
$y += 80
$g.DrawString("Inicio:  Junho  |  Dia 1", $fieldFont, $fieldBrush, ($cardX + 24), $y)
$y += 36
$g.DrawString("Fim:     Junho  |  Dia 16", $fieldFont, $fieldBrush, ($cardX + 24), $y)
$y += 50
$g.DrawString("CONFIGURACOES", $labelFont, $mutedBrush, ($cardX + 24), $y)
$y += 28
Draw-Field ($cardX + 24) ($y + 22) 420 42 "Area: Todos"
$y += 80
Draw-Field ($cardX + 24) ($y + 22) 420 42 "Formato: CSV consolidado"
$y += 90

# Botao
$btnRect = New-Object System.Drawing.RectangleF ($cardX + 24), $y, 420, 52
$btnBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $btnRect,
    [System.Drawing.Color]::FromArgb(52, 152, 219),
    [System.Drawing.Color]::FromArgb(41, 128, 185),
    90
)
$btnPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$br = 10
$bx = $cardX + 24; $by = $y; $bw = 420; $bh = 52
$btnPath.AddArc($bx, $by, $br * 2, $br * 2, 180, 90)
$btnPath.AddArc($bx + $bw - $br * 2, $by, $br * 2, $br * 2, 270, 90)
$btnPath.AddArc($bx + $bw - $br * 2, $by + $bh - $br * 2, $br * 2, $br * 2, 0, 90)
$btnPath.AddArc($bx, $by + $bh - $br * 2, $br * 2, $br * 2, 90, 90)
$btnPath.CloseFigure()
$g.FillPath($btnBrush, $btnPath)
$btnFont = New-Object System.Drawing.Font "Segoe UI", 14, ([System.Drawing.FontStyle]::Bold)
$whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$g.DrawString("Iniciar Exportacao", $btnFont, $whiteBrush, ($cardX + 130), ($y + 14))

# Bullets a esquerda
$bulletFont = New-Object System.Drawing.Font "Segoe UI", 16
$items = @(
    "Selecione o periodo de datas",
    "Escolha area e formato",
    "Download automatico do arquivo"
)
$iy = 260
foreach ($item in $items) {
    $g.DrawString("-  $item", $bulletFont, $subBrush, 80, $iy)
    $iy += 42
}

$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose(); $bmp.Dispose()

Write-Host ""
Write-Host "Screenshot gerada!" -ForegroundColor Green
Write-Host "  Tamanho: 1280 x 800"
Write-Host "  Arquivo: $outPath"
Write-Host ""
Write-Host "Faca upload deste arquivo na Chrome Web Store."
