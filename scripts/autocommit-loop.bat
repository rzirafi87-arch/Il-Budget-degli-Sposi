@echo off
REM Auto-commit and push every 10 minutes (Windows)
REM Stop with CTRL+C
:loop
  git add .
  git commit -m "auto: save %date% %time%" >nul 2>&1
  git push
  REM Wait 600 seconds (10 minutes)
  timeout /t 600 >nul
goto loop
