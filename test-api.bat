@echo off
echo Testing Feedback API...
echo.

echo 1. Testing simple feedback submission...
curl -X POST http://localhost:3001/api/feedback ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"phoneNumber\":\"1234567890\",\"teachingSkills\":8,\"realWorldExplanation\":7,\"overallSatisfaction\":8,\"realWorldTopics\":true,\"futureTopics\":[\"Testing\"],\"teachingPace\":\"PERFECT\",\"additionalComments\":\"Test from batch file\"}"

echo.
echo.

echo 2. Testing feedback analytics...
curl -X GET http://localhost:3001/api/feedback -H "Content-Type: application/json"

echo.
echo.

echo 3. Testing validation error...
curl -X POST http://localhost:3001/api/feedback ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"A\"}"

echo.
echo Done!
pause