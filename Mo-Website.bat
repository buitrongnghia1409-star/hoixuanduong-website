@echo off
REM Hồi Xuân Đường — mở website qua local server (BẮT BUỘC cho website-v2, vì trang này
REM dùng ES module cho engine 3D — Chrome sẽ CHẶN nếu mở trực tiếp bằng double-click file://)
cd /d "%~dp0"

where python >nul 2>nul
if %errorlevel%==0 (
  echo Dang khoi dong local server tai http://localhost:8000 ...
  start "" http://localhost:8000/
  python -m http.server 8000
  goto :eof
)

where py >nul 2>nul
if %errorlevel%==0 (
  echo Dang khoi dong local server tai http://localhost:8000 ...
  start "" http://localhost:8000/
  py -m http.server 8000
  goto :eof
)

echo Khong tim thay Python tren may nay.
echo Vui long cai Python (python.org) roi chay lai file nay,
echo hoac dung extension "Live Server" trong VS Code de mo website.
pause
