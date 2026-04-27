// 服务器

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const { CONFIG } = require('./config');
const {
    log, getClientIP, setSecurityHeaders, checkRateLimit,
    loadStats, saveStats, ConnectionManager
} = require('./functions');
const {
    handleStatsAPI,
    handleModuleStatsAPI,
    handleHealth,
    handleRateLimit,
    handleStaticFiles,
    proxyDeepSeekAPI,
    generateBlessing
} = require('./router');

const statsDir = path.dirname(CONFIG.statsFile);
if (!fs.existsSync(statsDir)) {
    fs.mkdirSync(statsDir, { recursive: true });
}
if (!fs.existsSync(CONFIG.statsFile)) {
    const defaultStats = {
        today: { date: new Date().toDateString(), uniqueVisitors: 0, totalVisits: 0, visitorIPs: [], moduleUsage: {} },
        total: { uniqueVisitors: 0, totalVisits: 0, moduleUsage: {}, lastUpdated: new Date().toISOString() }
    };
    fs.writeFileSync(CONFIG.statsFile, JSON.stringify(defaultStats, null, 2));
}

if (!fs.existsSync(CONFIG.websiteDir)) {
    fs.mkdirSync(CONFIG.websiteDir, { recursive: true });
}

loadStats();

const server = http.createServer((req, res) => {
    const clientIP = getClientIP(req);
    
    setSecurityHeaders(res);
    
    if (!checkRateLimit(clientIP)) {
        res.writeHead(429, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Too many requests, please try again later' }));
        log('Rate limit triggered: ' + clientIP, 'error');
        return;
    }
    
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    log(req.method + ' ' + pathname);
    
    const isMainPage = pathname === '/' || pathname === '/index.html';
    const isAPI = pathname.startsWith('/api/');
    
    if (isMainPage || isAPI) {
        if (ConnectionManager.isFull() && !ConnectionManager.hasConnection(clientIP)) {
            handleRateLimit(res);
            log('Concurrency limit triggered: ' + clientIP + ', active connections: ' + ConnectionManager.getActiveCount(), 'error');
            return;
        }
        
        ConnectionManager.addConnection(clientIP);
        res.on('finish', () => ConnectionManager.removeConnection(clientIP));
        ConnectionManager.updateActivity(clientIP);
    }
    
    if (pathname === '/api/chat' && req.method === 'POST') {
        proxyDeepSeekAPI(req, res);
        return;
    }
    
    if (pathname === '/api/blessing' && req.method === 'POST') {
        generateBlessing(req, res);
        return;
    }
    
    if (pathname === '/api/stats') {
        handleStatsAPI(req, res);
        return;
    }
    
    if (pathname === '/api/stats/module') {
        handleModuleStatsAPI(req, res);
        return;
    }
    
    if (pathname === '/health') {
        handleHealth(req, res);
        return;
    }
    
    handleStaticFiles(req, res, pathname);
});

server.listen(CONFIG.port, () => {
    log('==================================================');
    log('Dafu Toy Room Server Started');
    log('Address: http://localhost:' + CONFIG.port);
    log('Website Directory: ' + CONFIG.websiteDir);
    log('Statistics File: ' + CONFIG.statsFile);
    log('API Key Status: ' + (CONFIG.apiKey ? 'Configured' : 'Not Configured'));
    log('==================================================');
});

process.on('SIGTERM', () => {
    log('Received SIGTERM signal, shutting down...');
    saveStats();
    server.close(() => {
        log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    log('Received SIGINT signal, shutting down...');
    saveStats();
    server.close(() => {
        log('Server closed');
        process.exit(0);
    });
});

process.on('uncaughtException', (error) => {
    log('Uncaught exception: ' + error.message, 'error');
});

process.on('unhandledRejection', (reason) => {
    log('Unhandled rejection: ' + reason, 'error');
});

module.exports = server;
