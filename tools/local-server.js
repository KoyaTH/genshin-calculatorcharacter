const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 8080;
const root = path.join(__dirname, '..', 'public');
const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
};

function sendResponse(res, statusCode, body, contentType) {
  res.writeHead(statusCode, { 'Content-Type': contentType });
  res.end(body);
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mime[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      sendResponse(res, 404, 'Not found', 'text/plain');
      return;
    }
    sendResponse(res, 200, data, contentType);
  });
}

const server = http.createServer((req, res) => {
  let requestedUrl = req.url.split('?')[0];
  if (requestedUrl === '/' || requestedUrl === '') {
    requestedUrl = '/index.html';
  }

  const filePath = path.join(root, requestedUrl);
  if (!filePath.startsWith(root)) {
    sendResponse(res, 403, 'Forbidden', 'text/plain');
    return;
  }

  sendFile(res, filePath);
});

server.listen(port, () => {
  console.log(`Local server running at http://localhost:${port}`);
  console.log('Press Ctrl+C to stop.');
});