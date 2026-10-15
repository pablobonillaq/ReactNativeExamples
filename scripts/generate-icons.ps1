<#
  Generates the app icons from assets/icon/icon.html.

  1. Renders each layer of the design at 1024x1024 with headless Microsoft Edge
     (full icon, adaptive background, adaptive foreground, monochrome).
  2. Resizes them to every Android density and to the iOS sizes.

  Usage (from the project root):  powershell -File scripts/generate-icons.ps1
#>
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$edge = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) { $edge = "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe" }
$html = (Join-Path $root 'assets\icon\icon.html') -replace '\\', '/'
$work = Join-Path $root 'assets\icon\rendered'
New-Item -ItemType Directory -Force $work | Out-Null

function Render-Layer($layer) {
  $png = Join-Path $work "$layer.png"
  $profile = Join-Path $env:TEMP "rne-icon-edge-$layer"
  $args = @(
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
    "--user-data-dir=$profile",
    '--default-background-color=00000000',
    '--window-size=1024,1024',
    '--virtual-time-budget=10000',
    "--screenshot=$png",
    "file:///$html`?layer=$layer"
  )
  Start-Process -FilePath $edge -ArgumentList $args -Wait -WindowStyle Hidden
  if (-not (Test-Path $png)) { throw "Edge did not render layer '$layer'" }
  return $png
}

function Save-Resized($source, $size, $destination, [switch]$Circle, [switch]$Opaque) {
  $src = [System.Drawing.Image]::FromFile($source)
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  if ($Opaque) { $g.Clear([System.Drawing.Color]::Black) } else { $g.Clear([System.Drawing.Color]::Transparent) }
  if ($Circle) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddEllipse(0, 0, $size, $size)
    $g.SetClip($path)
  }
  $g.DrawImage($src, 0, 0, $size, $size)
  $g.Dispose(); $src.Dispose()
  New-Item -ItemType Directory -Force (Split-Path $destination) | Out-Null
  $bmp.Save($destination, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

Write-Host 'Rendering layers with Edge...'
$full = Render-Layer 'full'
$bg = Render-Layer 'bg'
$fg = Render-Layer 'fg'
$mono = Render-Layer 'mono'

# ---------- Android ----------
$res = Join-Path $root 'android\app\src\main\res'
# Legacy icons (48dp) and adaptive layers (108dp) per density.
$densities = @{ 'mdpi' = 1; 'hdpi' = 1.5; 'xhdpi' = 2; 'xxhdpi' = 3; 'xxxhdpi' = 4 }
foreach ($d in $densities.Keys) {
  $legacy = [int](48 * $densities[$d])
  $adaptive = [int](108 * $densities[$d])
  $dir = Join-Path $res "mipmap-$d"
  Save-Resized $full $legacy (Join-Path $dir 'ic_launcher.png')
  Save-Resized $full $legacy (Join-Path $dir 'ic_launcher_round.png') -Circle
  Save-Resized $bg $adaptive (Join-Path $dir 'ic_launcher_background.png')
  Save-Resized $fg $adaptive (Join-Path $dir 'ic_launcher_foreground.png')
  Save-Resized $mono $adaptive (Join-Path $dir 'ic_launcher_monochrome.png')
  Write-Host "Android $d done"
}

# ---------- iOS ----------
$ios = Join-Path $root 'ios\ReactNativeExamples\Images.xcassets\AppIcon.appiconset'
if (Test-Path $ios) {
  # iOS icons must not have transparency.
  foreach ($size in 40, 58, 60, 80, 87, 120, 180, 1024) {
    Save-Resized $full $size (Join-Path $ios "icon-$size.png") -Opaque
  }
  Write-Host 'iOS done'
}

Write-Host 'Icons generated.'
