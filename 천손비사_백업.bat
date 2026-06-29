@echo off
cd /d D:\@공부방\천손비사
set DT=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set DT=%DT: =0%
set BACKUP=D:\@천손백업\%DT%
mkdir "%BACKUP%"
copy cheonson.html "%BACKUP%\"
copy gather.js "%BACKUP%\" 2>nul
copy tutorial.js "%BACKUP%\" 2>nul
copy tutorial.css "%BACKUP%\" 2>nul
echo 백업완료: %BACKUP%
pause