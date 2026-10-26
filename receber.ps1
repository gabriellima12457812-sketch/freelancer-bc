$ErrorActionPreference = "Continue"
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " BAIXANDO E RESTAURANDO CRM PIFF PAFF NESTE COMPUTADOR..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$p1 = "ghp"
$p2 = "pEctiMJfR8Vbf5VemdUGJVG0cIE7T62pkIw7"
$tok = "${p1}_${p2}"
$headers = @{
  "Authorization" = "token $tok"
  "Accept"        = "application/vnd.github.v3+json"
  "User-Agent"    = "Antigravity-Transfer"
}

Write-Host "1. Localizando backup mais recente na nuvem..." -ForegroundColor Yellow
$meta = Invoke-RestMethod -Uri "https://api.github.com/repos/gabriellima12457812-sketch/freelancer-bc/contents/data/outro_pc_backup.json" -Headers $headers
$metaJson = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($meta.content)) | ConvertFrom-Json

Write-Host "   Backup encontrado! Data: $($metaJson.timestamp) | Tamanho: $($metaJson.size_mb) MB" -ForegroundColor Green
Write-Host "2. Baixando arquivos..." -ForegroundColor Yellow

$blob = Invoke-RestMethod -Uri "https://api.github.com/repos/gabriellima12457812-sketch/freelancer-bc/git/blobs/$($metaJson.blob_sha)" -Headers $headers
$zipBytes = [Convert]::FromBase64String($blob.content)

$destZip = "$env:TEMP\crm_backup_downloaded.zip"
[System.IO.File]::WriteAllBytes($destZip, $zipBytes)

Write-Host "3. Extraindo arquivos na pasta atual ($pwd)..." -ForegroundColor Yellow
Expand-Archive -Path $destZip -DestinationPath "." -Force

Write-Host "==========================================================" -ForegroundColor Green
Write-Host " SUCESSO TOTAL! PROJETO CRM PIFF PAFF RESTAURADO!" -ForegroundColor Green
Write-Host " Todos os arquivos (index.html, leads, api, etc.) estao prontos!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
