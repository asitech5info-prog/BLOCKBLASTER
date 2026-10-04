@echo off
set GIT_EXE="C:\Users\Sohaib Irfan\.git-bin\cmd\git.exe"
%GIT_EXE% add .
%GIT_EXE% commit -m "polish: enhance combo text styling and sync capacitor android bundle"
%GIT_EXE% log -n 2 --oneline
