$base_url = "http://localhost:8081/api/auth"
$admin_url = "http://localhost:8081/api/admin"

# 1. Login as Admin
Write-Host "1. Admin Login..." -NoNewline
$loginParams = @{ username = "admin"; password = "admin123" } | ConvertTo-Json
try {
    $loginRes = Invoke-RestMethod -Uri "$base_url/login" -Method Post -Body $loginParams -ContentType "application/json"
    $token = $loginRes.accessToken
    Write-Host " [OK] Token: $($token.Substring(0, 10))..." -ForegroundColor Green
} catch {
    Write-Host " [FAILED] Admin login failed." -ForegroundColor Red; exit 1
}

# 2. Get User List (Admin Only)
Write-Host "2. Fetching User List..." -NoNewline
try {
    $headers = @{ Authorization = "Bearer $token" }
    $users = Invoke-RestMethod -Uri "$admin_url/users" -Method Get -Headers $headers
    
    if ($users.Count -ge 1) {
        Write-Host " [OK] Retrieved $($users.Count) users." -ForegroundColor Green
    } else {
        Write-Host " [FAILED] User list empty or invalid." -ForegroundColor Red; exit 1
    }
} catch {
    Write-Host " [FAILED] Access denied or error." -ForegroundColor Red; Write-Host $_; exit 1
}

# 3. Verify Regular User Restriction
Write-Host "3. Testing Regular User Access denial..." -NoNewline
# Login as regular user
$userParams = @{ username = "validuser1"; password = "password123" } | ConvertTo-Json
try {
    $userRes = Invoke-RestMethod -Uri "$base_url/login" -Method Post -Body $userParams -ContentType "application/json"
    $userToken = $userRes.accessToken
    
    $userHeaders = @{ Authorization = "Bearer $userToken" }
    Invoke-RestMethod -Uri "$admin_url/users" -Method Get -Headers $userHeaders | Out-Null
    Write-Host " [FAILED] Regular user could access admin API!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::Forbidden) {
        Write-Host " [OK] 403 Forbidden as expected." -ForegroundColor Cyan
    } else {
        Write-Host " [FAILED] Unexpected status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}
