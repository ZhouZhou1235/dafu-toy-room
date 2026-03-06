/**
 * 加载动画模块 🎬
 * 积木式架构 - 可独立删除或替换
 * 功能：顶部横幅加载动画，蓄力后向上跳出
 */

(function() {
    'use strict';
    
    // 配置
    const CONFIG = {
        minDisplayTime: 2500,  // 最少显示2.5秒
        jumpOutTime: 600,      // 跳出动画时间
        messages: [
            '正在召唤仙子伊布...',
            '大福正在准备玩具...',
            '正在加载快乐能量...',
            '正在布置玩具房...',
            '仙子伊布正在梳妆...'
        ]
    };
    
    // 创建加载横幅
    function createLoadingBanner() {
        const bannerHTML = `
            <div id="loadingBanner" class="loading-banner">
                <div class="loading-banner-content">
                    <div class="sylveon-bounce">🎀</div>
                    <div class="loading-text">${DafuToyRoom.Utils.randomChoice(CONFIG.messages)}</div>
                    <div class="loading-progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('afterbegin', bannerHTML);
        addLoadingStyles();
        simulateProgress();
    }
    
    // 添加加载样式
    function addLoadingStyles() {
        const styles = `
            .loading-banner {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 80px;
                background: linear-gradient(135deg, #fff5f7 0%, #ffe4ec 50%, #fff0f3 100%);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 99999;
                box-shadow: 0 2px 20px rgba(255, 107, 157, 0.2);
                transition: transform ${CONFIG.jumpOutTime}ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }
            
            .loading-banner.jump-out {
                transform: translateY(-120%);
            }
            
            .loading-banner-content {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 0 20px;
            }
            
            .sylveon-bounce {
                font-size: 2.5rem;
                animation: sylveon-bounce-anim 0.6s ease-in-out infinite;
                filter: drop-shadow(0 3px 10px rgba(255, 107, 157, 0.4));
            }
            
            @keyframes sylveon-bounce-anim {
                0%, 100% { transform: translateY(0) scale(1); }
                50% { transform: translateY(-10px) scale(1.1); }
            }
            
            /* 蓄力动画 - 只在横幅内弹跳 */
            .sylveon-bounce.charging {
                animation: sylveon-charge 0.6s ease-in-out 2;
            }
            
            @keyframes sylveon-charge {
                0% { transform: translateY(0) scale(1); }
                50% { transform: translateY(15px) scale(0.85); }
                100% { transform: translateY(0) scale(1); }
            }
            
            /* 准备起飞的动画 */
            .loading-banner.ready-to-jump .sylveon-bounce {
                animation: sylveon-jump 0.4s ease-out forwards;
            }
            
            @keyframes sylveon-jump {
                0% { transform: translateY(0) scale(1); }
                50% { transform: translateY(-5px) scale(1.1); }
                100% { transform: translateY(-30px) scale(0.9); opacity: 0.5; }
            }
            
            .loading-text {
                font-size: 1rem;
                color: var(--primary-color);
                font-weight: 500;
                white-space: nowrap;
            }
            
            .loading-progress-bar {
                width: 120px;
                height: 6px;
                background: rgba(255, 107, 157, 0.2);
                border-radius: 3px;
                overflow: hidden;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
                border-radius: 3px;
                width: 0%;
                transition: width 0.3s ease;
            }
            
            /* 移动端适配 */
            @media (max-width: 768px) {
                .loading-banner {
                    height: 60px;
                }
                .sylveon-bounce {
                    font-size: 2rem;
                }
                .loading-text {
                    font-size: 0.85rem;
                }
                .loading-progress-bar {
                    width: 80px;
                }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    // 模拟进度
    function simulateProgress() {
        const progressFill = document.querySelector('.progress-fill');
        const loadingText = document.querySelector('.loading-text');
        const sylveon = document.querySelector('.sylveon-bounce');
        let progress = 0;
        
        const interval = setInterval(() => {
            progress += Math.random() * 12;
            if (progress > 100) progress = 100;
            
            if (progressFill) {
                progressFill.style.width = progress + '%';
            }
            
            // 随机更换文字
            if (Math.random() > 0.8 && loadingText) {
                loadingText.textContent = DafuToyRoom.Utils.randomChoice(CONFIG.messages);
            }
            
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    if (loadingText) {
                        loadingText.textContent = '仙子伊布蓄力中...';
                    }
                    // 开始蓄力动画（弹跳2次）
                    if (sylveon) {
                        sylveon.classList.add('charging');
                    }
                    
                    // 蓄力完成后准备起飞
                    setTimeout(() => {
                        if (loadingText) {
                            loadingText.textContent = '仙子伊布出发啦！';
                        }
                        const banner = document.getElementById('loadingBanner');
                        if (banner) {
                            banner.classList.add('ready-to-jump');
                        }
                        // 起跳动画后整个横幅飞出
                        setTimeout(jumpOutBanner, 400);
                    }, 1200);
                }, 300);
            }
        }, 180);
    }
    
    // 横幅向上跳出
    function jumpOutBanner() {
        const banner = document.getElementById('loadingBanner');
        if (banner) {
            banner.classList.add('jump-out');
            setTimeout(() => {
                banner.remove();
            }, CONFIG.jumpOutTime);
        }
    }
    
    // 初始化
    function init() {
        // 页面加载完成后显示加载横幅
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createLoadingBanner);
        } else {
            createLoadingBanner();
        }
        
        console.log('🎬 加载横幅动画模块已加载！');
    }
    
    // 注册模块
    if (window.DafuToyRoom && window.DafuToyRoom.ModuleRegistry) {
        window.DafuToyRoom.ModuleRegistry.register('loading', init);
    } else {
        init();
    }
})();
