@echo off
title Leave Management System - Health Check
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\check-services.ps1"
echo.
pause
