@echo off
set GIT_EXE="C:\Users\Sohaib Irfan\.git-bin\cmd\git.exe"
%GIT_EXE% init -b main
%GIT_EXE% config user.name "BlockBlaster Dev"
%GIT_EXE% config user.email "dev@blockblaster.app"
%GIT_EXE% add .
%GIT_EXE% commit -m "feat: complete Block Blaster mobile game with Capacitor, Playwright tests and APK workflow"
%GIT_EXE% status
%GIT_EXE% log -n 1 --oneline
