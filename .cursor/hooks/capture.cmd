@echo off
setlocal
chcp 65001 >nul
set PYTHONUTF8=1
set PYTHONIOENCODING=utf-8
set "SCRIPT=%~dp0capture.py"
if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" (
  "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" "%SCRIPT%"
  exit /b %ERRORLEVEL%
)
py -3 "%SCRIPT%"
exit /b %ERRORLEVEL%
