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
    '.data': 'application/octet-stream'
};

http.createServer((req, res) => {

    let filePath = path.join(ROOT, req.url === '/' ? '/index.html' : req.url);

    let encoding = null;

    // ===== 仅处理 .gz 文件 =====
    if (filePath.endsWith('.gz')) {
        encoding = 'gzip';
    }

    // 真实扩展名（去掉 .gz）
    let extname = path.extname(filePath);
    if (extname === '.gz') {
        extname = path.extname(filePath.slice(0, -3));
    }

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }

        res.setHeader('Content-Type', contentType);

        if (encoding) {
            res.setHeader('Content-Encoding', encoding);
        }

        res.writeHead(200);
        res.end(content);
    });

}).listen(PORT, () => {
    console.log(`🚀 Unity WebGL running at http://localhost:${PORT}`);
});