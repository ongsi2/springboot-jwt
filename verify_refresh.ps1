$base_url = "http://localhost:8081/api/auth"

# 1. Login
Write-Host "1. Logging in..."
$loginParams = @{
    username = "validuser1"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "$base_url/login" -Method Post -Body $loginParams -ContentType "application/json"
$accessToken = $response.accessToken
$refreshToken = $response.refreshToken

if (-not $refreshToken) {
    Write-Host "FAILED: No Refresh Token found." -ForegroundColor Red
    exit 1
}

Write-Host "   SUCCESS: Got Refresh Token: $refreshToken" -ForegroundColor Green

# 2. Refresh
Write-Host "`n2. Requesting new token..."
$refreshParams = @{
    refreshToken = $refreshToken
} | ConvertTo-Json

try {
    $refreshResponse = Invoke-RestMethod -Uri "$base_url/refresh" -Method Post -Body $refreshParams -ContentType "application/json"
    $newAccessToken = $refreshResponse.accessToken

    if ($newAccessToken) {
        Write-Host "   SUCCESS: Got New Access Token: $newAccessToken" -ForegroundColor Green
        Write-Host "`n[VERIFICATION PASSED]" -ForegroundColor Cyan
    } else {
        Write-Host "FAILED: No Access Token in refresh response." -ForegroundColor Red
    }
} catch {
    Write-Host "FAILED: Refresh Request Failed." -ForegroundColor Red
    Write-Host $_.Exception.Message
}
