@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 一键更新大福玩具房
echo ========================================
echo.

cd /d C:\Users\51647\Documents\trae_projects\dafu-toy-room

echo 📤 正在推送到 GitHub...
git add .
git commit -m "auto-update: %date% %time%"
git push origin master
if errorlevel 1 (
    echo.
    echo ❌ 推送到 GitHub 失败！
    echo 💡 请检查网络连接，或稍后重试
    pause
    exit /b 1
)
echo ✅ 推送成功！
echo.

echo 📥 正在连接 VPS 并更新...
ssh root@194.41.36.137 "cd /root/dafu-toy-room && git pull origin master && pm2 restart dafu-toy-room"
if errorlevel 1 (
    echo.
    echo ❌ VPS 更新失败！
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ 全部完成！网站已更新
echo 🌐 访问: https://fufud.cc
echo ========================================
pause
