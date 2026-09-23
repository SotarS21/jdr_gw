<#
  Déploiement LOCAL de Galactic Wars vers Foundry VTT (avant tout push GitHub).

  1. Recompile les compendiums (packs/_source -> packs/<nom> LevelDB).
  2. Arrête Foundry si besoin : les packs LevelDB sont verrouillés (fichier LOCK) tant que
     le monde tourne. Les écraser à chaud ne sert à rien, voire corrompt le pack.
  3. Copie en miroir (robocopy /MIR) uniquement ce que la release embarque : system.json,
     module/, lang/, styles/, templates/, asset_visuel/Ethnie/, packs/ (sans _source).
  4. Relance Foundry directement sur le monde de test et attend que le serveur annonce
     la bonne version du système.

  Usage : powershell -ExecutionPolicy Bypass -File scripts/deploy-local.ps1 [-Force] [-NoRestart]
    -Force      arrête Foundry même si des joueurs sont connectés (à ne faire qu'avec leur accord)
    -NoRestart  code/CSS uniquement, sans toucher aux packs : copie sans arrêter Foundry
                (un F5 suffit alors côté navigateur)
#>
param(
  [switch]$Force,
  [switch]$NoRestart,
  [string]$World = "galacit-wars-v-final"
)

$ErrorActionPreference = "Stop"
$Src = Split-Path -Parent $PSScriptRoot
$Dest = "D:\AppDataFoundry`$\FoundryVTT_Data\Data\systems\galactic-wars"
$Exe = "D:\FoundryVTT\Foundry Virtual Tabletop\Foundry Virtual Tabletop.exe"
$StatusUrl = "http://localhost:30000/api/status"

function Get-FoundryStatus {
  try { return Invoke-RestMethod -Uri $StatusUrl -TimeoutSec 3 } catch { return $null }
}

$Version = (Get-Content "$Src\system.json" -Raw | ConvertFrom-Json).version
Write-Host "== Galactic Wars v$Version -> $Dest"

# 1. Build des compendiums
if (-not $NoRestart) {
  Write-Host "== Build des compendiums"
  Push-Location $Src
  npm run pack:build | Out-Null
  $buildCode = $LASTEXITCODE
  Pop-Location
  if ($buildCode -ne 0) { throw "npm run pack:build a échoué (code $buildCode)" }
}

# 2. Arrêt de Foundry
$status = Get-FoundryStatus
if (-not $NoRestart -and (Get-Process -Name "Foundry Virtual Tabletop" -ErrorAction SilentlyContinue)) {
  if ($status -and $status.active -and $status.users -gt 0 -and -not $Force) {
    Write-Host "STOP: monde '$($status.world)' actif avec $($status.users) utilisateur(s) connecté(s)."
    Write-Host "      Relancer avec -Force une fois l'accord obtenu (l'arrêt les déconnecte)."
    exit 2
  }
  Write-Host "== Arrêt de Foundry"
  Stop-Process -Name "Foundry Virtual Tabletop" -Force
  $deadline = (Get-Date).AddSeconds(30)
  while ((Get-Process -Name "Foundry Virtual Tabletop" -ErrorAction SilentlyContinue) -and (Get-Date) -lt $deadline) {
    Start-Sleep -Milliseconds 500
  }
  Start-Sleep -Seconds 2  # libération des verrous LevelDB
  # Foundry verrouille son dossier de données avec Config/options.json.lock (un dossier dont la
  # date est rafraîchie en continu). Tué de force, il le laisse derrière lui : une relance
  # immédiate échoue alors avec "directory which is already locked by another process".
  # Le verrou n'est considéré comme abandonné que lorsqu'il n'a plus été rafraîchi depuis ~10 s.
  $lock = "D:\AppDataFoundry`$\FoundryVTT_Data\Config\options.json.lock"
  $deadline = (Get-Date).AddSeconds(60)
  while ((Test-Path $lock) -and ((Get-Date) - (Get-Item $lock).LastWriteTime).TotalSeconds -lt 15 -and (Get-Date) -lt $deadline) {
    Start-Sleep -Seconds 1
  }
}

# 3. Copie en miroir
Write-Host "== Copie"
function Mirror($rel, $extra = @()) {
  $rcArgs = @("$Src\$rel", "$Dest\$rel", "/MIR", "/NFL", "/NDL", "/NJH", "/NJS", "/NP", "/R:2", "/W:1") + $extra
  & robocopy @rcArgs | Out-Null
  if ($LASTEXITCODE -ge 8) { throw "robocopy a échoué sur $rel (code $LASTEXITCODE)" }
}
Copy-Item "$Src\system.json" "$Dest\system.json" -Force
if ($NoRestart) {
  foreach ($d in "module", "lang", "styles", "templates") { Mirror $d }
} else {
  foreach ($d in "module", "lang", "styles", "templates", "asset_visuel\Ethnie") { Mirror $d }
  Mirror "packs" @("/XD", "_source")
}
$global:LASTEXITCODE = 0
Write-Host "   $((Get-ChildItem $Dest -Recurse -File -Exclude *.ldb,*.log | Measure-Object).Count) fichiers dans la destination"

if ($NoRestart) {
  Write-Host "OK: copie faite sans redémarrage — F5 dans le navigateur."
  exit 0
}

# 4. Relance sur le monde de test
Write-Host "== Relance de Foundry sur le monde '$World'"
Start-Process -FilePath $Exe -ArgumentList "--world=$World"
$deadline = (Get-Date).AddSeconds(120)
do {
  Start-Sleep -Seconds 2
  $status = Get-FoundryStatus
} while (-not ($status -and $status.active -and $status.world -eq $World) -and (Get-Date) -lt $deadline)

if (-not ($status -and $status.active -and $status.world -eq $World)) {
  Write-Host "ECHEC: le monde '$World' n'est pas actif après 120 s (statut : $($status | ConvertTo-Json -Compress))"
  exit 1
}
if ($status.systemVersion -ne $Version) {
  Write-Host "ECHEC: Foundry annonce galactic-wars v$($status.systemVersion), attendu v$Version"
  exit 1
}
Write-Host "OK: monde '$World' actif, galactic-wars v$($status.systemVersion)"
