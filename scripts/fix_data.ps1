$ErrorActionPreference = "Stop"

Write-Host "Waiting for server to be ready at localhost:5000..."
$maxRetries = 60
$retryCount = 0
$serverReady = $false

while ($retryCount -lt $maxRetries) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/seed/agencies" -UseBasicParsing -TimeoutSec 2
        if ($response.StatusCode -eq 200) {
            $serverReady = $true
            break
        }
    }
    catch {
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
        $retryCount++
    }
}

if (-not $serverReady) {
    Write-Error "`nServer did not start within expected time."
    exit 1
}

Write-Host "`nServer is up! Running data fixes..."

try {
    Write-Host "1. Migrating Schema..."
    $res1 = Invoke-RestMethod -Uri "http://localhost:5000/api/seed/migrate-schema" -Method Post
    Write-Host "   Result: $($res1.message)"

    Write-Host "2. Seeding Agencies..."
    $res2 = Invoke-RestMethod -Uri "http://localhost:5000/api/seed/agencies" -Method Post
    Write-Host "   Result: $($res2.message)"

    Write-Host "3. Creating Agency Admins..."
    $res3 = Invoke-RestMethod -Uri "http://localhost:5000/api/seed/agency-admins" -Method Post
    Write-Host "   Result: $($res3.message)"

    Write-Host "4. Fixing Dummy Data Mappings..."
    $res4 = Invoke-RestMethod -Uri "http://localhost:5000/api/seed/fix-agency-mapping" -Method Post
    Write-Host "   Result: $($res4.message) (Count: $($res4.count))"

    Write-Host "All operations completed successfully."
}
catch {
    Write-Error "Failed to execute seed commands: $_"
}
