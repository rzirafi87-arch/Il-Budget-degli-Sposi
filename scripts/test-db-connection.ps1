param(
  [string]$HostName = "db.vsguhivizuneylqhygfk.supabase.co",
  [int[]]$Ports = @(5432, 6543),
  [string]$User = "postgres",
  [string]$Database = "postgres",
  [string]$Password
)

Write-Host "== DNS resolution ==" -ForegroundColor Cyan
try {
  $ips = [System.Net.Dns]::GetHostAddresses($HostName)
  if (-not $ips -or $ips.Length -eq 0) {
    Write-Host "DNS failed for $HostName" -ForegroundColor Red
  } else {
    $ips | ForEach-Object { Write-Host "Resolved: $_" }
  }
} catch {
  Write-Host "DNS error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n== Port connectivity ==" -ForegroundColor Cyan
foreach ($p in $Ports) {
  try {
    $res = Test-NetConnection -ComputerName $HostName -Port $p -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    $ok = $res.TcpTestSucceeded
    Write-Host ("Port {0}: {1}" -f $p, ($(if ($ok) { 'open' } else { 'closed' }))) -ForegroundColor ($(if ($ok) { 'Green' } else { 'Yellow' }))
  } catch {
    Write-Host "Port $p test error: $($_.Exception.Message)" -ForegroundColor Yellow
  }
}

if ($Password) {
  Write-Host "`n== psql check (select now()) ==" -ForegroundColor Cyan
  $env:PGPASSWORD = $Password
  $env:PGSSLMODE = 'require'
  $psql = Get-Command psql -ErrorAction SilentlyContinue
  if (-not $psql) {
    Write-Host "psql not found in PATH. Install PostgreSQL client to run this step." -ForegroundColor Yellow
  } else {
    foreach ($p in $Ports) {
      Write-Host "Testing psql on port $p ..."
      try {
        psql -h $HostName -p $p -U $User -d $Database -c "select now();" 2>&1 | Write-Output
      } catch {
        Write-Host "psql error on port $p: $($_.Exception.Message)" -ForegroundColor Yellow
      }
    }
  }
}

Write-Host "`nDone." -ForegroundColor Cyan

