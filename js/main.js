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
    init() {
        const banner = document.getElementById('loadingBanner');
        if (!banner) return;
        
        // 模拟加载过程
        setTimeout(() => {
            this.completeLoading();
        }, 1500);
    },
    
    completeLoading() {
        const banner = document.getElementById('loadingBanner');
        if (!banner) return;
        
        // 添加跳出动画
        banner.classList.add('jump-out');
        
        // 动画结束后隐藏
        setTimeout(() => {
            banner.style.display = 'none';
        }, 800);
    }
};

// 鼠标特效管理器
const CursorEffectsManager = {
    container: null,
    lastHeartTime: 0,
    heartInterval: 100, // 爱心生成间隔(ms)
    
    init() {
        this.container = document.getElementById('cursorEffects');
        if (!this.container) return;
        
        // 检测是否为触摸设备
        const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
        
        if (!isTouchDevice) {
            // 桌面端：鼠标移动生成爱心
            document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        }
        
        // 所有设备：点击生成爆炸效果
        document.addEventListener('click', (e) => this.onClick(e));
    },
    
    onMouseMove(e) {
        const now = Date.now();
        if (now - this.lastHeartTime < this.heartInterval) return;
        
        this.lastHeartTime = now;
        this.createHeart(e.clientX, e.clientY);
    },
    
    createHeart(x, y) {
        const heart = document.createElement('span');
        heart.className = 'cursor-heart';
        heart.textContent = ['💕', '💖', '💗', '💓'][Math.floor(Math.random() * 4)];
        heart.style.left = `${x}px`;
        heart.style.top = `${y}px`;
        
        this.container.appendChild(heart);
        
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, 1000);
    },
    
    onClick(e) {
        this.createExplosion(e.clientX, e.clientY);
    },
    
    createExplosion(x, y) {
        const explosion = document.createElement('div');
        explosion.className = 'click-explosion';
        explosion.style.left = `${x}px`;
        explosion.style.top = `${y}px`;
        
        const emojis = ['✨', '⭐', '💫', '🌟', '💖', '💕'];
        const count = 8;
        
        for (let i = 0; i < count; i++) {
            const span = document.createElement('span');
            span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            const angle = (360 / count) * i;
            const distance = 30 + Math.random() * 20;
            const tx = Math.cos(angle * Math.PI / 180) * distance;
            const ty = Math.sin(angle * Math.PI / 180) * distance;
            span.style.setProperty('--tx', `${tx}px`);
            span.style.setProperty('--ty', `${ty}px`);
            explosion.appendChild(span);
        }
        
        this.container.appendChild(explosion);
        
        setTimeout(() => {
            if (explosion.parentNode) {
                explosion.parentNode.removeChild(explosion);
            }
        }, 600);
    }
};

// 动态背景管理器
const DynamicBackgroundManager = {
    init() {
        this.createClouds();
        this.createStars();
        this.createRainbow();
    },
    
    createClouds() {
        const container = document.createElement('div');
        container.className = 'floating-clouds';
        
        const cloudEmojis = ['☁️', '🌸', '🎈', '🌺'];
        const cloudCount = 5;
        
        for (let i = 0; i < cloudCount; i++) {
            const cloud = document.createElement('span');
            cloud.className = 'cloud';
            cloud.textContent = cloudEmojis[Math.floor(Math.random() * cloudEmojis.length)];
            cloud.style.top = `${10 + Math.random() * 60}%`;
            cloud.style.animationDuration = `${20 + Math.random() * 20}s`;
            cloud.style.animationDelay = `${Math.random() * 10}s`;
            container.appendChild(cloud);
        }
        
        document.body.appendChild(container);
    },
    
    createStars() {
        const container = document.createElement('div');
        container.className = 'twinkling-stars';
        
        const starCount = 20;
        
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('span');
            star.className = 'star';
            star.textContent = ['✨', '⭐', '💫'][Math.floor(Math.random() * 3)];
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.animationDelay = `${Math.random() * 2}s`;
            container.appendChild(star);
        }
        
        document.body.appendChild(container);
    },
    
    createRainbow() {
        const rainbow = document.createElement('div');
        rainbow.className = 'rainbow-bg';
        document.body.appendChild(rainbow);
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化加载动画
    LoadingManager.init();
    
    // 初始化爱心背景
    HeartsManager.init();
    
    // 初始化鼠标特效
    CursorEffectsManager.init();
    
    // 初始化动态背景
    DynamicBackgroundManager.init();
    
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
