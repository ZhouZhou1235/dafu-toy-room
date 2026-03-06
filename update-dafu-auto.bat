@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 一键更新大福玩具房
echo ========================================
echo.

cd /d C:\Users\51647\Documents\trae_projects\dafu-toy-room

echo 📤 正在推送到 GitHub...

REM 尝试推送，最多重试3次
set RETRY_COUNT=0
:RETRY_PUSH
git push origin master
if errorlevel 1 (
    set /a RETRY_COUNT+=1
    if %RETRY_COUNT% lss 3 (
        echo ⚠️  推送失败，%RETRY_COUNT%秒后重试... (%RETRY_COUNT%/3)
        timeout /t %RETRY_COUNT% /nobreak >nul
        goto RETRY_PUSH
    ) else (
        echo ❌ 推送到 GitHub 失败！已重试3次
        echo 💡 可能原因：网络问题、GitHub 连接超时
        echo 🔄 请稍后再试，或手动运行：git push origin master
        pause
        exit /b 1
    )
)
echo ✅ 推送成功！
echo.

echo 📥 正在连接 VPS 并更新...
ssh root@194.41.36.137 "/root/update-dafu.sh"
if errorlevel 1 (
    echo ❌ VPS 更新失败！
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ 全部完成！
echo 🌐 访问: https://fufud.cc
echo ========================================
pause
