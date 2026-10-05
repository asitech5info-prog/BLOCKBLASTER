@echo off
title Block Blaster - Push to GitHub
color 0b
setlocal enabledelayedexpansion

set GIT_EXE="C:\Users\Sohaib Irfan\.git-bin\cmd\git.exe"
set REPO_URL=https://github.com/asitech5info-prog/BLOCKBLASTER.git

echo ======================================================================
echo             BLOCK BLASTER - PUSH REPOSITORY TO GITHUB
echo ======================================================================
echo.
echo Target Repository: https://github.com/asitech5info-prog/BLOCKBLASTER
echo.

if not "%~1"=="" (
    set "PAT_TOKEN=%~1"
    goto :push_with_pat
)

echo Select authentication method:
echo   [1] Web Browser Sign-in (Git Credential Manager - Recommended)
echo   [2] GitHub Personal Access Token (PAT)
echo.
set /p AUTH_CHOICE="Enter 1 or 2 (Default is 1): "

if "%AUTH_CHOICE%"=="2" goto :prompt_pat
goto :push_browser

:prompt_pat
echo.
echo You can generate a Personal Access Token at:
echo https://github.com/settings/tokens (classic token with 'repo' scope)
echo.
set /p PAT_TOKEN="Paste your GitHub Personal Access Token: "
if "%PAT_TOKEN%"=="" (
    echo [ERROR] No token entered.
    goto :end
)

:push_with_pat
echo.
echo [1/3] Configuring remote with token...
%GIT_EXE% remote remove origin >nul 2>&1
%GIT_EXE% remote add origin https://%PAT_TOKEN%@github.com/asitech5info-prog/BLOCKBLASTER.git
%GIT_EXE% branch -M main

echo [2/3] Pushing to GitHub...
%GIT_EXE% push -u origin main --force

set PUSH_STATUS=%ERRORLEVEL%
:: Clean remote url so token is not left stored in plaintext
%GIT_EXE% remote set-url origin %REPO_URL%

if %PUSH_STATUS% EQU 0 (
    goto :success
) else (
    goto :failed
)

:push_browser
echo.
echo [1/3] Setting remote origin to %REPO_URL% ...
%GIT_EXE% remote remove origin >nul 2>&1
%GIT_EXE% remote add origin %REPO_URL%
%GIT_EXE% branch -M main

echo [2/3] Pushing to GitHub (Browser Authorization)...
echo (A browser window or dialog may appear - please click Authorize)
%GIT_EXE% push -u origin main --force

if %ERRORLEVEL% EQU 0 (
    goto :success
) else (
    echo.
    echo [INFO] Browser push did not complete. Would you like to try with a Token?
    goto :prompt_pat
)

:success
echo.
echo ======================================================================
echo [SUCCESS] Block Blaster has been successfully pushed to GitHub!
echo ======================================================================
echo.
echo Repository: https://github.com/asitech5info-prog/BLOCKBLASTER
echo.
echo The GitHub Actions APK build workflow has automatically started:
echo   --^> https://github.com/asitech5info-prog/BLOCKBLASTER/actions
echo.
echo Once the workflow completes (approx. 2-3 mins), download your APK
echo from the "Artifacts" section of the completed run!
echo.
goto :end

:failed
echo.
echo ======================================================================
echo [ERROR] Push failed.
echo Please verify your GitHub login or token permissions for 'asitech5info-prog'.
echo ======================================================================
echo.

:end
pause
