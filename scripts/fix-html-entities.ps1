# Script PowerShell per escape HTML entities in JSX
# Uso: .\scripts\fix-html-entities.ps1

$files = Get-ChildItem -Path "src" -Filter "*.tsx" -Recurse

$count = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Encoding UTF8 | Out-String
    $original = $content
    
    # Sostituisci apostrofi isolati (non già escaped)
    $content = $content -replace "(?<!&)(?<!\\)'(?!s\b)(?![a-z])", "&apos;"
    
    # Sostituisci virgolette doppie isolate in testo (non attributi)
    $content = $content -replace '(?<=>)([^<]*)"([^"<>]*)"([^<]*(?=<))', '$1&quot;$2&quot;$3'
    
    if ($content -ne $original) {
        $content | Set-Content -Path $file.FullName -Encoding UTF8 -NoNewline
        $count++
        Write-Host "Fixed: $($file.FullName)"
    }
}

Write-Host "`nTotal files fixed: $count"
