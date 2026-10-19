/**
 * MÁY CHỦ CHẠY THỬ TRÊN VS CODE (ZERO-DEPENDENCY NODE SERVER)
 * Hỗ trợ:
 * 1. Tự tạo giai điệu Piano lãng mạn mặc định nếu bạn chưa chép file music.mp3 vào
 * 2. Lưu trực tiếp 16 bức ảnh (images/1.jpg -> 16.jpg) và nhạc (music.mp3) từ trang Quản trị qr-card.html
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

const PORT = 5500;
const ROOT_DIR = __dirname;
const IMAGES_DIR = path.join(ROOT_DIR, 'images');

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Tạo file nhạc Piano Music Box lãng mạn mặc định nếu chưa có music.mp3
function ensureDefaultMusicFile() {
  const musicPath = path.join(ROOT_DIR, 'music.mp3');
  if (fs.existsSync(musicPath)) return;

  const sampleRate = 44100;
  const duration = 16;
  const numSamples = sampleRate * duration;
  const buffer = Buffer.alloc(44 + numSamples * 2);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  const notes = [
    { t: 0.0, f: 523.25, b: 261.63 }, { t: 0.5, f: 659.25, b: 329.63 }, { t: 1.0, f: 783.99, b: 392.00 }, { t: 1.5, f: 659.25, b: 329.63 },
    { t: 2.0, f: 493.88, b: 196.00 }, { t: 2.5, f: 587.33, b: 246.94 }, { t: 3.0, f: 783.99, b: 293.66 }, { t: 3.5, f: 587.33, b: 246.94 },
    { t: 4.0, f: 440.00, b: 220.00 }, { t: 4.5, f: 523.25, b: 261.63 }, { t: 5.0, f: 659.25, b: 329.63 }, { t: 5.5, f: 523.25, b: 261.63 },
    { t: 6.0, f: 392.00, b: 164.81 }, { t: 6.5, f: 493.88, b: 196.00 }, { t: 7.0, f: 587.33, b: 246.94 }, { t: 7.5, f: 493.88, b: 196.00 },
    { t: 8.0, f: 349.23, b: 174.61 }, { t: 8.5, f: 440.00, b: 220.00 }, { t: 9.0, f: 523.25, b: 261.63 }, { t: 9.5, f: 440.00, b: 220.00 },
    { t: 10.0, f: 329.63, b: 130.81 }, { t: 10.5, f: 392.00, b: 196.00 }, { t: 11.0, f: 523.25, b: 261.63 }, { t: 11.5, f: 392.00, b: 196.00 },
    { t: 12.0, f: 349.23, b: 174.61 }, { t: 12.5, f: 440.00, b: 220.00 }, { t: 13.0, f: 587.33, b: 293.66 }, { t: 13.5, f: 440.00, b: 220.00 },
    { t: 14.0, f: 392.00, b: 196.00 }, { t: 14.5, f: 493.88, b: 246.94 }, { t: 15.0, f: 587.33, b: 293.66 }, { t: 15.5, f: 783.99, b: 392.00 }
  ];

  for (let i = 0; i < numSamples; i++) {
    const time = i / sampleRate;
    let val = 0;
    for (const n of notes) {
      const dt = time - n.t;
      if (dt >= 0 && dt < 1.8) {
        const env = Math.min(1, dt / 0.015) * Math.exp(-dt * 2.2);
        val += (Math.sin(2 * Math.PI * n.f * dt) * 0.32 + Math.sin(4 * Math.PI * n.f * dt) * 0.08) * env;
        val += Math.sin(2 * Math.PI * n.b * dt) * 0.16 * env;
      }
    }
    const sample = Math.max(-1, Math.min(1, val)) * 32767;
    buffer.writeInt16LE(Math.round(sample), 44 + i * 2);
  }
  fs.writeFileSync(musicPath, buffer);
}

ensureDefaultMusicFile();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.wav': 'audio/wav'
};

function getLocalLanIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal && !iface.address.startsWith('169.')) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const server = http.createServer((req, res) => {
  // 1. API lấy địa chỉ IP mạng Wi-Fi nội bộ
  if (req.url === '/api/lan-info' && req.method === 'GET') {
    const ip = getLocalLanIp();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ip, port: PORT, url: `http://${ip}:${PORT}/index.html` }));
    return;
  }

  // 2. API lưu trực tiếp 16 bức ảnh hoặc nhạc từ trang Quản trị qr-card.html vào ổ cứng
  if (req.url === '/api/save-media' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        if (payload.photos && Array.isArray(payload.photos)) {
          payload.photos.forEach((dataUrl, idx) => {
            if (!dataUrl || !dataUrl.includes('base64,')) return;
            const base64Data = dataUrl.split('base64,')[1];
            const targetImg = path.join(IMAGES_DIR, `${idx + 1}.jpg`);
            fs.writeFileSync(targetImg, Buffer.from(base64Data, 'base64'));
          });
        }
        if (payload.music && payload.music.includes('base64,')) {
          const base64Audio = payload.music.split('base64,')[1];
          const targetMusic = path.join(ROOT_DIR, 'music.mp3');
          fs.writeFileSync(targetMusic, Buffer.from(base64Audio, 'base64'));
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  let safePath = decodeURIComponent(req.url.split('?')[0]);
  if (safePath === '/' || safePath === '') {
    safePath = '/index.html';
  }

  const filePath = path.join(ROOT_DIR, safePath);
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 - File not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    let contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Nếu music.mp3 là file WAV mặc định thì trả đúng audio/wav để iPhone/Android phát mượt 100%
    if (path.basename(filePath) === 'music.mp3') {
      const header = Buffer.alloc(4);
      const fd = fs.openSync(filePath, 'r');
      fs.readSync(fd, header, 0, 4, 0);
      fs.closeSync(fd);
      if (header.toString('ascii') === 'RIFF') {
        contentType = 'audio/wav';
      }
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const lanIp = getLocalLanIp();
  const localUrl = `http://localhost:${PORT}/index.html`;
  const qrStudioUrl = `http://localhost:${PORT}/qr-card.html`;
  const mobileTestUrl = `http://${lanIp}:${PORT}/index.html`;

  console.log('\n====================================================================');
  console.log('💖 VŨ TRỤ KỶ NIỆM 5 NĂM YÊU NHAU (20.10) ĐÃ SẴN SÀNG TRÊN VS CODE!');
  console.log('====================================================================');
  console.log(`👉 Xem trang Quà Tặng (Vk xem): ${localUrl}`);
  console.log(`👉 Trang Quản Trị Ảnh/Nhạc & QR: ${qrStudioUrl}`);
  console.log(`📱 Quét thử bằng điện thoại:     ${mobileTestUrl}`);
  console.log('====================================================================\n');
});
