<#
.SYNOPSIS
  Instala la skill amatora-theme-builder en el proyecto actual.

.DESCRIPTION
  Descarga la skill desde GitHub y la pone en .claude/skills/amatora-theme-builder/
  del directorio donde se ejecute. Diseñado para correrse como one-liner desde
  PowerShell parado en la raíz de un proyecto:

    iwr "https://raw.githubusercontent.com/FranciscoJardon/INICIO/main/scripts/install-skill.ps1" | iex

  Sin prerequisitos. Sin clonar repos. Sin editar profiles. La skill queda
  cargada en Claude Code la próxima vez que lo abras en este proyecto.
#>

$ErrorActionPreference = "Stop"

$repoBase = "https://raw.githubusercontent.com/FranciscoJardon/INICIO/main"
$projectRoot = (Get-Location).Path
$skillTarget = Join-Path $projectRoot ".claude\skills\amatora-theme-builder"

$files = @(
  @{ src = "skill/SKILL.md";                          dest = "SKILL.md" },
  @{ src = "skill/reference/file-tree.md";            dest = "reference/file-tree.md" },
  @{ src = "skill/reference/performance.md";          dest = "reference/performance.md" },
  @{ src = "skill/reference/section-template.liquid"; dest = "reference/section-template.liquid" },
  @{ src = "skill/reference/slider-api.md";           dest = "reference/slider-api.md" },
  @{ src = "skill/reference/system-overview.md";      dest = "reference/system-overview.md" }
)

# Backup si ya existe
if (Test-Path $skillTarget) {
  $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
  $bak = "$skillTarget.bak.$stamp"
  Write-Host "==> Backup del skill anterior: $bak"
  Rename-Item $skillTarget $bak
}

# Crear directorios
New-Item -ItemType Directory -Force -Path $skillTarget | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $skillTarget "reference") | Out-Null

# Descargar con conversión a LF (clave para que el frontmatter YAML se parsee)
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
foreach ($f in $files) {
  $url = "$repoBase/$($f.src)"
  $dest = Join-Path $skillTarget $f.dest
  Write-Host "==> $($f.src)"
  $resp = Invoke-WebRequest -Uri $url -UseBasicParsing
  $content = $resp.Content -replace "`r`n", "`n" -replace "`r", "`n"
  [System.IO.File]::WriteAllText($dest, $content, $utf8NoBom)
}

Write-Host ""
Write-Host "==> LISTO"
Write-Host "    Skill instalada en:"
Write-Host "      $skillTarget"
Write-Host ""
Write-Host "    Abrí Claude Code en este proyecto y la skill 'amatora-theme-builder'"
Write-Host "    se va a cargar automáticamente al editar .liquid o pedir un slider."
Write-Host ""
Write-Host "    Tip: hacé commit de .claude/skills/ al repo del proyecto. Cualquier"
Write-Host "    dev que clone va a recibir la skill incluida."
