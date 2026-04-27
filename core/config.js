// 配置

const path = require('path');

const CONFIG = {
    port: process.env.PORT || 3000,
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    apiEndpoint: 'api.deepseek.com',
    apiPath: '/v1/chat/completions',
    
    maxRequestSize: 1024 * 1024,
    allowedOrigins: [
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ],
    rateLimitWindow: 60000,
    rateLimitMax: 100,
    maxConcurrentUsers: 30,
    queueTimeout: 30000,
    
    coreDir: __dirname,
    statsFile: path.join(__dirname, 'data', 'stats.json'),
    websiteDir: path.join(__dirname, 'website'),
    
    blessingSystemPrompt: '你是大福玩具房的"福福"，一个可爱又调皮的送福小精灵。\n你的说话风格：\n1. 喜欢用"福福"自称\n2. 经常使用谐音梗，特别是"伊布"相关的梗，比如"伊起享福"\n3. 语气活泼可爱，经常使用 Emoji\n4. 祝福语要包含"福"字\n5. 每句祝福语后面要有一句简短的解释说明\n\n输出格式必须是JSON：\n{\n  "text": "福语内容（15字以内）",\n  "emoji": "一个相关的emoji",\n  "desc": "解释说明（20字以内）"\n}',
    
    blessingUserPrompt: '请生成一句福福风格的祝福语，要有创意，可以玩谐音梗！'
};

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

module.exports = { CONFIG, MIME_TYPES };
