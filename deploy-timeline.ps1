# Deploy Timeline Fixes - Script PowerShell
# Apre i file SQL in ordine per deployment

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "DEPLOY TIMELINE FIXES" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$files = @(
    "supabase-timeline-schema-update.sql",
    "supabase-engagement-party-seed.sql",
    "supabase-genderreveal-event-seed.sql",
    "supabase-pensione-seed.sql"
)

Write-Host "File da deployare:" -ForegroundColor Green
for ($i = 0; $i -lt $files.Length; $i++) {
    Write-Host "  $($i + 1). $($files[$i])" -ForegroundColor White
}
Write-Host ""

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "[OK] Apertura: $file" -ForegroundColor Green
        code $file
        Start-Sleep -Milliseconds 500
    } else {
        Write-Host "[ERROR] File non trovato: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "File aperti in VS Code!" -ForegroundColor Green
Write-Host ""
Write-Host "PROSSIMI PASSI:" -ForegroundColor Cyan
Write-Host "1. Apri Supabase Dashboard SQL Editor" -ForegroundColor White
Write-Host "2. Copia/incolla ogni file nell'ordine mostrato" -ForegroundColor White
Write-Host "3. Esegui con RUN (Ctrl+Enter)" -ForegroundColor White
Write-Host ""
Write-Host "Guida completa: DEPLOY-TIMELINE-GUIDE.md" -ForegroundColor Magenta
Write-Host ""
