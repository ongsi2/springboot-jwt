$base_url = "http://localhost:8081/api/auth"

# 1. Login
Write-Host "1. Logging in..." -NoNewline
$loginParams = @{ username = "validuser1"; password = "password123" } | ConvertTo-Json
try {
    $loginRes = Invoke-RestMethod -Uri "$base_url/login" -Method Post -Body $loginParams -ContentType "application/json"
    $token = $loginRes.accessToken
    Write-Host " [OK]" -ForegroundColor Green
} catch {
    Write-Host " [FAILED]" -ForegroundColor Red; exit 1
}

# 2. Check Access (Before Logout)
Write-Host "2. Access protected resource..." -NoNewline
try {
    $headers = @{ Authorization = "Bearer $token" }
    Invoke-RestMethod -Uri "$base_url/me" -Method Get -Headers $headers | Out-Null
    Write-Host " [OK]" -ForegroundColor Green
} catch {
    Write-Host " [FAILED] (Should succeed)" -ForegroundColor Red; exit 1
}

# 3. Logout
Write-Host "3. Logging out..." -NoNewline
try {
    Invoke-RestMethod -Uri "$base_url/logout" -Method Post -Headers $headers | Out-Null
    Write-Host " [OK]" -ForegroundColor Green
} catch {
    Write-Host " [FAILED]" -ForegroundColor Red; exit 1
}

# 4. Check Access (After Logout) - Should Fail
Write-Host "4. Access resource with blacklisted token..." -NoNewline
try {
    Invoke-RestMethod -Uri "$base_url/me" -Method Get -Headers $headers | Out-Null
    Write-Host " [FAILED] (Should fail with 401)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::Unauthorized) {
        Write-Host " [SUCCESS] 401 Unauthorized as expected." -ForegroundColor Cyan
    } else {
        Write-Host " [FAILED] Unexpected status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}
