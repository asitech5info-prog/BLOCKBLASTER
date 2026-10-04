@echo off
set GIT_EXE="C:\Users\Sohaib Irfan\.git-bin\cmd\git.exe"

if "%~1"=="" (
    echo [ERROR] Please provide your GitHub repository URL.
    echo Usage: push-to-github.bat https://github.com/YOUR_USERNAME/YOUR_REPO.git
    exit /b 1
)

echo Setting remote origin to %~1 ...
%GIT_EXE% remote remove origin >nul 2>&1
%GIT_EXE% remote add origin %~1
%GIT_EXE% branch -M main

echo Pushing main branch to GitHub...
%GIT_EXE% push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Code pushed successfully to GitHub!
    echo The GitHub Actions workflow is now automatically building your APK.
    echo Check the 'Actions' tab on your GitHub repository to download your APK!
) else (
    echo.
    echo [ERROR] Push failed. Make sure you are authenticated with GitHub or have configured your credentials/SSH key.
)
