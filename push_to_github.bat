@echo off
echo ===================================================
echo   PUSH VANGUARD PROMOTER TO GITHUB (TEAM 2)
echo ===================================================
set /p REPO_URL="Nhap URL Repository GitHub cua Team 2 (vanguard-promoter): "
if "%REPO_URL%"=="" goto error

git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%
git branch -M main
echo.
echo Dang push code len Github...
git push -u origin main
echo.
echo ===================================================
echo   PUSH THANH CONG!
echo ===================================================
pause
exit

:error
echo.
echo Loi: Ban chua nhap URL Repository!
pause
