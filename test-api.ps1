# PowerShell script to test the Feedback API
Write-Host "🧪 Testing Feedback API..." -ForegroundColor Green
Write-Host ""

# Test 1: Submit feedback
Write-Host "1. Testing feedback submission..." -ForegroundColor Yellow
$feedbackData = @{
    name = "John Doe"
    email = "john.doe@example.com"
    phoneNumber = "+1234567890"
    teachingSkills = 9
    realWorldExplanation = 8
    overallSatisfaction = 9
    realWorldTopics = $true
    futureTopics = @("JavaScript", "React", "Node.js")
    teachingPace = "PERFECT"
    additionalComments = "Great teaching style and very helpful examples!"
    sessionDuration = 1200
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/feedback" -Method POST -Body $feedbackData -ContentType "application/json"
    Write-Host "✅ Success!" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host ""

# Test 2: Get analytics
Write-Host "2. Testing analytics..." -ForegroundColor Yellow
try {
    $analytics = Invoke-RestMethod -Uri "http://localhost:3001/api/feedback" -Method GET -ContentType "application/json"
    Write-Host "✅ Success!" -ForegroundColor Green
    $analytics | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host ""

# Test 3: Validation error
Write-Host "3. Testing validation error..." -ForegroundColor Yellow
$invalidData = @{
    name = "A"
    teachingSkills = 15
} | ConvertTo-Json

try {
    $errorResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/feedback" -Method POST -Body $invalidData -ContentType "application/json"
    Write-Host "⚠️ Unexpected success (should have failed)" -ForegroundColor Yellow
    $errorResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "✅ Expected validation error!" -ForegroundColor Green
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    $errorDetails | ConvertTo-Json -Depth 3
}

Write-Host ""
Write-Host "🎉 Testing complete!" -ForegroundColor Green