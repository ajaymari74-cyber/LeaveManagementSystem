@echo off
title Leave Management System - Launcher
echo ==========================================================
echo       Starting Leave Management System Services...
echo ==========================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-all.ps1"
pause
