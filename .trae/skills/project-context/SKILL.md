---
name: "project-context"
description: "提供大福玩具房项目的完整上下文信息。Invoke when starting a new task or when user asks about project status/structure."
---

# 大福玩具房 (dafu-toy-room) 项目上下文

## 📋 项目基本信息

- **项目名称**: 大福玩具房 (dafu-toy-room)
- **部署地址**: https://fufud.cc
- **VPS配置**: 1核1G（已添加限流保护，最大30并发）
- **版本**: 2.1.0
- **作者**: 一只大福🎉

## 🏗️ 项目结构

```
dafu-toy-room/
├── index.html          # 主页面（大门+主应用）
├── rate-limit.html     # 限流页面（30人上限时显示）
├── css/
│   └── style.css       # 全局样式（含主题变量）
├── js/
│   ├── main.js         # 主应用逻辑（加载动画、鼠标特效、动态背景）
│   └── gate.js         # 大门页面控制
├── modules/            # 功能模块
│   ├── guessNumber.js  # 猜数字
│   ├── whatToEat.js    # 今天吃什么
│   ├── fortune.js      # 运势占卜
│   ├── blessing.js     # 今日份福气
│   ├── aiChat.js       # AI聊天（DeepSeek API）
│   ├── whackAMole.js   # 打地鼠
│   ├── luckyWheel.js   # 幸运转盘
│   ├── passwordGen.js  # 密码生成
│   ├── moodDiary.js    # 心情日记
│   ├── statistics.js   # 统计模块
│   └── easterEgg.js    # 彩蛋模块
├── images/
│   └── sylveon.png     # 仙子伊布装饰图
├── server.js           # Node.js服务器（含限流逻辑）
└── update-dafu-auto.bat # 部署脚本
```

## ✨ 已实现功能清单

### 核心功能（8个游戏/工具）
1. 🎲 猜数字 - 1-100猜数字游戏
2. 🍜 今天吃什么 - 随机食物推荐（带仙子伊布装饰）
3. 🔮 运势占卜 - 今日运势
4. 🧧 今日份福气 - 随机福气签
5. 🤖 AI聊天 - DeepSeek API 对话
6. 🔨 打地鼠 - 手速挑战游戏
7. 🎡 幸运转盘 - 自定义选项转盘
8. 🔐 密码生成 - 安全密码生成器
9. 📔 心情日记 - 记录每日心情

### 装修功能
1. **加载动画** - 顶部横幅，丝带弹跳+蓄力跳出效果
2. **鼠标特效** - 移动轨迹（爱心/星星）+ 点击爆炸效果
3. **动态背景** - 彩虹渐变 + 飘动的云/星星
4. **3D卡片** - 悬停3D翻转效果
5. **主题切换** - 左下角🎨按钮，支持粉色/蓝色/暗色三种主题
6. **彩蛋** - 大门底部🎉按钮，连点5次触发烟花秀

### 系统功能
1. **限流保护** - 30并发上限，超限显示排队页面
2. **访问统计** - 今日/总访客数统计
3. **版本信息** - 页脚显示版本和作者信息

## 🎨 主题系统

CSS变量定义在 `:root`，三种主题：
- `pink` (默认) - 粉色系 #ff6b9d
- `blue` - 蓝色系 #4a90e2  
- `dark` - 暗色系 #bb86fc

切换方式：`document.documentElement.setAttribute('data-theme', 'blue')`

## 🔧 关键技术点

### 仙子伊布装饰
- 位于"今天吃什么"卡片右上角
- CSS类: `.sylveon-decoration`
- 点击卡片时有弹跳动画

### 限流系统
- `CONFIG.maxConcurrentUsers = 30`
- `ConnectionManager` 管理连接
- 超限时返回 `rate-limit.html` (503状态码)

### 彩蛋烟花
- 连点5次🎉按钮触发
- 表情符号: 🎉🎊✨💫🌟💖🎀🎆🎇
- 粒子飞散动画

## 📝 最近修改记录

1. ✅ 修复仙子伊布显示问题（改为独立div元素）
2. ✅ 添加主题切换系统（粉/蓝/暗三色）
3. ✅ 添加彩蛋功能（5连点触发烟花）
4. ✅ 添加限流保护（30并发上限）

## 🚀 部署命令

```bash
# Windows
update-dafu-auto.bat

# 手动部署
cd /root/dafu-toy-room
git pull
pm2 restart dafu-toy-room
```

## ⚠️ 注意事项

1. VPS只有1G内存，已设置30并发限流
2. AI聊天使用 DeepSeek API，需要配置 API Key
3. 主题偏好保存在 localStorage
4. 统计数据保存在 localStorage（每日归零）
