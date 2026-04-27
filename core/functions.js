// 函数集

const fs = require('fs');
const path = require('path');
const https = require('https');
const { CONFIG, MIME_TYPES } = require('./config');

function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '[ERROR]' : type === 'success' ? '[SUCCESS]' : '[INFO]';
    console.log(`[${timestamp}] ${prefix} ${message}`);
}

function getClientIP(req) {
    const forwarded = req.headers['x-forwarded-for'];
    const realIP = req.headers['x-real-ip'];
    const cfConnectingIP = req.headers['cf-connecting-ip'];
    
    if (cfConnectingIP) return cfConnectingIP.trim();
    if (realIP) return realIP.trim();
    if (forwarded) {
        const ips = forwarded.split(',').map(ip => ip.trim());
        const publicIP = ips.find(ip => 
            !ip.startsWith('10.') && 
            !ip.startsWith('192.168.') && 
            !ip.startsWith('172.') &&
            ip !== '127.0.0.1' &&
            ip !== '::1' &&
            !ip.startsWith('::ffff:127.')
        );
        return publicIP || ips[0];
    }
    return req.connection.remoteAddress || 'unknown';
}

function setSecurityHeaders(res) {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; font-src 'self' https://cdnjs.cloudflare.com; img-src 'self' data:; connect-src 'self'");
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
}

function serveFile(filePath, res) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('404 Page Not Found');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('500 Internal Server Error');
            }
            return;
        }
        
        const headers = {
            'Content-Type': contentType + (ext === '.html' ? '; charset=utf-8' : ''),
            'Cache-Control': 'public, max-age=3600'
        };
        
        res.writeHead(200, headers);
        res.end(data);
    });
}

const rateLimitMap = new Map();

function checkRateLimit(clientIP) {
    const now = Date.now();
    const windowStart = now - CONFIG.rateLimitWindow;
    
    if (!rateLimitMap.has(clientIP)) {
        rateLimitMap.set(clientIP, []);
    }
    
    const requests = rateLimitMap.get(clientIP);
    const validRequests = requests.filter(time => time > windowStart);
    
    if (validRequests.length >= CONFIG.rateLimitMax) {
        return false;
    }
    
    validRequests.push(now);
    rateLimitMap.set(clientIP, validRequests);
    return true;
}

function hashIP(ip) {
    let hash = 0;
    for (let i = 0; i < ip.length; i++) {
        const char = ip.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(16);
}

let serverStats = {
    today: {
        date: new Date().toDateString(),
        uniqueVisitors: 0,
        totalVisits: 0,
        visitorIPs: new Set(),
        moduleUsage: {
            guessNumber: 0, whatToEat: 0, fortune: 0, blessing: 0,
            aiChat: 0, whackAMole: 0, luckyWheel: 0, passwordGen: 0, moodDiary: 0
        }
    },
    total: {
        uniqueVisitors: 0, totalVisits: 0,
        moduleUsage: {
            guessNumber: 0, whatToEat: 0, fortune: 0, blessing: 0,
            aiChat: 0, whackAMole: 0, luckyWheel: 0, passwordGen: 0, moodDiary: 0
        },
        lastUpdated: new Date().toISOString()
    }
};

function loadStats() {
    try {
        if (fs.existsSync(CONFIG.statsFile)) {
            const data = JSON.parse(fs.readFileSync(CONFIG.statsFile, 'utf8'));
            const today = new Date().toDateString();
            
            if (data.today && data.today.date === today) {
                serverStats.today = { ...data.today, visitorIPs: new Set(data.today.visitorIPs || []) };
            } else {
                serverStats.today = {
                    date: today, uniqueVisitors: 0, totalVisits: 0, visitorIPs: new Set(),
                    moduleUsage: {
                        guessNumber: 0, whatToEat: 0, fortune: 0, blessing: 0,
                        aiChat: 0, whackAMole: 0, luckyWheel: 0, passwordGen: 0, moodDiary: 0
                    }
                };
            }
            serverStats.total = data.total || serverStats.total;
            log('Statistics loaded');
        }
    } catch (error) {
        log('Failed to load statistics: ' + error.message, 'error');
    }
}

function saveStats() {
    try {
        const dataToSave = {
            today: { ...serverStats.today, visitorIPs: Array.from(serverStats.today.visitorIPs) },
            total: serverStats.total
        };
        fs.writeFileSync(CONFIG.statsFile, JSON.stringify(dataToSave, null, 2));
    } catch (error) {
        log('Failed to save statistics: ' + error.message, 'error');
    }
}

function recordVisit(clientIP) {
    const today = new Date().toDateString();
    const hashedIP = hashIP(clientIP);
    
    if (serverStats.today.date !== today) {
        serverStats.today = {
            date: today, uniqueVisitors: 0, totalVisits: 0, visitorIPs: new Set(),
            moduleUsage: {
                guessNumber: 0, whatToEat: 0, fortune: 0, blessing: 0,
                aiChat: 0, whackAMole: 0, luckyWheel: 0, passwordGen: 0, moodDiary: 0
            }
        };
    }
    
    serverStats.today.totalVisits++;
    serverStats.total.totalVisits++;
    
    if (!serverStats.today.visitorIPs.has(hashedIP)) {
        serverStats.today.visitorIPs.add(hashedIP);
        serverStats.today.uniqueVisitors++;
        serverStats.total.uniqueVisitors++;
    }
    
    serverStats.total.lastUpdated = new Date().toISOString();
    saveStats();
}

function recordModuleUsage(moduleName) {
    if (!serverStats.today.moduleUsage.hasOwnProperty(moduleName)) {
        serverStats.today.moduleUsage[moduleName] = 0;
    }
    if (!serverStats.total.moduleUsage.hasOwnProperty(moduleName)) {
        serverStats.total.moduleUsage[moduleName] = 0;
    }
    
    serverStats.today.moduleUsage[moduleName]++;
    serverStats.total.moduleUsage[moduleName]++;
    serverStats.total.lastUpdated = new Date().toISOString();
    saveStats();
}

function getStats() {
    return {
        today: {
            date: serverStats.today.date,
            uniqueVisitors: serverStats.today.uniqueVisitors,
            totalVisits: serverStats.today.totalVisits,
            moduleUsage: serverStats.today.moduleUsage
        },
        total: serverStats.total
    };
}

const ConnectionManager = {
    activeConnections: new Map(),
    waitingQueue: [],
    
    addConnection(clientIP) {
        const now = Date.now();
        this.cleanupConnections();
        
        if (this.activeConnections.size >= CONFIG.maxConcurrentUsers) {
            return false;
        }
        
        this.activeConnections.set(clientIP, { ip: clientIP, connectedAt: now, lastActivity: now });
        return true;
    },
    
    updateActivity(clientIP) {
        if (this.activeConnections.has(clientIP)) {
            this.activeConnections.get(clientIP).lastActivity = Date.now();
        }
    },
    
    removeConnection(clientIP) {
        this.activeConnections.delete(clientIP);
    },
    
    cleanupConnections() {
        const now = Date.now();
        const timeout = 5 * 60 * 1000;
        
        for (const [ip, conn] of this.activeConnections) {
            if (now - conn.lastActivity > timeout) {
                this.activeConnections.delete(ip);
                log('Cleaned up timeout connection: ' + ip);
            }
        }
    },
    
    getActiveCount() {
        this.cleanupConnections();
        return this.activeConnections.size;
    },
    
    isFull() {
        return this.getActiveCount() >= CONFIG.maxConcurrentUsers;
    },
    
    hasConnection(clientIP) {
        return this.activeConnections.has(clientIP);
    }
};

function validateRequestBody(body) {
    try {
        const data = JSON.parse(body);
        if (data.messages && Array.isArray(data.messages)) {
            for (const msg of data.messages) {
                if (msg.content && typeof msg.content === 'string') {
                    if (msg.content.length > 4000) {
                        return { valid: false, error: 'Message content too long' };
                    }
                    if (/<script|<iframe|<object|<embed/i.test(msg.content)) {
                        return { valid: false, error: 'Message contains illegal content' };
                    }
                }
            }
        }
        return { valid: true };
    } catch (e) {
        return { valid: false, error: 'Invalid JSON format' };
    }
}

function proxyDeepSeekAPI(req, res) {
    let body = '';
    let bodySize = 0;
    
    req.on('data', chunk => {
        bodySize += chunk.length;
        if (bodySize > CONFIG.maxRequestSize) {
            res.writeHead(413, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Request body too large' }));
            req.destroy();
            return;
        }
        body += chunk.toString();
    });
    
    req.on('end', () => {
        log('Received AI chat request');
        
        const validation = validateRequestBody(body);
        if (!validation.valid) {
            log('Request body validation failed: ' + validation.error, 'error');
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: validation.error }));
            return;
        }
        
        let requestData;
        try {
            requestData = JSON.parse(body);
        } catch (e) {
            log('Failed to parse request body', 'error');
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid request body' }));
            return;
        }
        
        const apiRequestBody = JSON.stringify({
            model: requestData.model || 'deepseek-chat',
            messages: requestData.messages || [],
            max_tokens: requestData.max_tokens || 1000,
            temperature: requestData.temperature || 0.7,
            stream: false
        });
        
        const options = {
            hostname: CONFIG.apiEndpoint,
            port: 443,
            path: CONFIG.apiPath,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + CONFIG.apiKey,
                'Content-Length': Buffer.byteLength(apiRequestBody),
                'Accept': 'application/json'
            },
            timeout: 30000
        };
        
        log('Sending request to DeepSeek API...');
        
        const proxyReq = https.request(options, (proxyRes) => {
            let responseData = '';
            
            proxyRes.on('data', (chunk) => {
                responseData += chunk;
            });
            
            proxyRes.on('end', () => {
                res.writeHead(proxyRes.statusCode, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(responseData);
                
                if (proxyRes.statusCode === 200) {
                    log('AI request successful', 'success');
                } else {
                    log('AI request failed with status: ' + proxyRes.statusCode, 'error');
                }
            });
        });
        
        proxyReq.on('error', (error) => {
            log('Proxy request error: ' + error.message, 'error');
            res.writeHead(500, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ error: 'Proxy request failed', message: error.message }));
        });
        
        proxyReq.on('timeout', () => {
            log('API request timeout', 'error');
            proxyReq.destroy();
            res.writeHead(504, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ error: 'Request timeout' }));
        });
        
        proxyReq.write(apiRequestBody);
        proxyReq.end();
    });
}

function generateBlessing(req, res) {
    log('Received blessing generation request');
    
    const apiRequestBody = JSON.stringify({
        model: 'deepseek-chat',
        messages: [
            { role: 'system', content: CONFIG.blessingSystemPrompt },
            { role: 'user', content: CONFIG.blessingUserPrompt }
        ],
        max_tokens: 200,
        temperature: 0.9,
        stream: false
    });
    
    const options = {
        hostname: CONFIG.apiEndpoint,
        port: 443,
        path: CONFIG.apiPath,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + CONFIG.apiKey,
            'Content-Length': Buffer.byteLength(apiRequestBody),
            'Accept': 'application/json'
        },
        timeout: 10000
    };
    
    log('Requesting blessing from DeepSeek...');
    
    const apiReq = https.request(options, (apiRes) => {
        let responseData = '';
        
        apiRes.on('data', (chunk) => {
            responseData += chunk;
        });
        
        apiRes.on('end', () => {
            try {
                const data = JSON.parse(responseData);
                
                if (data.choices && data.choices[0] && data.choices[0].message) {
                    const aiResponse = data.choices[0].message.content;
                    
                    let blessing;
                    try {
                        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            blessing = JSON.parse(jsonMatch[0]);
                        } else {
                            throw new Error('No JSON found');
                        }
                    } catch (e) {
                        blessing = {
                            text: aiResponse.substring(0, 15) || 'Fufu wishes you good fortune',
                            emoji: '🎀',
                            desc: 'Fufu special blessing for you'
                        };
                    }
                    
                    res.writeHead(200, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify({ blessing }));
                    log('Blessing generated successfully', 'success');
                } else {
                    throw new Error('Invalid API response');
                }
            } catch (error) {
                log('Blessing generation failed: ' + error.message, 'error');
                res.writeHead(500, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({ error: 'Generation failed' }));
            }
        });
    });
    
    apiReq.on('error', (error) => {
        log('API request error: ' + error.message, 'error');
        res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ error: 'API request failed' }));
    });
    
    apiReq.on('timeout', () => {
        log('Blessing generation timeout', 'error');
        apiReq.destroy();
        res.writeHead(504, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ error: 'Request timeout' }));
    });
    
    apiReq.write(apiRequestBody);
    apiReq.end();
}

module.exports = {
    log, getClientIP, setSecurityHeaders, serveFile, checkRateLimit,
    loadStats, saveStats, recordVisit, recordModuleUsage, getStats,
    ConnectionManager, proxyDeepSeekAPI, generateBlessing
};
