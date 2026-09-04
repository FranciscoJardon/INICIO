<#
.SYNOPSIS
  Crea un proyecto Shopify nuevo con el sistema de diseño Amatora preinstalado.

.DESCRIPTION
  Hace cuatro cosas:
    1. Verifica/actualiza el clone del sistema Amatora en ~/amatora-system.
    2. Clona Dawn (o el theme base que indiques) en la carpeta del proyecto,
       sin el .git del upstream - para que sea tu repo desde cero.
    3. Corre install.ps1 directamente sobre la carpeta del nuevo theme:
       copia assets/snippets/sections, edita theme.liquid, mergea schema y
       rescata los colores actuales del theme (settings_data.json).
    4. Abre VS Code en la carpeta del proyecto.

  Cero pasos manuales después - al abrir VS Code, Amatora ya está instalado.

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

# Limpiar el .git del theme upstream - el proyecto arranca como tu repo desde cero
Remove-Item -Recurse -Force "$projectPath\.git"
Write-Host "    .git del theme upstream removido"

# 3. Correr install.ps1 directo sobre la carpeta del proyecto
Write-Host ""
Write-Host "==> Instalando Amatora en el theme nuevo"
$installScript = Join-Path $amatoraRoot "scripts\install.ps1"
if (-not (Test-Path $installScript)) {
  throw "No encontré $installScript. ¿El clone de Amatora esta actualizado?"
}
Push-Location $projectPath
try {
  # Se carga como UTF-8 explícito: install.ps1 no lleva BOM (rompería el
  # one-liner con iwr) y PowerShell 5.1 lo leería como ANSI al ejecutarlo directo.
  $installBlock = [scriptblock]::Create([IO.File]::ReadAllText($installScript, [Text.Encoding]::UTF8))
  & $installBlock
} finally {
  Pop-Location
}

# 4. Abrir VS Code
Write-Host ""
Write-Host "==> Abriendo VS Code"
code $projectPath

Write-Host ""
Write-Host "==> LISTO"
Write-Host "    Proyecto:        $projectPath"
Write-Host "    Sistema Amatora: $amatoraRoot"
Write-Host ""
Write-Host "Amatora ya esta instalado. Pasos siguientes:"
Write-Host "  1. shopify theme dev (o tu workflow de subida)"
Write-Host "  2. Customizer -> 'Theme settings' -> panel 'Configuraciones Amatora' (colores, fuentes, botones, sliders, carrito)"
Write-Host "  3. Agregar 'Banner Amatora' a la home como smoke-test"
