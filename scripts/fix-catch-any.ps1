# Script PowerShell per sostituire catch (e: any) con catch (e: unknown)
# Uso: .\scripts\fix-catch-any.ps1

$files = Get-ChildItem -Path "src/app/api" -Filter "*.ts" -Recurse

$count = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $original = $content
    
    # Pattern 1: catch (e: any) { console.error(..., e); return ... error: e?.message
    $content = $content -replace '} catch \(e: any\) \{(\s+)console\.error\(([^,]+), e\);(\s+)return NextResponse\.json\(\{ error: e\?\.message \|\| "([^"]+)" \}', '} catch (e: unknown) {$1const error = e as Error;$1console.error($2, error);$3return NextResponse.json({ error: error?.message || "$4" }'
    
    # Pattern 2: generico catch (e: any)
    $content = $content -replace '} catch \(e: any\)', '} catch (e: unknown)'
    
    # Pattern 3: catch (e) { (senza tipo, aggiunge _)
    $content = $content -replace '} catch \(e\) \{(\s+)// ', '} catch {$1// '
    
    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $count++
        Write-Host "Fixed: $($file.FullName)"
    }
}

Write-Host "`nTotal files fixed: $count"
