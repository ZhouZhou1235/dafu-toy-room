/**
 * 数据统计模块 📊
 * 积木式架构 - 可独立删除或替换
 * 记录访客人数和功能使用次数（使用服务器端统计）
 */

(function() {
    'use strict';
    
    // 配置
    const CONFIG = {
        apiEndpoint: '/api/stats',
        moduleApiEndpoint: '/api/stats/module',
        maxTotal: 999
    };
    
    // 统计数据
    let stats = {
        today: {
            uniqueVisitors: 0,
            totalVisits: 0,
            moduleUsage: {
                guessNumber: 0,
                whatToEat: 0,
                fortune: 0,
                blessing: 0,
                aiChat: 0
            }
        },
        total: {
            uniqueVisitors: 0,
            totalVisits: 0,
            moduleUsage: {
                guessNumber: 0,
                whatToEat: 0,
                fortune: 0,
                blessing: 0,
                aiChat: 0
            },
            lastUpdated: null
        }
    };
    
    // DOM元素
    let elements = {};
    
    // 初始化
    async function init() {
        getElements();
        
        // 记录本次访问
        await recordVisit();
        
        // 加载统计数据
        await loadStats();
        
        if (elements.panel) {
            bindEvents();
            updateDisplay();
        }
        
        // 定期刷新数据（每30秒）
        setInterval(async () => {
            await loadStats();
            if (elements.panel && document.getElementById('statisticsPanel').classList.contains('active')) {
                updateDisplay();
            }
        }, 30000);
        
        console.log('📊 数据统计模块已加载！');
    }
    
    // 获取DOM元素
    function getElements() {
        elements = {
            panel: document.getElementById('statisticsPanel'),
            todayVisitors: document.getElementById('todayVisitors'),
            todayVisits: document.getElementById('todayVisits'),
            totalVisitors: document.getElementById('totalVisitors'),
            totalVisits: document.getElementById('totalVisits'),
            lastUpdated: document.getElementById('lastUpdated'),
            moduleStats: {
                guessNumber: document.getElementById('statGuessNumber'),
                whatToEat: document.getElementById('statWhatToEat'),
                fortune: document.getElementById('statFortune'),
                blessing: document.getElementById('statBlessing'),
                aiChat: document.getElementById('statAiChat')
            }
        };
    }
    
    // 从服务器加载统计数据
    async function loadStats() {
        try {
            const response = await fetch(CONFIG.apiEndpoint);
            if (response.ok) {
                const data = await response.json();
                stats = data;
                console.log('📊 统计数据已更新:', stats);
            }
        } catch (error) {
            console.error('加载统计数据失败:', error);
        }
    }
    
    // 记录访问
    async function recordVisit() {
        try {
            await fetch(CONFIG.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            console.error('记录访问失败:', error);
        }
    }
    
    // 记录模块使用
    async function recordModuleUsage(moduleName) {
        try {
            await fetch(CONFIG.moduleApiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ module: moduleName })
            });
            
            // 重新加载统计数据
            await loadStats();
            
            // 如果统计面板打开，更新显示
            if (elements.panel && document.getElementById('statisticsPanel').classList.contains('active')) {
                updateDisplay();
            }
        } catch (error) {
            console.error('记录模块使用失败:', error);
        }
    }
    
    // 绑定事件
    function bindEvents() {
        document.addEventListener('tabChanged', (e) => {
            if (e.detail.tabId === 'statistics') {
                loadStats().then(() => updateDisplay());
            }
        });
    }
    
    // 更新显示
    function updateDisplay() {
        if (!elements.todayVisitors) return;
        
        // 今日数据
        elements.todayVisitors.textContent = stats.today.uniqueVisitors;
        elements.todayVisits.textContent = stats.today.totalVisits;
        
        // 总数据
        elements.totalVisitors.textContent = Math.min(stats.total.uniqueVisitors, CONFIG.maxTotal);
        elements.totalVisits.textContent = Math.min(stats.total.totalVisits, CONFIG.maxTotal);
        
        // 模块使用统计
        Object.keys(elements.moduleStats).forEach(moduleName => {
            const el = elements.moduleStats[moduleName];
            if (el) {
                const today = stats.today.moduleUsage[moduleName] || 0;
                const total = stats.total.moduleUsage[moduleName] || 0;
                el.innerHTML = `<span class="stat-today">${today}</span> / <span class="stat-total">${total}</span>`;
            }
        });
        
        // 最后更新时间
        if (elements.lastUpdated && stats.total.lastUpdated) {
            const date = new Date(stats.total.lastUpdated);
            elements.lastUpdated.textContent = formatDateTime(date);
        }
    }
    
    // 格式化日期时间
    function formatDateTime(date) {
        const pad = (n) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }
    
    // 导出API供其他模块使用
    window.Statistics = {
        recordModuleUsage,
        getTodayStats: () => ({ ...stats.today }),
        getTotalStats: () => ({ ...stats.total })
    };
    
    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
