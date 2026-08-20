@echo off
echo ===================================================
echo   🩸 BloodPulse EMERGENCY OPS - Starting Fullstack App
echo ===================================================
echo.
echo [1/2] Starting Backend Server on http://localhost:5000...
start cmd /k "cd backend && npm start"

timeout /t 2 >nul

echo [2/2] Starting Frontend on http://localhost:5173...
start cmd /k "cd frontend && npm run dev"

echo.
echo Application started!
echo Open your browser at: http://localhost:5173
echo ===================================================
