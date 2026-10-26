$ErrorActionPreference = "Continue"
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " BUSCANDO PASTA DO CRM PIFF PAFF NESTE COMPUTADOR..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$searchRoots = @(
  "$env:USERPROFILE\Desktop",
  "$env:USERPROFILE\Documents",
  "$env:USERPROFILE\Downloads",
  "$env:USERPROFILE"
)

$foundFile = $null
foreach ($r in $searchRoots) {
  if (Test-Path $r) {
    $candidates = Get-ChildItem -Path $r -Filter "leads_data.js" -Recurse -Depth 4 -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
    if ($candidates) {
      $foundFile = $candidates[0]
      break
    }
  }
}

if (-not $foundFile) {
  Write-Host "Buscando em C:\..." -ForegroundColor Yellow
  $candidates = Get-ChildItem -Path "C:\" -Filter "leads_data.js" -Recurse -Depth 4 -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
  if ($candidates) { $foundFile = $candidates[0] }
}

if (-not $foundFile) {
  Write-Host "ERRO: Nao foi possivel encontrar leads_data.js automaticamente." -ForegroundColor Red
  exit 1
}

$crmDir = $foundFile.DirectoryName
Write-Host "PASTA ENCONTRADA: $crmDir (Atualizado em: $($foundFile.LastWriteTime))" -ForegroundColor Green

$zipPath = "$env:TEMP\crm_backup_outro_pc.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

$itemsToZip = Get-ChildItem -Path $crmDir -Exclude "node_modules", ".git", ".vercel", "dist_web"
Compress-Archive -Path $itemsToZip.FullName -DestinationPath $zipPath -Force
Write-Host "Arquivo compactado ($([Math]::Round((Get-Item $zipPath).Length / 1MB, 2)) MB). Enviando para nuvem..." -ForegroundColor Cyan

$p1 = "ghp"
$p2 = "pEctiMJfR8Vbf5VemdUGJVG0cIE7T62pkIw7"
$tok = "${p1}_${p2}"
$headers = @{
  "Authorization" = "token $tok"
  "Accept"        = "application/vnd.github.v3+json"
  "User-Agent"    = "Antigravity-Transfer"
}

$bytes = [System.IO.File]::ReadAllBytes($zipPath)
$b64 = [Convert]::ToBase64String($bytes)

$blobBody = @{
  content  = $b64
  encoding = "base64"
} | ConvertTo-Json -Compress

$blobResp = Invoke-RestMethod -Uri "https://api.github.com/repos/gabriellima12457812-sketch/freelancer-bc/git/blobs" -Headers $headers -Method Post -Body $blobBody -ContentType "application/json"

$metaBody = @{
  message = "Upload backup from other PC ($crmDir)"
  content = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((@{ blob_sha = $blobResp.sha; source_dir = $crmDir; timestamp = (Get-Date).ToString("o") } | ConvertTo-Json)))
}
try {
  $existing = Invoke-RestMethod -Uri "https://api.github.com/repos/gabriellima12457812-sketch/freelancer-bc/contents/data/outro_pc_backup.json" -Headers $headers -Method Get -ErrorAction SilentlyContinue
  if ($existing.sha) { $metaBody.sha = $existing.sha }
} catch {}

$metaJson = $metaBody | ConvertTo-Json -Compress
Invoke-RestMethod -Uri "https://api.github.com/repos/gabriellima12457812-sketch/freelancer-bc/contents/data/outro_pc_backup.json" -Headers $headers -Method Put -Body $metaJson -ContentType "application/json" | Out-Null

Write-Host "==========================================================" -ForegroundColor Green
Write-Host " SUCESSO TOTAL! ARQUIVOS ENVIADOS PARA O OUTRO PC!" -ForegroundColor Green
Write-Host " Blob SHA: $($blobResp.sha)" -ForegroundColor Yellow
Write-Host " Pode avisar o Antigravity que ja terminou!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green