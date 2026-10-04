@echo off
set GIT_EXE="C:\Users\Sohaib Irfan\.git-bin\cmd\git.exe"
%GIT_EXE% add .
%GIT_EXE% commit -m "feat: complete Loading, Homepage, Adventure mode with 500 levels/5 trophies, candy textures, dynamic theme change and death highscore"
%GIT_EXE% status
%GIT_EXE% log -n 2 --oneline
