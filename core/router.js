// 路由

const path = require('path');
const fs = require('fs');
const { CONFIG } = require('./config');
const {
    log, getClientIP, serveFile, recordVisit, recordModuleUsage, getStats,
    proxyDeepSeekAPI, generateBlessing
} = require('./functions');

function handleStatsAPI(req, res) {
    const clientIP = getClientIP(req);
    log('Stats API request: ' + req.method + ' from ' + clientIP);
    
    if (req.method === 'GET') {
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify(getStats()));
    } else if (req.method === 'POST') {
        recordVisit(clientIP);
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ success: true }));
    }
}

function handleModuleStatsAPI(req, res) {
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                if (data.module) {
                    recordModuleUsage(data.module);
                }
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({ success: true }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid data' }));
            }
        });
    }
}

function handleHealth(req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'Dafu Toy Room'
    }));
}

function handleRateLimit(res) {
    const rateLimitPage = path.join(CONFIG.coreDir, 'rate-limit.html');
    fs.readFile(rateLimitPage, (err, data) => {
        if (err) {
            res.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>Service Busy, Please Try Again Later</h1>');
        } else {
            res.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(data);
        }
    });
}

function handleStaticFiles(req, res, pathname) {
    let filePath = '';
    
    if (pathname === '/') {
        filePath = path.join(CONFIG.websiteDir, 'index.html');
    } else {
        const websitePath = path.join(CONFIG.websiteDir, pathname);
        if (fs.existsSync(websitePath) && fs.statSync(websitePath).isFile()) {
            filePath = websitePath;
        } else {
            filePath = path.join(CONFIG.coreDir, pathname);
        }
    }
    
    const resolvedPath = path.resolve(filePath);
    const rootPath = path.resolve(CONFIG.coreDir);
    
    if (!resolvedPath.startsWith(rootPath)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('403 Forbidden');
        return;
    }
    
    serveFile(filePath, res);
}

module.exports = {
    handleStatsAPI,
    handleModuleStatsAPI,
    handleHealth,
    handleRateLimit,
    handleStaticFiles,
    proxyDeepSeekAPI,
    generateBlessing
};
