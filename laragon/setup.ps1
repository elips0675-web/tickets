$ErrorActionPreference = "Continue"
$PROJECT_SRC = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$LARAGON_ROOT = "C:\laragon"
$WWW_DIR = "$LARAGON_ROOT\www\Tickets"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Service Desk - Ustanovka na Laragon"  -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# --- Shag 1: Symlink ---
Write-Host "[1/8] Sozdanie svyazi cherez junction..." -ForegroundColor Yellow
if (Test-Path $WWW_DIR) {
    # Proverka chto eto nasha svyaz
    $linkTarget = (Get-Item $WWW_DIR).Target
    if ($linkTarget -eq $PROJECT_SRC) {
        Write-Host "  Symlink uzhe sushestvuet." -ForegroundColor Gray
    } else {
        Remove-Item $WWW_DIR -Force -Recurse -ErrorAction SilentlyContinue
        cmd /c "mklink /J `"$WWW_DIR`" `"$PROJECT_SRC`"" 2>&1 | Out-Null
        Write-Host "  Symlink sozdan: $WWW_DIR -> $PROJECT_SRC" -ForegroundColor Green
    }
} else {
    cmd /c "mklink /J `"$WWW_DIR`" `"$PROJECT_SRC`"" 2>&1 | Out-Null
    Write-Host "  Symlink sozdan: $WWW_DIR -> $PROJECT_SRC" -ForegroundColor Green
}

# --- Shag 2: Proverka MySQL ---
Write-Host "[2/8] Proverka MySQL..." -ForegroundColor Yellow
$mysql = Get-ChildItem "$LARAGON_ROOT\bin\mysql" -Recurse -Filter "mysql.exe" | Select-Object -First 1 -ExpandProperty FullName
if (-not $mysql) {
    Write-Host "  MySQL ne naiden." -ForegroundColor Red
} else {
    Write-Host "  MySQL naiden: $mysql" -ForegroundColor Green
}

# --- Shag 3: Import BD ---
Write-Host "[3/8] Import bazy dannyh..." -ForegroundColor Yellow
if ($mysql) {
    $sqlFile = "$PROJECT_SRC\server\seed.sql"
    $result = cmd /c "`"$mysql`" -u root -e """" 2>&1"
    if ($LASTEXITCODE -eq 0) {
        cmd /c "`"$mysql`" -u root < `"$sqlFile`"" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  BD 'servicedesk' importirovana." -ForegroundColor Green
        } else {
            Write-Host "  BD uzhe sushestvuet ili oshibka." -ForegroundColor Yellow
        }
    } else {
        Write-Host "  [!] MySQL ne zapushen. Zapustite Laragon > Start All." -ForegroundColor Red
        Write-Host "  Potom vypolnite vruchnuyu:" -ForegroundColor Gray
        Write-Host "    `"$mysql`" -u root < `"$sqlFile`"" -ForegroundColor Gray
    }
}

# --- Shag 4: .env ---
Write-Host "[4/8] Nastroika .env..." -ForegroundColor Yellow
$envFile = "$PROJECT_SRC\server\.env"
if (-not (Test-Path $envFile)) {
    Copy-Item "$PROJECT_SRC\server\.env.example" $envFile
    Write-Host "  server\.env sozdan." -ForegroundColor Green
} else {
    Write-Host "  server\.env uzhe est." -ForegroundColor Gray
}

# --- Shag 5: npm install ---
Write-Host "[5/8] Ustanovka zavisimostei..." -ForegroundColor Yellow
Push-Location $PROJECT_SRC
npm install --silent 2>$null
if ($LASTEXITCODE -eq 0) { Write-Host "  Frontend OK." -ForegroundColor Green }
Pop-Location

Push-Location "$PROJECT_SRC\server"
npm install --silent 2>$null
if ($LASTEXITCODE -eq 0) { Write-Host "  Backend OK." -ForegroundColor Green }
Pop-Location

# --- Shag 6: Nginx vhost ---
Write-Host "[6/8] Nginx vhost..." -ForegroundColor Yellow
$nginxDir = "$LARAGON_ROOT\etc\nginx\sites-enabled"
if (Test-Path $nginxDir) {
    $nginxConf = "$nginxDir\servicedesk.conf"
    Copy-Item "$PROJECT_SRC\laragon\nginx\servicedesk.conf" $nginxConf -Force
    Write-Host "  Konfig skopirovan: tickets.test" -ForegroundColor Green
    Write-Host "  [Vazhno] Laragon > Menu > Nginx > Restart Nginx" -ForegroundColor Yellow
}

# --- Shag 7: hosts ---
Write-Host "[7/8] Hosts..." -ForegroundColor Yellow
$hostsFile = "$env:SystemRoot\System32\drivers\etc\hosts"
$hostEntry = "127.0.0.1 tickets.test"
try {
    $hosts = Get-Content $hostsFile -Raw
    if ($hosts -notmatch [regex]::Escape($hostEntry)) {
        $newHosts = $hosts.TrimEnd() + "`r`n" + $hostEntry + "`r`n"
        Set-Content $hostsFile $newHosts -Force
        Write-Host "  tickets.test dobavlen v hosts." -ForegroundColor Green
    } else {
        Write-Host "  tickets.test uzhe v hosts." -ForegroundColor Gray
    }
} catch {
    Write-Host "  Ne udalos izmenit hosts (zapustite ot administratora)." -ForegroundColor Yellow
    Write-Host "  Dobavte vruchnuyu: 127.0.0.1 tickets.test" -ForegroundColor Gray
}

# --- Shag 8: Itog ---
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Ustanovka zavershena!"                  -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Chto delat dalshe:"                      -ForegroundColor White
Write-Host "  1. Laragon > Menu > Nginx > Restart Nginx"
Write-Host "  2. Zapustite: $PROJECT_SRC\zapustit-vse.bat"
Write-Host ""
Write-Host "  Frontend: http://tickets.test"
Write-Host "  API:      http://localhost:4000"
Write-Host "========================================" -ForegroundColor Cyan
