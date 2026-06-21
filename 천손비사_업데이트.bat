@echo off
d:
cd /d "D:\@공부방\천손비사"

if not exist cheonson.html (
    echo [ERROR] cheonson.html not found in this folder.
    echo Current folder: %cd%
    pause
    exit /b 1
)

echo ====================================
echo  Cheonsonbisa GitHub Update
echo ====================================
echo.

echo [1/4] Copying cheonson.html to index.html...
copy /Y cheonson.html index.html >nul

echo [2/4] Staging changes...
git add .

set msg=
set /p msg="Enter commit message (press Enter for default): "
if "%msg%"=="" set msg=update %date% %time%

echo [3/4] Committing...
git commit -m "%msg%"

echo [4/4] Pushing to GitHub...
git push

echo.
echo ====================================
echo  Done!
echo  Check your site in 1-2 minutes at:
echo  https://kwseop0605-bit.github.io/cheonsonbisa/
echo ====================================
echo.
pause
