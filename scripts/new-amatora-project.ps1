<#
.SYNOPSIS
  Crea un proyecto Shopify nuevo con el sistema de diseño Amatora preinstalado.

.DESCRIPTION
  Hace cuatro cosas:
    1. Verifica/actualiza el clone del sistema Amatora en ~/amatora-system.
    2. Clona Dawn (o el theme base que indiques) en la carpeta del proyecto,
       sin el .git del upstream — para que sea tu repo desde cero.
    3. Copia el prompt de inicialización al portapapeles.
    4. Abre VS Code en la carpeta del proyecto.

  Después solo abrís Claude Code en VS Code y pegás (Ctrl+V) el prompt que
  ya está en el clipboard. Claude termina de instalar Amatora copiando
  desde ~/amatora-system al theme.

.EXAMPLE
  .\new-amatora-project.ps1 -Name cliente-zapatos

  Crea ~/Desktop/cliente-zapatos con Dawn limpio + sistema Amatora local
  listo para que Claude lo instale.

.EXAMPLE
  .\new-amatora-project.ps1 -Name moda-otono -Path "D:\proyectos"

  Lo mismo pero la carpeta del proyecto va en D:\proyectos\moda-otono.

.PARAMETER Name
  Nombre de la carpeta del proyecto.

.PARAMETER Path
  Ruta donde crear la carpeta. Default: ~/Desktop.

.PARAMETER ThemeRepo
  URL del repo del theme base. Default: Dawn oficial de Shopify.
#>
param(
  [Parameter(Mandatory=$true)][string]$Name,
  [string]$Path = "$env:USERPROFILE\Desktop",
  [string]$ThemeRepo = "https://github.com/Shopify/dawn.git"
)

$ErrorActionPreference = "Stop"

# 1. Sistema Amatora local
$amatoraRoot = "$env:USERPROFILE\amatora-system"
if (-not (Test-Path $amatoraRoot)) {
  Write-Host "==> Clonando sistema Amatora a $amatoraRoot"
  git clone https://github.com/FranciscoJardon/INICIO.git $amatoraRoot
  if ($LASTEXITCODE -ne 0) { throw "git clone Amatora falló" }
} else {
  Write-Host "==> Actualizando sistema Amatora (git pull)"
  git -C $amatoraRoot pull
  if ($LASTEXITCODE -ne 0) { throw "git pull Amatora falló" }
}

# 2. Crear carpeta del proyecto
$projectPath = Join-Path $Path $Name
if (Test-Path $projectPath) {
  throw "Ya existe $projectPath. Aborto sin tocar nada."
}

Write-Host "==> Clonando theme base a $projectPath"
git clone $ThemeRepo $projectPath
if ($LASTEXITCODE -ne 0) { throw "git clone del theme base falló" }

# Limpiar el .git del theme upstream — el proyecto arranca como tu repo desde cero
Remove-Item -Recurse -Force "$projectPath\.git"
Write-Host "    .git del theme upstream removido"

# 3. Copiar el prompt init.md al clipboard (extrayendo el bloque entre ``` ```)
$initMd = Get-Content "$amatoraRoot\prompts\init.md" -Raw
$blockMatch = [regex]::Match($initMd, '(?s)```\r?\n(.*?)\r?\n```')
if ($blockMatch.Success) {
  $blockMatch.Groups[1].Value | Set-Clipboard
  Write-Host "==> Prompt de inicialización copiado al portapapeles"
} else {
  Write-Warning "No pude extraer el bloque del prompt. Abrí $amatoraRoot\prompts\init.md a mano."
}

# 4. Abrir VS Code
Write-Host "==> Abriendo VS Code"
code $projectPath

Write-Host ""
Write-Host "==> LISTO"
Write-Host "    Proyecto:        $projectPath"
Write-Host "    Sistema Amatora: $amatoraRoot"
Write-Host ""
Write-Host "Siguiente paso (en la nueva ventana de VS Code):"
Write-Host "  1. Abrí Claude Code"
Write-Host "  2. Pegá (Ctrl+V) en el chat — el prompt ya está en el clipboard"
Write-Host "  3. Esperá el reporte del PASO 8"
