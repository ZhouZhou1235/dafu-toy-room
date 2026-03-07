/**
 * 大福的玩具房 - 主入口文件
 * 积木式架构 - 负责初始化和协调各模块
 */

// 全局配置
const CONFIG = {
    heartsCount: 15,
    heartEmojis: ['💕', '💖', '💗', '💓', '💝', '❤️', '🧡', '💛', '💚', '💙', '💜'],
    animationDuration: {
        min: 8,
        max: 15
    }
};

// 爱心背景管理器
const HeartsManager = {
    container: null,
    
    init() {
        this.container = document.getElementById('heartsContainer');
        if (!this.container) return;
        
        this.createHearts();
        // 定期补充爱心
        setInterval(() => this.addHeart(), 2000);
    },
    
    createHearts() {
        for (let i = 0; i < CONFIG.heartsCount; i++) {
            setTimeout(() => this.addHeart(), i * 300);
        }
    },
    
    addHeart() {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.textContent = this.getRandomHeart();
        
        const left = Math.random() * 100;
        const duration = CONFIG.animationDuration.min + 
            Math.random() * (CONFIG.animationDuration.max - CONFIG.animationDuration.min);
        const delay = Math.random() * 5;
        const size = 15 + Math.random() * 20;
        
        heart.style.left = `${left}%`;
        heart.style.animationDuration = `${duration}s`;
        heart.style.animationDelay = `${delay}s`;
        heart.style.fontSize = `${size}px`;
        
        this.container.appendChild(heart);
        
        // 动画结束后移除
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, (duration + delay) * 1000);
    },
    
    getRandomHeart() {
        return CONFIG.heartEmojis[Math.floor(Math.random() * CONFIG.heartEmojis.length)];
    }
};

// 工具函数
const Utils = {
    // 随机整数
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // 随机数组元素
    randomChoice(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },
    
    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // 添加动画类
    animate(element, animationClass, duration = 500) {
        element.classList.add(animationClass);
        setTimeout(() => {
            element.classList.remove(animationClass);
        }, duration);
    },
    
    // 显示结果
    showResult(element, message, type = 'normal') {
        element.innerHTML = message;
        element.className = 'result-area';
        if (type === 'success') element.classList.add('result-success');
        if (type === 'error') element.classList.add('result-error');
        if (type === 'hint') element.classList.add('result-hint');
        Utils.animate(element, 'pulse', 500);
    }
};

// 模块注册器 - 积木式架构核心
const ModuleRegistry = {
    modules: new Map(),
    
    register(name, initFn) {
        this.modules.set(name, initFn);
    },
    
    unregister(name) {
        this.modules.delete(name);
    },
    
    initAll() {
        this.modules.forEach((initFn, name) => {
            try {
                initFn();
            } catch (error) {
                console.error(`模块 ${name} 初始化失败:`, error);
            }
        });
    }
};

// 加载动画管理器
const LoadingManager = {
    banner: null,
    progressBar: null,
    tipsElement: null,
    progress: 0,
    tipIndex: 0,
    tipInterval: null,
    progressInterval: null,
    
    // 装修提示列表
    tips: [
        { emoji: '🏗️', text: '大福正在搬积木...' },
        { emoji: '🎨', text: '给墙壁刷上粉色油漆...' },
        { emoji: '🧹', text: '打扫玩具房的每个角落...' },
        { emoji: '🎀', text: '系上可爱的蝴蝶结...' },
        { emoji: '🪄', text: '施展魔法布置家具...' },
        { emoji: '🌸', text: '摆放新鲜的花朵...' },
        { emoji: '✨', text: '撒上闪闪发光的星星...' },
        { emoji: '🎮', text: '调试各种游戏设备...' },
        { emoji: '🐱', text: '召唤小猫咪来帮忙...' },
        { emoji: '🍰', text: '准备美味的下午茶...' },
        { emoji: '💡', text: '点亮温暖的灯光...' },
        { emoji: '🎵', text: '播放轻快的音乐...' },
        { emoji: '🪞', text: '擦拭镜子让它闪闪发亮...' },
        { emoji: '🧸', text: '把毛绒玩具排排坐...' },
        { emoji: '🎪', text: '搭建马戏团帐篷...' },
        { emoji: '🌈', text: '挂上彩虹色的窗帘...' },
        { emoji: '🔮', text: '给水晶球充能...' },
        { emoji: '📚', text: '整理书架上的故事书...' },
        { emoji: '🎈', text: '吹起五颜六色的气球...' },
        { emoji: '💝', text: '把爱心贴满整个房间...' }
    ],
    
    init() {
        this.banner = document.getElementById('loadingBanner');
        this.progressBar = document.getElementById('loadingProgressBar');
        this.tipsElement = document.getElementById('loadingTips');
        
        if (!this.banner) return;
        
        // 开始进度条动画
        this.startProgress();
        // 开始提示轮换
        this.startTipsRotation();
        
        // 2.5秒后完成加载
        setTimeout(() => {
            this.complete();
        }, 2500);
    },
    
    startProgress() {
        // 进度条动画 - 不均匀增长，模拟真实加载
        const updateProgress = () => {
            if (this.progress >= 100) {
                clearInterval(this.progressInterval);
                return;
            }
            
            // 随机增加进度，前快后慢
            let increment;
            if (this.progress < 30) {
                increment = Math.random() * 8 + 3; // 3-11%
            } else if (this.progress < 60) {
                increment = Math.random() * 5 + 2; // 2-7%
            } else if (this.progress < 85) {
                increment = Math.random() * 3 + 1; // 1-4%
            } else {
                increment = Math.random() * 2 + 0.5; // 0.5-2.5%
            }
            
            this.progress = Math.min(100, this.progress + increment);
            
            if (this.progressBar) {
                this.progressBar.style.width = this.progress + '%';
            }
        };
        
        // 每80ms更新一次进度
        this.progressInterval = setInterval(updateProgress, 80);
    },
    
    startTipsRotation() {
        // 打乱提示顺序
        this.shuffleTips();
        
        // 立即显示第一条
        this.updateTip();
        
        // 每150ms轮换一次提示，快速变换效果
        this.tipInterval = setInterval(() => {
            this.tipIndex = (this.tipIndex + 1) % this.tips.length;
            this.updateTip();
        }, 150);
        
        // 加载完成前逐渐减慢速度
        setTimeout(() => {
            clearInterval(this.tipInterval);
            this.tipInterval = setInterval(() => {
                this.tipIndex = (this.tipIndex + 1) % this.tips.length;
                this.updateTip();
            }, 300);
        }, 1500);
    },
    
    shuffleTips() {
        // Fisher-Yates 洗牌算法
        for (let i = this.tips.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.tips[i], this.tips[j]] = [this.tips[j], this.tips[i]];
        }
    },
    
    updateTip() {
        if (!this.tipsElement) return;
        
        const tip = this.tips[this.tipIndex];
        
        // 添加淡出效果
        this.tipsElement.style.opacity = '0';
        this.tipsElement.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            this.tipsElement.textContent = `${tip.emoji} ${tip.text}`;
            // 淡入效果
            this.tipsElement.style.opacity = '1';
            this.tipsElement.style.transform = 'translateY(0)';
        }, 50);
    },
    
    complete() {
        if (!this.banner) return;
        
        // 停止所有动画
        clearInterval(this.progressInterval);
        clearInterval(this.tipInterval);
        
        // 确保进度条到100%
        if (this.progressBar) {
            this.progressBar.style.width = '100%';
        }
        
        // 显示完成提示
        if (this.tipsElement) {
            this.tipsElement.textContent = '✨ 装修完成！欢迎光临~';
            this.tipsElement.style.color = '#ff6b9d';
            this.tipsElement.style.fontWeight = 'bold';
        }
        
        // 添加完成动画类
        this.banner.classList.add('complete');
        
        // 等待🎀跳出动画完成后，横幅飞走
        setTimeout(() => {
            this.banner.classList.add('hide');
            
            // 动画结束后移除元素
            setTimeout(() => {
                if (this.banner && this.banner.parentNode) {
                    this.banner.parentNode.removeChild(this.banner);
                }
            }, 800);
        }, 600);
    }
};

// 动态背景管理器
const DynamicBackground = {
    cloudsContainer: null,
    starsContainer: null,
    cloudEmojis: ['☁️', '🌸', '🎈', '🌺'],
    starEmojis: ['✨', '🌟', '💫', '⭐'],
    
    init() {
        this.cloudsContainer = document.getElementById('cloudsContainer');
        this.starsContainer = document.getElementById('starsContainer');
        
        if (this.cloudsContainer) {
            this.createClouds();
            // 定期生成新云朵
            setInterval(() => this.addCloud(), 8000);
        }
        
        if (this.starsContainer) {
            this.createStars();
        }
    },
    
    createClouds() {
        // 初始创建3-5朵云
        const count = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
            setTimeout(() => this.addCloud(), i * 2000);
        }
    },
    
    addCloud() {
        if (!this.cloudsContainer) return;
        
        const emoji = this.cloudEmojis[Math.floor(Math.random() * this.cloudEmojis.length)];
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        cloud.textContent = emoji;
        
        const top = 10 + Math.random() * 60; // 10%-70%高度
        const duration = 15 + Math.random() * 10; // 15-25秒
        const delay = Math.random() * 5;
        const size = 40 + Math.random() * 30;
        
        cloud.style.top = `${top}%`;
        cloud.style.animationDuration = `${duration}s`;
        cloud.style.animationDelay = `${delay}s`;
        cloud.style.fontSize = `${size}px`;
        
        this.cloudsContainer.appendChild(cloud);
        
        // 动画结束后移除
        setTimeout(() => {
            if (cloud.parentNode) {
                cloud.parentNode.removeChild(cloud);
            }
        }, (duration + delay) * 1000);
    },
    
    createStars() {
        if (!this.starsContainer) return;
        
        const count = 15 + Math.floor(Math.random() * 10);
        
        for (let i = 0; i < count; i++) {
            const emoji = this.starEmojis[Math.floor(Math.random() * this.starEmojis.length)];
            const star = document.createElement('div');
            star.className = 'twinkle-star';
            star.textContent = emoji;
            
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            const delay = Math.random() * 3;
            const size = 12 + Math.random() * 16;
            
            star.style.left = `${left}%`;
            star.style.top = `${top}%`;
            star.style.animationDelay = `${delay}s`;
            star.style.fontSize = `${size}px`;
            
            this.starsContainer.appendChild(star);
        }
    }
};

// 鼠标特效管理器
const MouseEffects = {
    isTouchDevice: false,
    lastX: 0,
    lastY: 0,
    
    init() {
        // 检测是否为触摸设备
        this.isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
        
        if (!this.isTouchDevice) {
            // 桌面端：鼠标移动跟随
            document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        }
        
        // 所有设备：点击爆炸效果
        document.addEventListener('click', (e) => this.handleClick(e));
    },
    
    handleMouseMove(e) {
        const now = Date.now();
        // 限制生成频率，每50ms最多一个
        if (now - this.lastTime < 50) return;
        this.lastTime = now;
        
        const deltaX = Math.abs(e.clientX - this.lastX);
        const deltaY = Math.abs(e.clientY - this.lastY);
        
        // 只有移动距离足够才生成
        if (deltaX > 10 || deltaY > 10) {
            this.createTrail(e.clientX, e.clientY);
            this.lastX = e.clientX;
            this.lastY = e.clientY;
        }
    },
    
    createTrail(x, y) {
        const emojis = ['💕', '💖', '✨', '🌟', '💫'];
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        
        const el = document.createElement('div');
        el.textContent = emoji;
        el.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            font-size: ${16 + Math.random() * 10}px;
            pointer-events: none;
            z-index: 9998;
            animation: mouseTrail 1s ease-out forwards;
        `;
        
        document.body.appendChild(el);
        
        setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 1000);
    },
    
    handleClick(e) {
        this.createExplosion(e.clientX, e.clientY);
    },
    
    createExplosion(x, y) {
        const emojis = ['💥', '✨', '💫', '🌟', '💕', '💖', '🎀'];
        const count = 8 + Math.floor(Math.random() * 5);
        
        for (let i = 0; i < count; i++) {
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];
            const angle = (360 / count) * i + Math.random() * 30;
            const distance = 30 + Math.random() * 40;
            
            const el = document.createElement('div');
            el.textContent = emoji;
            el.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                font-size: ${18 + Math.random() * 12}px;
                pointer-events: none;
                z-index: 9999;
                animation: clickExplode 0.8s ease-out forwards;
                --angle: ${angle}deg;
                --distance: ${distance}px;
            `;
            
            document.body.appendChild(el);
            
            setTimeout(() => {
                if (el.parentNode) el.parentNode.removeChild(el);
            }, 800);
        }
    },
    
    lastTime: 0
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化加载动画
    LoadingManager.init();
    
    // 初始化动态背景
    DynamicBackground.init();
    
    // 初始化爱心背景
    HeartsManager.init();
    
    // 初始化鼠标特效
    MouseEffects.init();
    
    // 初始化所有注册的模块
    ModuleRegistry.initAll();
    
    console.log('🎉 欢迎来到大福的玩具房！所有模块已加载完成~');
});

// 导出全局对象供模块使用
window.DafuToyRoom = {
    Utils,
    ModuleRegistry,
    CONFIG
};
