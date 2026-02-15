const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8085;
const ROOT = __dirname;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.wasm': 'application/wasm',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.data': 'application/octet-stream',
    '.br': 'application/octet-stream' // 默认占位
};

http.createServer((req, res) => {
    // 过滤掉 URL 参数，防止找不到文件
    let urlPath = req.url.split('?')[0];
    let filePath = path.join(ROOT, urlPath === '/' ? '/index.html' : urlPath);

    let encoding = null;

    // ===== 处理压缩文件 =====
    if (filePath.endsWith('.br')) {
        encoding = 'br';
    } else if (filePath.endsWith('.gz')) {
        encoding = 'gzip';
    }

    // 获取真实扩展名（如果是 .br 或 .gz，取其前面的后缀名）
    let extname = path.extname(filePath);
    if (extname === '.br' || extname === '.gz') {
        const realFileName = filePath.slice(0, -extname.length);
        extname = path.extname(realFileName);
    }

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found: ' + urlPath);
            return;
        }

        // 设置 MIME 类型
        res.setHeader('Content-Type', contentType);

        // 设置压缩编码格式
        if (encoding) {
            res.setHeader('Content-Encoding', encoding);
        }

        // 针对 WASM 文件的特殊处理（有些浏览器要求严格）
        if (extname === '.wasm') {
            res.setHeader('Content-Type', 'application/wasm');
        }

        res.writeHead(200);
        res.end(content);
    });

}).listen(PORT, () => {
    console.log(`🚀 Unity WebGL (Brotli Support) running at http://localhost:${PORT}`);
    console.log(`📂 Root directory: ${ROOT}`);
});