/**
 * VŨ TRỤ KỶ NIỆM 5 NĂM YÊU NHAU (20.10.2021 - 20.10.2026)
 * Engine 3D WebGL (Three.js) + 2D High-DPI Canvas
 *
 * Đã tinh chỉnh chuẩn xác 3 điểm theo video TikTok:
 * 1. Hoa Hồng Nở Rộ: Bông hồng tả thực (English Garden Rose 40+ cánh uốn cong), kích thước CỰC TO (260px - 440px), mật độ dày đặc phủ kín 100% màn hình không hở nền đen, nở siêu nhanh và tự chuyển cảnh.
 * 2. Lịch & Trái Tim Mảnh Ghép: Mảnh ghép có ĐÚNG HÌNH DẠNG MẢNH GHÉP XẾP HÌNH (Jigsaw Puzzle có mấu lồi / khớp lõm cổ thắt ở 4 cạnh), bay vào khớp khít nhau tạo thành Trái Tim ảnh tự nhiên.
 * 3. Đoạn Ảnh Chạy Màn Hình Lõm: Gọn gàng, rõ nét, xếp thành 3 hàng ngang đều đặn trên 1 vòng cung MÀN HÌNH LÕM (hai bên cong gần, chính giữa lõm sâu vào trong) và chạy mượt theo 1 hướng duy nhất TỪ TRÁI QUA PHẢI.
 */

const TOTAL_PHOTOS = 49;

const INTERLEAVED_MESSAGES = [
  {
    step: '✨ HAPPY ANNIVERSARY • 5 NĂM YÊU NHAU ✨',
    main: 'Chúc mừng nửa thập kỷ của chúng ta',
    sub: '20.10.2021 — 20.10.2026 • 1.826 ngày thanh xuân rực rỡ bên nhau'
  },
  {
    step: '💖 TỪ TRÁI TIM CK GỬI VK YÊU 💖',
    main: 'Ck yêu vk',
    sub: 'Giữa muôn vàn vì sao trong dải ngân hà, vk mãi là tinh cầu đẹp nhất của ck'
  },
  {
    step: '🌌 LỜI CẢM ƠN TỪ ĐÁY LÒNG 🌌',
    main: 'Cảm ơn vk vì đã luôn bên ck',
    sub: 'Cảm ơn vk vì sự dịu dàng, thấu hiểu và luôn đồng hành cùng ck suốt 5 năm qua'
  },
  {
    step: '♾️ LỜI HỨA VĨNH CỬU ♾️',
    main: 'Chúng ta sẽ mãi bên nhau',
    sub: 'Nắm chặt tay nhau đi tiếp qua thật nhiều thập kỷ nữa, vk yêu nhé!'
  }
];

const ORBIT_TEXT_BANNERS = [
  'Chúc mừng nửa thập kỷ của chúng ta ✨',
  'Ck yêu vk ❤️',
  'Cảm ơn vk vì đã luôn bên ck 🌸',
  'Chúng ta sẽ mãi bên nhau ♾️',
  'Happy Anniversary 5 Năm • 20.10 💖',
  '20.10.2021 — 20.10.2026 🪐',
  '1.826 Ngày Thương Nhớ 🌌',
  'Ngàn ánh sao vụt qua nhẹ ôm lấy vk ✨',
  'Cầm tay ck, dựa vai ck nhé ❤️',
  'Yêu vk say đắm như ngày đầu 🌹'
];

// ==================== 1. TẢI 31 BỨC ẢNH HD (1024x1024 CHỐNG VỠ ẢNH) ====================
function createFallbackPhotoCanvas(index) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');

  const palettes = [
    ['#4a0e4e', '#c9184a', '#ff758f'],
    ['#1f083d', '#7209b7', '#f72585'],
    ['#2b064d', '#9d4edd', '#ffb3c6'],
    ['#3c096c', '#b5179e', '#ffd166']
  ];
  const [c1, c2, c3] = palettes[index % palettes.length];
  const g = ctx.createLinearGradient(0, 0, 512, 512);
  g.addColorStop(0, c1);
  g.addColorStop(0.55, c2);
  g.addColorStop(1, c3);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);

  return c;
}

const loadedPhotoImages = new Array(TOTAL_PHOTOS);
const loadedThreeTextures = new Array(TOTAL_PHOTOS);

function loadAll30Photos(maxAniso = 8) {
  for (let i = 0; i < TOTAL_PHOTOS; i++) {
    const fallbackCanvas = createFallbackPhotoCanvas(i);
    loadedPhotoImages[i] = fallbackCanvas;

    const tex = new THREE.CanvasTexture(fallbackCanvas);
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    tex.anisotropy = maxAniso;
    loadedThreeTextures[i] = tex;

    tryLoadPhotoFile(i, i + 1);
  }
}

function tryLoadPhotoFile(slotIdx, fileNum) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    // Vẽ ở độ phân giải cao 1024x1024 với thuật toán làm mịn chất lượng cao nhất ('high') để ảnh siêu nét, không bao giờ bị vỡ hạt!
    const HD_SIZE = 1024;
    const c = document.createElement('canvas');
    c.width = HD_SIZE;
    c.height = HD_SIZE;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const minSide = Math.min(img.width, img.height);
    const sx = (img.width - minSide) / 2;
    // Với ảnh chụp dọc, ưu tiên lấy vùng khuôn mặt ở nửa trên (0.22) thay vì cắt chính giữa bụng
    const sy = img.height > img.width ? (img.height - minSide) * 0.22 : (img.height - minSide) / 2;
    ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, HD_SIZE, HD_SIZE);

    // Viền khung mảnh tinh tế giúp các bức ảnh nổi khối sắc nét
    ctx.strokeStyle = 'rgba(255, 235, 200, 0.45)';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, HD_SIZE - 8, HD_SIZE - 8);

    loadedPhotoImages[slotIdx] = c;
    loadedThreeTextures[slotIdx].image = c;
    loadedThreeTextures[slotIdx].needsUpdate = true;
  };

  const candidateUrls = [
    `${fileNum}.jpg`,
    `images/${fileNum}.jpg`,
    `${fileNum}.jpeg`,
    `images/${fileNum}.jpeg`,
    `${fileNum}.png`,
    `images/${fileNum}.png`
  ];
  let curCandidateIdx = 0;

  img.onerror = () => {
    curCandidateIdx++;
    if (curCandidateIdx < candidateUrls.length) {
      img.src = candidateUrls[curCandidateIdx];
    }
  };

  img.src = candidateUrls[0];
}

// ==================== 2. AUDIO ENGINE ====================
const bgMusic = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicBtn');
let isMusicPlaying = false;

function startMusic() {
  bgMusic.volume = 1.0;
  bgMusic.muted = false;
  const p = bgMusic.play();
  if (p !== undefined) {
    p.then(() => {
      isMusicPlaying = true;
      musicBtn.classList.add('playing');
      musicBtn.textContent = '🎵';
    }).catch(() => {});
  }
}

musicBtn.addEventListener('click', () => {
  if (isMusicPlaying) {
    bgMusic.pause();
    isMusicPlaying = false;
    musicBtn.classList.remove('playing');
    musicBtn.textContent = '🔇';
  } else {
    startMusic();
  }
});

// ==================== 3. TRANG ĐẦU: QUẢ ĐỊA CẦU NHỎ 3D ĐANG XOAY ====================
const miniGlobeCanvas = document.getElementById('miniGlobeCanvas');
const mgCtx = miniGlobeCanvas.getContext('2d');
let miniGlobeAngle = 0;

function renderMiniGlobe() {
  const w = miniGlobeCanvas.width;
  const h = miniGlobeCanvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const R = 88;

  mgCtx.clearRect(0, 0, w, h);

  const halo = mgCtx.createRadialGradient(cx, cy, R * 0.75, cx, cy, R * 1.32);
  halo.addColorStop(0, 'rgba(255, 77, 141, 0.55)');
  halo.addColorStop(0.5, 'rgba(157, 78, 221, 0.28)');
  halo.addColorStop(1, 'rgba(255, 77, 141, 0)');
  mgCtx.fillStyle = halo;
  mgCtx.beginPath();
  mgCtx.arc(cx, cy, R * 1.32, 0, Math.PI * 2);
  mgCtx.fill();

  mgCtx.save();
  mgCtx.beginPath();
  mgCtx.arc(cx, cy, R, 0, Math.PI * 2);
  mgCtx.clip();

  const sphereGrad = mgCtx.createRadialGradient(cx - 24, cy - 24, 10, cx, cy, R);
  sphereGrad.addColorStop(0, '#ff8fab');
  sphereGrad.addColorStop(0.38, '#9d4edd');
  sphereGrad.addColorStop(0.78, '#240046');
  sphereGrad.addColorStop(1, '#090114');
  mgCtx.fillStyle = sphereGrad;
  mgCtx.fillRect(cx - R, cy - R, R * 2, R * 2);

  mgCtx.strokeStyle = 'rgba(255, 224, 130, 0.35)';
  mgCtx.lineWidth = 1.1;

  for (let lat = -60; lat <= 60; lat += 30) {
    const latRad = (lat * Math.PI) / 180;
    const y = cy + Math.sin(latRad) * R;
    const rx = Math.cos(latRad) * R;
    mgCtx.beginPath();
    mgCtx.ellipse(cx, y, rx, rx * 0.22, 0, 0, Math.PI * 2);
    mgCtx.stroke();
  }

  for (let i = 0; i < 8; i++) {
    const lon = miniGlobeAngle + (i * Math.PI) / 4;
    mgCtx.beginPath();
    for (let t = -Math.PI / 2; t <= Math.PI / 2; t += 0.12) {
      const x3d = Math.cos(t) * Math.sin(lon) * R;
      const y3d = Math.sin(t) * R;
      const z3d = Math.cos(t) * Math.cos(lon) * R;
      if (z3d > -15) {
        const px = cx + x3d;
        const py = cy + y3d;
        if (t === -Math.PI / 2) mgCtx.moveTo(px, py);
        else mgCtx.lineTo(px, py);
      }
    }
    mgCtx.stroke();
  }

  for (let p = 0; p < 55; p++) {
    const phi = p * 2.39996 + miniGlobeAngle * 1.2;
    const theta = (p / 55 - 0.5) * Math.PI * 0.85;
    const x3 = Math.cos(theta) * Math.sin(phi) * R;
    const y3 = Math.sin(theta) * R;
    const z3 = Math.cos(theta) * Math.cos(phi) * R;
    if (z3 > 0) {
      const alpha = z3 / R;
      mgCtx.fillStyle = p % 3 === 0 ? `rgba(255, 209, 102, ${alpha})` : `rgba(255, 255, 255, ${alpha * 0.9})`;
      mgCtx.beginPath();
      mgCtx.arc(cx + x3, cy + y3, p % 3 === 0 ? 2.4 : 1.5, 0, Math.PI * 2);
      mgCtx.fill();
    }
  }

  mgCtx.restore();

  mgCtx.save();
  mgCtx.translate(cx, cy);
  mgCtx.rotate(-0.38);
  mgCtx.strokeStyle = 'rgba(255, 209, 102, 0.78)';
  mgCtx.lineWidth = 2.4;
  mgCtx.beginPath();
  mgCtx.ellipse(0, 0, R * 1.32, R * 0.34, 0, 0.15, Math.PI - 0.15);
  mgCtx.stroke();
  mgCtx.restore();

  miniGlobeAngle += 0.022;
}

// ==================== 4. ĐOẠN 1: HOA HỒNG THẬT (ẢNH CHỤP STUDIO RÕ TỪNG CÁNH HOA), BÔNG TO BÔNG NHỎ ĐAN XEN PHỦ KÍN MÀN HÌNH ====================
const fxCanvas = document.getElementById('fxCanvas');
const fxCtx = fxCanvas.getContext('2d');
let W = (fxCanvas.width = window.innerWidth);
let H = (fxCanvas.height = window.innerHeight);

const roseSprites = [];
const activeRoses = [];
let rosePhase = 'idle';

// Tải tấm ảnh chụp 4 bông hồng thật (roses-sheet.jpg) và tách nền đen thành PNG trong suốt kèm bóng đổ tự nhiên
function loadRealPhotographicRoses() {
  const sheetImg = new Image();
  sheetImg.crossOrigin = 'anonymous';
  sheetImg.onload = () => {
    roseSprites.length = 0;
    const halfW = Math.floor(sheetImg.width / 2);
    const halfH = Math.floor(sheetImg.height / 2);
    const quadrants = [
      { sx: 8, sy: 8, sw: halfW - 16, sh: halfH - 16 },
      { sx: halfW + 8, sy: 8, sw: halfW - 16, sh: halfH - 16 },
      { sx: 8, sy: halfH + 8, sw: halfW - 16, sh: halfH - 16 },
      { sx: halfW + 8, sy: halfH + 8, sw: halfW - 16, sh: halfH - 16 }
    ];

    quadrants.forEach((q) => {
      const size = 420;
      const rawCanvas = document.createElement('canvas');
      rawCanvas.width = size;
      rawCanvas.height = size;
      const rCtx = rawCanvas.getContext('2d');
      rCtx.drawImage(sheetImg, q.sx, q.sy, q.sw, q.sh, 16, 16, size - 32, size - 32);

      // Tách nền đen (#000000) mượt mà ở mép cánh hoa
      const imgData = rCtx.getImageData(0, 0, size, size);
      const data = imgData.data;
      const cx = size / 2;
      const cy = size / 2;
      const maxRadius = size * 0.46;

      for (let i = 0; i < data.length; i += 4) {
        const px = (i / 4) % size;
        const py = Math.floor(i / 4 / size);
        const dist = Math.hypot(px - cx, py - cy);

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Độ sáng + độ bão hòa màu hồng/kem của cánh hoa
        const lum = Math.max(r, g, b);

        if (dist > maxRadius || lum < 22) {
          data[i + 3] = 0;
        } else if (lum < 48) {
          // Khử răng cưa mượt ở viền ngoài cánh hoa
          data[i + 3] = Math.round(((lum - 22) / 26) * 255);
        }
      }
      rCtx.putImageData(imgData, 0, 0);

      // Vẽ lên Sprite hoàn chỉnh có bóng đổ 3D dưới từng bông hoa để khi xếp lớp bông to - bông nhỏ nổi khối rõ nét
      const finalSprite = document.createElement('canvas');
      finalSprite.width = size;
      finalSprite.height = size;
      const fCtx = finalSprite.getContext('2d');
      fCtx.shadowColor = 'rgba(25, 2, 12, 0.55)';
      fCtx.shadowBlur = 18;
      fCtx.shadowOffsetY = 6;
      fCtx.drawImage(rawCanvas, 0, 0);

      roseSprites.push(finalSprite);
    });
  };
  sheetImg.src = 'roses-sheet.jpg';
}

loadRealPhotographicRoses();

function launchFastGiantRoseBloom(onCompleteAutoTransition) {
  activeRoses.length = 0;
  rosePhase = 'blooming';
  const now = performance.now();
  const maxDist = Math.hypot(W / 2, H / 2) || 1;

  // TẦNG 1: Các bông hồng TO & VỪA (250px - 390px) trải kín nền để không hở bất kỳ khoảng đen nào
  const stepBase = 128;
  const cols = Math.ceil(W / stepBase) + 2;
  const rows = Math.ceil(H / stepBase) + 2;
  const allSpawns = [];

  for (let r = -1; r < rows; r++) {
    for (let c = -1; c < cols; c++) {
      const gx = c * stepBase + (r % 2 === 0 ? 0 : stepBase * 0.5) + (Math.random() - 0.5) * 42;
      const gy = r * stepBase + (Math.random() - 0.5) * 42;
      const d = Math.hypot(gx - W / 2, gy - H / 2);
      // Xen kẽ bông to (310-390px) và bông vừa (210-280px)
      const isBig = (r + c) % 2 === 0;
      const targetSize = isBig ? Math.random() * 80 + 300 : Math.random() * 65 + 210;
      allSpawns.push({ gx, gy, d, targetSize, layerBoost: 0 });
    }
  }

  // TẦNG 2: Các bông hồng NHỎ & VỪA XINH XẮN (95px - 175px) điểm xuyết lên trên để tạo độ tự nhiên "bông to bông nhỏ" rõ từng cánh hoa!
  const accentCount = Math.min(65, Math.floor((W * H) / 16000));
  for (let i = 0; i < accentCount; i++) {
    const gx = Math.random() * (W + 80) - 40;
    const gy = Math.random() * (H + 80) - 40;
    const d = Math.hypot(gx - W / 2, gy - H / 2);
    const targetSize = Math.random() * 75 + 95; // Bông nhỏ & vừa (95px - 170px)
    allSpawns.push({ gx, gy, d, targetSize, layerBoost: 120 });
  }

  // Sắp xếp bông to nở làm nền trước, bông nhỏ nở điểm xuyết lên trên theo làn sóng từ tâm ra ngoài
  allSpawns.sort((a, b) => a.d + a.layerBoost - (b.d + b.layerBoost));

  allSpawns.forEach((item, idx) => {
    const normDist = item.d / maxDist;
    activeRoses.push({
      x: item.gx,
      y: item.gy,
      size: 0,
      targetSize: item.targetSize,
      delay: normDist * 850 + (item.layerBoost ? 220 : 0) + Math.random() * 180,
      born: now,
      rot: Math.random() * Math.PI * 2,
      rotVel: (Math.random() - 0.5) * 0.0025,
      alpha: 1,
      sprite: roseSprites[idx % Math.max(1, roseSprites.length)]
    });
  });

  // Giữ thảm hoa hồng nở rộ lâu hơn (~2.6s) rồi mới tự động chuyển sang Cảnh 2
  setTimeout(() => {
    if (onCompleteAutoTransition) onCompleteAutoTransition();
    setTimeout(() => {
      rosePhase = 'dissolving';
    }, 550);
  }, 2600);
}

// ==================== 5. ĐOẠN 2: MẢNH GHÉP TRÁI TIM ĐÚNG HÌNH DẠNG JIGSAW PUZZLE (CÓ MẤU LỒI / LÕM) ====================
const heartMosaicCanvas = document.getElementById('heartMosaicCanvas');
const hmCtx = heartMosaicCanvas.getContext('2d');
const jigsawPieces = [];
let mosaicAnimStart = 0;

// Vẽ cạnh mảnh ghép Jigsaw chuẩn (có cổ thắt và đầu tròn lồi/lõm)
// dir = 1 (mấu lồi ra ngoài), dir = -1 (khớp lõm vào trong), dir = 0 (cạnh thẳng)
function drawJigsawEdge(ctx, x1, y1, x2, y2, dir) {
  if (dir === 0) {
    ctx.lineTo(x2, y2);
    return;
  }
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const nx = -dy / len * dir;
  const ny = dx / len * dir;

  const p = (along, out) => [
    x1 + dx * along + nx * len * out,
    y1 + dy * along + ny * len * out
  ];

  const [p1x, p1y] = p(0.34, 0);
  const [c1x, c1y] = p(0.28, -0.04);
  const [c2x, c2y] = p(0.26, 0.24);
  const [topX, topY] = p(0.5, 0.26);
  const [c3x, c3y] = p(0.74, 0.24);
  const [c4x, c4y] = p(0.72, -0.04);
  const [p2x, p2y] = p(0.66, 0);

  ctx.lineTo(p1x, p1y);
  ctx.bezierCurveTo(c1x, c1y, c2x, c2y, topX, topY);
  ctx.bezierCurveTo(c3x, c3y, c4x, c4y, p2x, p2y);
  ctx.lineTo(x2, y2);
}

function traceJigsawPiecePath(ctx, x, y, w, h, tabs) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  drawJigsawEdge(ctx, x, y, x + w, y, tabs.top);
  drawJigsawEdge(ctx, x + w, y, x + w, y + h, tabs.right);
  drawJigsawEdge(ctx, x + w, y + h, x, y + h, tabs.bottom);
  drawJigsawEdge(ctx, x, y + h, x, y, tabs.left);
  ctx.closePath();
}

// Ma trận hình Trái Tim cân đối 9 cột x 8 hàng để mỗi mảnh ghép Jigsaw đủ lớn, nhìn rõ mấu lồi/lõm!
const JIGSAW_HEART_MASK = [
  [0, 1, 1, 0, 0, 0, 1, 1, 0],
  [1, 1, 1, 1, 0, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 0]
];

function initJigsawHeartMosaic() {
  jigsawPieces.length = 0;
  const cw = heartMosaicCanvas.width;
  const ch = heartMosaicCanvas.height;
  const rows = JIGSAW_HEART_MASK.length;
  const cols = JIGSAW_HEART_MASK[0].length;

  const gridW = cw - 144;
  const gridH = ch - 144;
  const cellW = gridW / cols;
  const cellH = gridH / rows;
  const offsetX = 72;
  const offsetY = 72;

  const hEdges = Array.from({ length: rows + 1 }, () => Array(cols).fill(0));
  const vEdges = Array.from({ length: rows }, () => Array(cols + 1).fill(0));

  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c < cols; c++) {
      hEdges[r][c] = (r + c) % 2 === 0 ? 1 : -1;
    }
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c <= cols; c++) {
      vEdges[r][c] = (r + c) % 2 === 0 ? -1 : 1;
    }
  }

  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (JIGSAW_HEART_MASK[r][c] === 1) {
        const tx = offsetX + c * cellW;
        const ty = offsetY + r * cellH;
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 480 + 280;

        const tabs = {
          top: hEdges[r][c],
          bottom: -hEdges[r + 1][c],
          left: vEdges[r][c],
          right: -vEdges[r][c + 1]
        };

        const isCorePiece = r >= 1 && r <= 5 && c >= 2 && c <= 6 && !(r === 1 && c === 4);

        jigsawPieces.push({
          r,
          c,
          targetX: tx,
          targetY: ty,
          startX: tx + Math.cos(angle) * dist,
          startY: ty + Math.sin(angle) * dist,
          w: cellW,
          h: cellH,
          tabs,
          isCorePiece,
          photoIdx: idx % TOTAL_PHOTOS,
          delay: idx * 24,
          rotStart: (Math.random() - 0.5) * 1.6
        });
        idx++;
      }
    }
  }
}

function renderJigsawHeartMosaic(now) {
  const cw = heartMosaicCanvas.width;
  const ch = heartMosaicCanvas.height;
  hmCtx.clearRect(0, 0, cw, ch);
  hmCtx.imageSmoothingEnabled = true;
  hmCtx.imageSmoothingQuality = 'high';

  const elapsedAll = now - mosaicAnimStart;

  jigsawPieces.forEach((p) => {
    const tLocal = Math.max(0, Math.min(1, (elapsedAll - p.delay) / 1450));
    if (tLocal <= 0) return;

    const ease = 1 - Math.pow(1 - tLocal, 3);
    const curX = p.startX + (p.targetX - p.startX) * ease;
    const curY = p.startY + (p.targetY - p.startY) * ease;
    const curRot = p.rotStart * (1 - ease);

    hmCtx.save();
    hmCtx.globalAlpha = Math.min(1, tLocal * 1.3);
    hmCtx.translate(curX + p.w / 2, curY + p.h / 2);
    hmCtx.rotate(curRot);

    hmCtx.shadowColor = 'rgba(255, 77, 141, 0.45)';
    hmCtx.shadowBlur = (1 - ease) * 20 + 6;

    traceJigsawPiecePath(hmCtx, -p.w / 2, -p.h / 2, p.w, p.h, p.tabs);
    hmCtx.clip();

    if (p.isCorePiece) {
      const mainImg = loadedPhotoImages[0];
      if (mainImg) {
        hmCtx.drawImage(
          mainImg,
          -p.targetX - p.w / 2 + 150,
          -p.targetY - p.h / 2 + 90,
          cw - 300,
          ch - 180
        );
      }
    } else {
      const tileImg = loadedPhotoImages[p.photoIdx];
      if (tileImg) {
        const pad = p.w * 0.28;
        hmCtx.drawImage(tileImg, -p.w / 2 - pad, -p.h / 2 - pad, p.w + pad * 2, p.h + pad * 2);
      }
    }

    hmCtx.strokeStyle = 'rgba(255, 230, 180, 0.82)';
    hmCtx.lineWidth = 3.6;
    traceJigsawPiecePath(hmCtx, -p.w / 2, -p.h / 2, p.w, p.h, p.tabs);
    hmCtx.stroke();

    hmCtx.strokeStyle = 'rgba(80, 10, 40, 0.48)';
    hmCtx.lineWidth = 1.6;
    hmCtx.stroke();

    hmCtx.restore();
  });
}

// Xây dựng lịch chuẩn Tháng 10/2026 (Thứ 2 -> Chủ Nhật):
// - 01/10/2026 là Thứ Năm (T5) -> 3 ô trống đầu tuần (T2, T3, T4)
// - 20/10/2026 là Thứ Ba (T3)
// - 31/10/2026 là Thứ Bảy (T7)
function buildCalendarDOM() {
  const calWrap = document.getElementById('calendarDays');
  calWrap.innerHTML = '';
  const startOffset = 3; // Cột 0=T2, 1=T3, 2=T4, 3=T5 (01/10/2026)
  for (let e = 0; e < startOffset; e++) {
    calWrap.appendChild(document.createElement('div'));
  }
  for (let d = 1; d <= 31; d++) {
    const dayEl = document.createElement('div');
    dayEl.className = 'cal-day' + (d === 20 ? ' special-20' : '');
    dayEl.textContent = d === 20 ? '20❤️' : d;
    calWrap.appendChild(dayEl);
  }
}

const meadowCanvas = document.getElementById('meadowFlowersCanvas');
const mdCtx = meadowCanvas.getContext('2d');

function renderMeadowFlowers(now) {
  const mw = meadowCanvas.width;
  const mh = meadowCanvas.height;
  mdCtx.clearRect(0, 0, mw, mh);

  const count = 18;
  for (let i = 0; i < count; i++) {
    const bx = (i + 0.5) * (mw / count);
    const sway = Math.sin(now * 0.0022 + i * 0.9) * 6;
    const stemH = 26 + (i % 3) * 10;
    const fx = bx + sway;
    const fy = mh - stemH;

    mdCtx.strokeStyle = 'rgba(130, 220, 160, 0.55)';
    mdCtx.lineWidth = 2;
    mdCtx.beginPath();
    mdCtx.moveTo(bx, mh);
    mdCtx.quadraticCurveTo(bx + sway * 0.5, mh - stemH * 0.5, fx, fy);
    mdCtx.stroke();

    const colors = ['#ff8fab', '#ffd166', '#c77dff', '#ffffff', '#ff4d8d'];
    const col = colors[i % colors.length];
    mdCtx.save();
    mdCtx.translate(fx, fy);
    mdCtx.shadowColor = col;
    mdCtx.shadowBlur = 10;
    mdCtx.fillStyle = col;
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2 + now * 0.0005;
      mdCtx.beginPath();
      mdCtx.ellipse(Math.cos(a) * 6, Math.sin(a) * 6, 5, 3, a, 0, Math.PI * 2);
      mdCtx.fill();
    }
    mdCtx.fillStyle = '#ffd166';
    mdCtx.beginPath();
    mdCtx.arc(0, 0, 3, 0, Math.PI * 2);
    mdCtx.fill();
    mdCtx.restore();
  }
}

buildCalendarDOM();
initJigsawHeartMosaic();

// ==================== 6. ENGINE VŨ TRỤ 3D WEBGL (THREE.JS) XUYÊN SUỐT ====================
const webglCanvas = document.getElementById('webglCanvas');
const renderer = new THREE.WebGLRenderer({ canvas: webglCanvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x060112, 0.00055);

const camera = new THREE.PerspectiveCamera(56, window.innerWidth / window.innerHeight, 1, 4000);

function syncViewportAndCamera() {
  W = fxCanvas.width = window.innerWidth;
  H = fxCanvas.height = window.innerHeight;
  const aspect = W / Math.max(1, H);
  camera.aspect = aspect;

  if (aspect < 0.85) {
    // Điện thoại cầm dọc: Nâng camera Y lên +26 để đẩy Quả Địa Cầu và các cảnh 3D xuống dưới, cách xa dòng chữ trên hoàn toàn không lo bị che!
    camera.position.set(0, 26, Math.min(640, Math.round(315 / Math.max(0.44, aspect))));
  } else if (H < 540 && aspect > 1.1) {
    // Điện thoại xoay ngang
    camera.position.set(0, 10, 425);
  } else {
    // Máy tính / Tablet lớn
    camera.position.set(0, 16, 398);
  }

  camera.updateProjectionMatrix();
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
}

syncViewportAndCamera();

const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xff8fab, 1.4, 1200);
pointLight.position.set(80, 120, 260);
scene.add(pointLight);

function createStarGlowTexture() {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255, 255, 255, 1)');
  g.addColorStop(0.25, 'rgba(255, 210, 235, 0.85)');
  g.addColorStop(0.6, 'rgba(255, 77, 141, 0.25)');
  g.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
const starGlowTex = createStarGlowTexture();

// 6.1 DẢI NGÂN HÀ XOẮN ỐC 3D
const galaxyGroup = new THREE.Group();
scene.add(galaxyGroup);

function buildMilkyWayUniverse() {
  const starCount = 5500;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const palette = [
    new THREE.Color('#ffffff'),
    new THREE.Color('#ff8fab'),
    new THREE.Color('#ffd166'),
    new THREE.Color('#c77dff'),
    new THREE.Color('#72efdd')
  ];

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    if (i < 3200) {
      const r = Math.pow(Math.random(), 1.3) * 1450 + 60;
      const branchAngle = ((i % 3) / 3) * Math.PI * 2;
      const spinAngle = r * 0.0035;
      const spread = (Math.random() - 0.5) * 240;

      positions[i3] = Math.cos(branchAngle + spinAngle) * r + spread;
      positions[i3 + 1] = (Math.random() - 0.5) * 320 - r * 0.08;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r - 350 + spread;
    } else {
      positions[i3] = (Math.random() - 0.5) * 2600;
      positions[i3 + 1] = (Math.random() - 0.5) * 1800;
      positions[i3 + 2] = (Math.random() - 0.5) * 2200 - 200;
    }

    const col = palette[i % palette.length];
    colors[i3] = col.r;
    colors[i3 + 1] = col.g;
    colors[i3 + 2] = col.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 9,
    map: starGlowTex,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  galaxyGroup.add(new THREE.Points(geo, mat));
}
buildMilkyWayUniverse();

// 6.2 SAO THỔ 3D CÓ VÀNH ĐAI QUAY TRÒN Ở TÂM
const saturnGroup = new THREE.Group();
saturnGroup.visible = false;
scene.add(saturnGroup);

function build3DSaturn() {
  const satCanvas = document.createElement('canvas');
  satCanvas.width = 512;
  satCanvas.height = 256;
  const sCtx = satCanvas.getContext('2d');
  const g = sCtx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#5a189a');
  g.addColorStop(0.2, '#ff8fab');
  g.addColorStop(0.4, '#ffd166');
  g.addColorStop(0.5, '#ff4d8d');
  g.addColorStop(0.65, '#ffe5ec');
  g.addColorStop(0.8, '#9d4edd');
  g.addColorStop(1, '#3c096c');
  sCtx.fillStyle = g;
  sCtx.fillRect(0, 0, 512, 256);

  const planetGeo = new THREE.SphereGeometry(48, 48, 48);
  const planetMat = new THREE.MeshStandardMaterial({
    map: new THREE.CanvasTexture(satCanvas),
    roughness: 0.35,
    metalness: 0.15,
    emissive: new THREE.Color('#ff2a75'),
    emissiveIntensity: 0.32
  });
  saturnGroup.add(new THREE.Mesh(planetGeo, planetMat));

  const ringCanvas = document.createElement('canvas');
  ringCanvas.width = 256;
  ringCanvas.height = 64;
  const rCtx = ringCanvas.getContext('2d');
  const rg = rCtx.createLinearGradient(0, 0, 256, 0);
  rg.addColorStop(0, 'rgba(255, 209, 102, 0)');
  rg.addColorStop(0.2, 'rgba(255, 209, 102, 0.85)');
  rg.addColorStop(0.45, 'rgba(255, 77, 141, 0.75)');
  rg.addColorStop(0.52, 'rgba(20, 5, 35, 0.15)');
  rg.addColorStop(0.65, 'rgba(255, 182, 213, 0.9)');
  rg.addColorStop(0.9, 'rgba(199, 125, 255, 0.6)');
  rg.addColorStop(1, 'rgba(255, 77, 141, 0)');
  rCtx.fillStyle = rg;
  rCtx.fillRect(0, 0, 256, 64);

  const ringGeo = new THREE.RingGeometry(64, 138, 96);
  const pos = ringGeo.attributes.position;
  const uvs = ringGeo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const d = (Math.hypot(vx, vy) - 64) / (138 - 64);
    uvs.setXY(i, d, 0.5);
  }

  const ringMat = new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(ringCanvas),
    side: THREE.DoubleSide,
    transparent: true,
    blending: THREE.AdditiveBlending
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = Math.PI * 0.42;
  saturnGroup.add(ringMesh);

  saturnGroup.rotation.z = 0.26;
  saturnGroup.rotation.x = 0.18;
}
build3DSaturn();

// 6.3 CÁC DÒNG CHỮ 3D XOAY VÒNG QUANH SAO THỔ
const textOrbitGroup = new THREE.Group();
textOrbitGroup.visible = false;
scene.add(textOrbitGroup);

function createTextSprite(text) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 96;
  const ctx = c.getContext('2d');

  ctx.fillStyle = 'rgba(35, 8, 60, 0.65)';
  ctx.strokeStyle = 'rgba(255, 209, 102, 0.75)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(8, 12, 496, 72, 36);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#fff5f8';
  ctx.shadowColor = '#ff4d8d';
  ctx.shadowBlur = 12;
  ctx.font = 'bold 28px Montserrat, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 48);

  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(156, 30, 1);
  return sprite;
}

const orbitSprites = [];
ORBIT_TEXT_BANNERS.forEach((txt, i) => {
  const sp = createTextSprite(txt);
  const angle = (i / ORBIT_TEXT_BANNERS.length) * Math.PI * 2;
  const radius = 215 + (i % 3) * 45;
  const y = ((i % 4) - 1.5) * 48;
  sp.userData = { angle, radius, y, speed: 0.008 + (i % 3) * 0.003 };
  textOrbitGroup.add(sp);
  orbitSprites.push(sp);
});

// ==================== 6.4 QUẢ ĐỊA CẦU SÁT KÍN & MÀN HÌNH LÕM VÒNG CUNG CHẠY TỪ TRÁI QUA PHẢI ====================
// Ta tách riêng:
// A) 96 mảnh cầu cong toán học (`globePatches`) cho Quả Địa Cầu SÁT KÍN 100% KHÔNG HỞ KHE TRỐNG.
// B) 24 tấm ảnh chữ nhật phẳng phiu, sắc nét (`arcCardMeshes` xếp 3 hàng x 8 cột) cho Màn Hình Lõm Vòng Cung (giữa lõm vào, hai bên cong ôm) chạy đều tăm tắp theo 1 hướng TỪ TRÁI QUA PHẢI!
const globeGroup = new THREE.Group();
globeGroup.visible = false;
scene.add(globeGroup);

const concaveArcGroup = new THREE.Group();
concaveArcGroup.visible = false;
scene.add(concaveArcGroup);

const GLOBE_ROWS = 8;
const GLOBE_COLS = 12;
const TOTAL_GLOBE_PATCHES = GLOBE_ROWS * GLOBE_COLS;
const GLOBE_RADIUS = 152;
const globePatches = [];

const ARC_ROWS = 3;
const ARC_COLS = 9;
const TOTAL_ARC_CARDS = ARC_ROWS * ARC_COLS; // 27 tấm ảnh chuẩn tỉ lệ 1:1 rõ nét cho Màn Hình Lõm Vòng Cung!
const arcCards = [];

function buildGlobeAndConcaveCards() {
  // 1. Tạo 96 mảnh cầu cong khít cho Cảnh Sao Thổ & Cảnh Quả Địa Cầu Sát Kín
  const dPhi = (Math.PI * 2) / GLOBE_COLS;
  const minTheta = 0.08;
  const maxTheta = Math.PI - 0.08;
  const dTheta = (maxTheta - minTheta) / GLOBE_ROWS;

  let idx = 0;
  for (let r = 0; r < GLOBE_ROWS; r++) {
    for (let c = 0; c < GLOBE_COLS; c++) {
      const phiStart = c * dPhi;
      const thetaStart = minTheta + r * dTheta;

      const geo = new THREE.SphereGeometry(
        GLOBE_RADIUS,
        8,
        6,
        phiStart,
        dPhi * 1.008,
        thetaStart,
        dTheta * 1.008
      );

      const midPhi = phiStart + dPhi / 2;
      const midTheta = thetaStart + dTheta / 2;
      const dirX = -Math.cos(midPhi) * Math.sin(midTheta);
      const dirY = Math.cos(midTheta);
      const dirZ = Math.sin(midPhi) * Math.sin(midTheta);

      const patchCenter = new THREE.Vector3(dirX * GLOBE_RADIUS, dirY * GLOBE_RADIUS, dirZ * GLOBE_RADIUS);
      geo.translate(-patchCenter.x, -patchCenter.y, -patchCenter.z);

      const mat = new THREE.MeshBasicMaterial({
        map: loadedThreeTextures[idx % TOTAL_PHOTOS],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1
      });

      const mesh = new THREE.Mesh(geo, mat);
      const orbitAngle = (idx / TOTAL_GLOBE_PATCHES) * Math.PI * 4;
      const orbitR = 215 + (idx % 5) * 48;

      mesh.userData = {
        globePos: patchCenter.clone(),
        orbitAngle,
        orbitR,
        orbitY: ((idx % 7) - 3) * 42
      };

      globeGroup.add(mesh);
      globePatches.push(mesh);
      idx++;
    }
  }

  // 2. Tạo 27 tấm ảnh chuẩn tỉ lệ 1:1 to rõ nét cho Màn Hình Lõm Vòng Cung (3 hàng ngang)
  const cardW = 88;
  const cardH = 88;
  const cardGeo = new THREE.PlaneGeometry(cardW, cardH, 8, 1);

  for (let i = 0; i < TOTAL_ARC_CARDS; i++) {
    const r = Math.floor(i / ARC_COLS); // Hàng 0 (trên), 1 (giữa), 2 (dưới)
    const c = i % ARC_COLS;            // Cột 0..8

    const mat = new THREE.MeshBasicMaterial({
      map: loadedThreeTextures[i % TOTAL_PHOTOS],
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1
    });

    const card = new THREE.Mesh(cardGeo, mat);
    card.userData = {
      row: r,
      col: c,
      photoIndex: i % TOTAL_PHOTOS,
      // Tiến trình ban đầu dọc theo vòng cung [0..1]
      progress: c / ARC_COLS,
      // Dùng cho cảnh Thả rơi đung đưa & bay đa hướng
      isTopDropper: r === 0,
      dropY: (1 - r) * 94,
      vertY: ((c / (ARC_COLS - 1)) - 0.5) * 440,
      vertDir: (c % 2 === 0) ? 1 : -1,
      swayPhase: i * 1.15
    };

    concaveArcGroup.add(card);
    arcCards.push(card);
  }
}

loadAll30Photos(renderer.capabilities.getMaxAnisotropy());
buildGlobeAndConcaveCards();

// ==================== TÍNH NĂNG CHẠM PHÓNG TO ẢNH & TÍCH ĐÚP ĐỂ THU VỀ ====================
let focusedCard = null;
let isStreamPaused = false;
let pointerDownPos = { x: 0, y: 0, time: 0 };
let lastTapTime = 0;
let isTouchTriggered = false;
const raycaster = new THREE.Raycaster();
const photoZoomOverlay = document.getElementById('photoZoomOverlay');

function zoomCard(card) {
  if (focusedCard && focusedCard !== card) {
    focusedCard.renderOrder = 0;
  }
  focusedCard = card;
  focusedCard.renderOrder = 999;
  isStreamPaused = true;
  if (photoZoomOverlay) photoZoomOverlay.classList.remove('hidden');
}

function unzoomCard() {
  if (!focusedCard) return;
  focusedCard.renderOrder = 0;
  focusedCard = null;
  isStreamPaused = false;
  if (photoZoomOverlay) photoZoomOverlay.classList.add('hidden');
}

if (photoZoomOverlay) {
  photoZoomOverlay.addEventListener('click', (e) => {
    e.stopPropagation();
    unzoomCard();
  });
  photoZoomOverlay.addEventListener('touchend', (e) => {
    e.stopPropagation();
    e.preventDefault();
    unzoomCard();
  });
}

function isInteractiveDomTarget(target) {
  if (!target) return false;
  return !!target.closest('button, a, .cute-envelope, .opened-letter-card, .restaurant-card, #topHud, .intro-content, .photo-card-wrap');
}

function getPointerNDC(clientX, clientY) {
  return new THREE.Vector2(
    (clientX / window.innerWidth) * 2 - 1,
    -(clientY / window.innerHeight) * 2 + 1
  );
}

function handlePointerTap(clientX, clientY, targetEl) {
  if (currentPhase !== 'concave_wall' && currentPhase !== 'falling_letter') return;
  if (isInteractiveDomTarget(targetEl)) return;

  const now = performance.now();
  const timeSinceLastTap = now - lastTapTime;

  // Tích đúp (double-tap / double-click): thu ảnh về và tiếp tục chạy
  if (timeSinceLastTap < 380) {
    if (focusedCard) {
      unzoomCard();
      lastTapTime = 0;
      return;
    }
  }
  lastTapTime = now;

  const ndc = getPointerNDC(clientX, clientY);
  raycaster.setFromCamera(ndc, camera);
  const intersects = raycaster.intersectObjects(arcCards, false);

  if (intersects.length > 0) {
    const hitCard = intersects[0].object;
    if (focusedCard === hitCard) {
      // Nhấp vào ảnh đang phóng to: chờ tích đúp hoặc chạm ra ngoài
    } else {
      zoomCard(hitCard);
    }
  } else {
    // Chạm vào khoảng trống vũ trụ
    if (focusedCard) {
      unzoomCard();
    }
  }
}

window.addEventListener('touchstart', (e) => {
  if (e.touches && e.touches.length === 1) {
    pointerDownPos = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: performance.now() };
  }
}, { passive: true });

window.addEventListener('touchend', (e) => {
  if (e.changedTouches && e.changedTouches.length === 1) {
    isTouchTriggered = true;
    setTimeout(() => { isTouchTriggered = false; }, 400);
    const t = e.changedTouches[0];
    const dx = Math.abs(t.clientX - pointerDownPos.x);
    const dy = Math.abs(t.clientY - pointerDownPos.y);
    if (dx < 16 && dy < 16) {
      handlePointerTap(t.clientX, t.clientY, e.target);
    }
  }
}, { passive: true });

window.addEventListener('mousedown', (e) => {
  pointerDownPos = { x: e.clientX, y: e.clientY, time: performance.now() };
});

window.addEventListener('click', (e) => {
  if (isTouchTriggered) return;
  const dx = Math.abs(e.clientX - pointerDownPos.x);
  const dy = Math.abs(e.clientY - pointerDownPos.y);
  if (dx < 14 && dy < 14) {
    handlePointerTap(e.clientX, e.clientY, e.target);
  }
});

window.addEventListener('dblclick', (e) => {
  if (isInteractiveDomTarget(e.target)) return;
  if (focusedCard) {
    unzoomCard();
  }
});

// ==================== 7. KỊCH BẢN CHUYỂN CẢNH TỰ ĐỘNG LIÊN HOÀN ====================
let currentPhase = 'intro';
let phaseStartTime = 0;
const stageTimers = [];

function clearStageTimers() {
  while (stageTimers.length) {
    clearTimeout(stageTimers.pop());
  }
}

function showDomScene(id) {
  document.querySelectorAll('.scene').forEach((el) => {
    el.classList.toggle('active', el.id === id);
  });
}

// BƯỚC 1: Bấm vào Quả Địa Cầu Nhỏ -> Nở hoa hồng TO, THẬT, PHỦ KÍN 100% MÀN HÌNH -> Tự chuyển sang Cảnh Lịch!
document.getElementById('miniGlobeBtn').addEventListener('click', () => {
  sendTelegramEvent('globe', '🌍 <b>Vợ vừa bấm Quả Địa Cầu Vũ Trụ!</b>\n🎵 Nhạc điệp khúc <i>"Hành trình mình yêu nhau..."</i> đang vang lên!');
  startMusic();
  document.getElementById('introContent').style.opacity = '0';
  document.getElementById('introContent').style.transform = 'scale(0.92)';

  launchFastGiantRoseBloom(() => {
    currentPhase = 'calendar';
    mosaicAnimStart = performance.now();
    showDomScene('sceneCalendar');
  });
});

// BƯỚC 2: Bấm vào Mảnh Ghép Trái Tim -> Chuỗi Vũ Trụ 3D Liên Hoàn!
function startFull3DCosmicJourney() {
  sendTelegramEvent('cosmos', '💖 <b>Vợ vừa bấm Mảnh Ghép Trái Tim!</b>\n🌌 Đang bước vào Hành trình dải ngân hà & 49 bức ảnh kỷ niệm 5 năm!');
  clearStageTimers();
  if (focusedCard) unzoomCard();
  showDomScene('sceneCosmos');
  document.getElementById('interleavedBanner').classList.remove('dimmed');
  document.getElementById('letterOverlay').classList.add('hidden');
  document.getElementById('openedLetterCard').classList.add('hidden');
  const restModal = document.getElementById('restaurantModal');
  if (restModal) restModal.classList.add('hidden');
  document.getElementById('cuteEnvelope').style.display = 'block';
  document.getElementById('cuteEnvelope').classList.remove('opening');

  // --- GIAI ĐOẠN A (~5.8 GIÂY): SAO THỔ XOAY Ở TÂM + 30 ẢNH & DÒNG CHỮ XOAY VÒNG CHẬM RÃI ---
  currentPhase = 'saturn_orbit';
  phaseStartTime = performance.now();
  saturnGroup.visible = true;
  saturnGroup.scale.set(1, 1, 1);
  textOrbitGroup.visible = true;
  globeGroup.visible = true;
  globeGroup.rotation.set(0, 0, 0);
  concaveArcGroup.visible = false;

  // --- GIAI ĐOẠN B (~10.8 GIÂY): ẢNH CHỤM THÀNH QUẢ ĐỊA CẦU SÁT KÍN & QUAY ĐỦ 360 ĐỘ HIỂN THỊ ĐỦ 100% TẤT CẢ 49 ẢNH ---
  stageTimers.push(
    setTimeout(() => {
      currentPhase = 'converge_globe';
      phaseStartTime = performance.now();
      textOrbitGroup.visible = false;
    }, 7700)
  );

  // --- GIAI ĐOẠN C (~15 GIÂY): BUNG RA MÀN HÌNH LÕM VÒNG CUNG, CUỘN ĐẦY ĐỦ TRỌN VẸN TOÀN BỘ 49 BỨC ẢNH ---
  stageTimers.push(
    setTimeout(() => {
      currentPhase = 'concave_wall';
      phaseStartTime = performance.now();
      saturnGroup.visible = false;
      globeGroup.visible = false;
      concaveArcGroup.visible = true;

      // Đặt các tấm ảnh của Màn Hình Lõm bắt đầu bung ra từ tâm Quả Địa Cầu (0,0,0) để chuyển cảnh siêu mượt!
      arcCards.forEach((card, i) => {
        card.position.set((Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80);
        card.rotation.set(0, 0, 0);
        card.scale.set(1, 1, 1);
        card.material.opacity = 1;
        card.userData.photoIndex = i % TOTAL_PHOTOS;
        card.material.map = loadedThreeTextures[card.userData.photoIndex];
        card.material.needsUpdate = true;
        card.userData.progress = (i % ARC_COLS) / ARC_COLS;
        card.userData.dropY = (1 - card.userData.row) * 94;
      });
    }, 18500)
  );

  // --- GIAI ĐOẠN D: DẢI ĐỀU ẢNH MỜ DƯỚI NỀN Ở CẢ TRÊN VÀ DƯỚI + HIỆN PHONG THƯ TÌNH CẢM ---
  stageTimers.push(
    setTimeout(() => {
      function tryTransitionToLetter() {
        if (focusedCard) {
          const waitT = setTimeout(tryTransitionToLetter, 2200);
          stageTimers.push(waitT);
          return;
        }
        currentPhase = 'falling_letter';
        phaseStartTime = performance.now();

        setTimeout(() => {
          // Ẩn thanh tiêu đề phía trên khi hiện phong thư để không bao giờ đè chữ trên điện thoại
          document.getElementById('interleavedBanner').classList.add('dimmed');
          document.getElementById('letterOverlay').classList.remove('hidden');
        }, 2500);
      }
      tryTransitionToLetter();
    }, 33500)
  );
}

document.getElementById('toCosmosBtn').addEventListener('click', startFull3DCosmicJourney);
document.getElementById('heartMosaicCanvas').addEventListener('click', startFull3DCosmicJourney);

// BƯỚC 3: Mở Phong Thư -> Thiệp chữ chạy, ảnh vẫn chạy mờ ở dưới nền vũ trụ!
const cuteEnvelope = document.getElementById('cuteEnvelope');
const openedLetterCard = document.getElementById('openedLetterCard');
const typewriterText = document.getElementById('typewriterText');

const LOVE_LETTER_CONTENT =
  'Hôm nay là ngày 20/10 — cũng là tròn 5 năm (1.826 ngày) hai đứa mình bên nhau.\n\n' +
  '✨ Chúc mừng nửa thập kỷ của chúng ta!\n' +
  '💖 Ck yêu vk rất nhiều.\n' +
  '🌸 Cảm ơn vk vì đã luôn bên ck, dịu dàng và bao dung suốt 5 năm qua.\n' +
  '♾️ Chúng ta sẽ mãi bên nhau, nắm chặt tay nhau yêu say đắm như ngày đầu, vk yêu nhé!';

let letterTimer = null;

function openEnvelopeAndWriteLetter() {
  sendTelegramEvent('letter', '💌 <b>Vợ vừa mở Phong Bì Thư Tình!</b>\n✨ Đang chăm chú đọc những dòng chữ ck gửi gắm!');
  cuteEnvelope.classList.add('opening');
  setTimeout(() => {
    cuteEnvelope.style.display = 'none';
    openedLetterCard.classList.remove('hidden');

    if (letterTimer) clearInterval(letterTimer);
    typewriterText.textContent = '';
    let idx = 0;
    letterTimer = setInterval(() => {
      if (idx < LOVE_LETTER_CONTENT.length) {
        typewriterText.textContent += LOVE_LETTER_CONTENT[idx];
        idx++;
      } else {
        clearInterval(letterTimer);
      }
    }, 35);
  }, 550);
}

cuteEnvelope.addEventListener('click', openEnvelopeAndWriteLetter);
document.getElementById('replaySequenceBtn').addEventListener('click', startFull3DCosmicJourney);

// BƯỚC 4: Mở / Đóng Thiệp Hẹn Gặp Vk Tối Mai Tại Nhà Hàng Man Tang Guo
const restaurantModal = document.getElementById('restaurantModal');
const openRestaurantBtn = document.getElementById('openRestaurantBtn');
const backToLetterBtn = document.getElementById('backToLetterBtn');
const closeRestaurantIconBtn = document.getElementById('closeRestaurantIconBtn');
const topHudEl = document.getElementById('topHud');

function showRestaurantModal() {
  sendTelegramEvent('restaurant', '🥂 <b>Vợ vừa bấm xem Lời Hẹn Nhà Hàng Man Tang Guo The Loop!</b>\n🍲 Lời hẹn tối mai đã mở ra trước mắt vợ yêu! Chuẩn bị đón vợ đi ăn tiệc nhé sếp! ❤️');
  if (!restaurantModal) return;
  restaurantModal.classList.remove('hidden');
  if (topHudEl) topHudEl.style.opacity = '0';
}

function hideRestaurantModal() {
  if (!restaurantModal) return;
  restaurantModal.classList.add('hidden');
  if (topHudEl) topHudEl.style.opacity = '1';
}

if (openRestaurantBtn) {
  openRestaurantBtn.addEventListener('click', showRestaurantModal);
}
if (backToLetterBtn) {
  backToLetterBtn.addEventListener('click', hideRestaurantModal);
}
if (closeRestaurantIconBtn) {
  closeRestaurantIconBtn.addEventListener('click', hideRestaurantModal);
}
if (restaurantModal) {
  restaurantModal.addEventListener('click', (e) => {
    if (e.target === restaurantModal) {
      hideRestaurantModal();
    }
  });
}

let bannerIdx = 0;
setInterval(() => {
  bannerIdx = (bannerIdx + 1) % INTERLEAVED_MESSAGES.length;
  const item = INTERLEAVED_MESSAGES[bannerIdx];
  document.getElementById('bannerStep').textContent = item.step;
  document.getElementById('bannerMain').textContent = item.main;
  document.getElementById('bannerSub').textContent = item.sub;
}, 5500);

// ==================== 8. SAO BĂNG CHÉO CHÂN THỰC ====================
const shootingStars2D = [];
function updateAndDrawShootingStars() {
  if (Math.random() < 0.03 && shootingStars2D.length < 4) {
    shootingStars2D.push({
      x: Math.random() * W * 0.9,
      y: Math.random() * H * 0.45,
      len: Math.random() * 110 + 70,
      speed: Math.random() * 12 + 10,
      angle: Math.PI / 5.2,
      alpha: 1
    });
  }

  for (let i = shootingStars2D.length - 1; i >= 0; i--) {
    const st = shootingStars2D[i];
    st.x += Math.cos(st.angle) * st.speed;
    st.y += Math.sin(st.angle) * st.speed;
    st.alpha -= 0.018;
    if (st.alpha <= 0) {
      shootingStars2D.splice(i, 1);
      continue;
    }

    const tx = st.x - Math.cos(st.angle) * st.len;
    const ty = st.y - Math.sin(st.angle) * st.len;
    const g = fxCtx.createLinearGradient(st.x, st.y, tx, ty);
    g.addColorStop(0, `rgba(255, 250, 255, ${st.alpha})`);
    g.addColorStop(0.35, `rgba(255, 182, 213, ${st.alpha * 0.7})`);
    g.addColorStop(1, 'rgba(255, 77, 141, 0)');

    fxCtx.strokeStyle = g;
    fxCtx.lineWidth = 2.4;
    fxCtx.beginPath();
    fxCtx.moveTo(st.x, st.y);
    fxCtx.lineTo(tx, ty);
    fxCtx.stroke();
  }
}

// ==================== 9. VÒNG LẶP RENDER 60FPS TỔNG HỢP ====================
function masterRenderLoop(now) {
  galaxyGroup.rotation.y += 0.0005;
  galaxyGroup.rotation.x = Math.sin(now * 0.00016) * 0.06;

  if (currentPhase === 'intro') {
    renderMiniGlobe();
  }

  if (currentPhase === 'calendar') {
    renderJigsawHeartMosaic(now);
    renderMeadowFlowers(now);
  }

  const dtPhase = (now - phaseStartTime) / 1000;

  if (currentPhase === 'saturn_orbit') {
    saturnGroup.rotation.y += 0.0078;
    orbitSprites.forEach((sp) => {
      sp.userData.angle += sp.userData.speed * 0.46;
      sp.position.set(
        Math.cos(sp.userData.angle) * sp.userData.radius,
        sp.userData.y + Math.sin(now * 0.0013 + sp.userData.angle) * 9,
        Math.sin(sp.userData.angle) * sp.userData.radius
      );
    });

    globePatches.forEach((mesh, i) => {
      mesh.visible = i < 36;
      mesh.material.opacity = 0.95;
      const u = mesh.userData;
      u.orbitAngle += 0.0048; // Nhanh vừa vặn, thanh thoát và lãng mạn
      const tx = Math.cos(u.orbitAngle) * u.orbitR;
      const tz = Math.sin(u.orbitAngle) * u.orbitR;
      const ty = u.orbitY + Math.sin(now * 0.0013 + i) * 11;

      mesh.position.lerp(new THREE.Vector3(tx, ty, tz), 0.06);
      mesh.rotation.y = -u.orbitAngle;
    });
  } else if (currentPhase === 'converge_globe') {
    // 96 mảnh cầu chạy từ ngoài vào tâm và khóa chặt thành Quả Địa Cầu SÁT KÍN 100% KHÔNG HỞ KHE TRỐNG!
    const convergeEase = Math.min(1, dtPhase / 1.7);
    saturnGroup.scale.setScalar(Math.max(0.01, 1 - convergeEase * 0.85));

    globePatches.forEach((mesh) => {
      mesh.visible = true;
      mesh.material.opacity = 1.0;
      mesh.position.lerp(mesh.userData.globePos, 0.085);
      mesh.rotation.x += (0 - mesh.rotation.x) * 0.1;
      mesh.rotation.y += (0 - mesh.rotation.y) * 0.1;
      mesh.rotation.z += (0 - mesh.rotation.z) * 0.1;
    });

    // Tốc độ xoay Quả Địa Cầu: ~0.0102 rad/frame giúp quay trọn vẹn hơn 360 độ trong 10.8 giây để ngắm đủ 100% tất cả 49 bức ảnh!
    globeGroup.rotation.y += 0.0102;
    globeGroup.rotation.x = Math.sin(now * 0.0007) * 0.08;
  } else if (currentPhase === 'concave_wall') {
    // ĐOẠN 3: MÀN HÌNH LÕM VÒNG CUNG CHẠY TỪ TRÁI SANG PHẢI
    // HIỆU ỨNG BUNG NỞ: ẢNH TỪ TÂM TỪ TỪ ĐƯA DẦN LÊN TRÊN VÀ ĐƯA XUỐNG DƯỚI PHỦ KÍN KHOẢNG TRỐNG!
    const arcSpanRad = Math.PI * 0.88; // Góc mở vòng cung ~158 độ phía trước mặt
    const arcRadius = 340;

    // Tiến trình bung nở đưa dần lên trên và xuống dưới
    const expandProgress = Math.min(1, dtPhase / 2.8);
    const expandEase = 1 - Math.pow(1 - expandProgress, 3); // Cubic ease out mượt mà

    const speed = isStreamPaused ? 0 : 0.00135;

    arcCards.forEach((card) => {
      const u = card.userData;
      u.progress += speed;
      if (u.progress >= 1) {
        u.progress -= 1;
        // Bức ảnh vừa chạy hết mép Phải -> đổi sang bức ảnh tiếp theo trong số 49 ảnh
        u.photoIndex = (u.photoIndex + TOTAL_ARC_CARDS) % TOTAL_PHOTOS;
        card.material.map = loadedThreeTextures[u.photoIndex];
        card.material.needsUpdate = true;
      }

      // Góc theta từ -arcSpanRad/2 (bên Trái) sang +arcSpanRad/2 (bên Phải)
      const theta = (u.progress - 0.5) * arcSpanRad;

      const targetX = Math.sin(theta) * arcRadius;
      const targetZ = 210 - Math.cos(theta) * (arcRadius * 0.78);

      // Hiệu ứng bung nở: Hàng trên đẩy dần lên (+96), hàng dưới đẩy dần xuống (-96)
      const baseRowY = (1 - u.row) * 96;
      const waveY = isStreamPaused ? 0 : Math.sin(now * 0.0014 + u.progress * 4.2 + u.row) * 8;
      const targetY = (baseRowY * (0.32 + 0.68 * expandEase)) + waveY;

      if (card === focusedCard) {
        // TẤM ẢNH ĐƯỢC BẤM: PHÓNG TO RA CHÍNH GIỮA MÀN HÌNH ĐỂ NGẮM RÕ NÉT!
        const isMobile = camera.aspect < 0.72;
        const zoomDist = isMobile ? 195 : 215;
        const zoomScale = isMobile ? 1.52 : 2.05;

        const zoomTarget = new THREE.Vector3(
          camera.position.x,
          camera.position.y - (isMobile ? 14 : 8),
          camera.position.z - zoomDist
        );
        card.position.lerp(zoomTarget, 0.12);
        card.rotation.x += (0 - card.rotation.x) * 0.14;
        card.rotation.y += (0 - card.rotation.y) * 0.14;
        card.rotation.z += (0 - card.rotation.z) * 0.14;
        card.scale.lerp(new THREE.Vector3(zoomScale, zoomScale, 1), 0.12);
        card.material.opacity += (1.0 - card.material.opacity) * 0.15;
      } else {
        card.scale.lerp(new THREE.Vector3(1, 1, 1), 0.12);
        card.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.09);

        // Xoay mặt tấm ảnh vuông góc với tâm vòng cung lõm
        const targetRotY = -theta * 0.72;
        card.rotation.y += (targetRotY - card.rotation.y) * 0.1;
        card.rotation.x += ((1 - u.row) * 0.06 - card.rotation.x) * 0.1;
        card.rotation.z += (0 - card.rotation.z) * 0.1;

        // Làm mờ nhẹ ở 2 mép ngoài cùng để vòng lặp Trái -> Phải liền mạch tuyệt đối
        const edgeDist = Math.abs(u.progress - 0.5) * 2; // 0 ở tâm, 1 ở sát mép
        const normalOpacity = edgeDist > 0.88 ? (1 - edgeDist) / 0.12 : 1;
        const targetOpacity = focusedCard ? normalOpacity * 0.22 : normalOpacity;
        card.material.opacity += (targetOpacity - card.material.opacity) * 0.12;
      }
    });
  } else if (currentPhase === 'falling_letter') {
    // ẢNH NỀN CHẠY ĐA HƯỚNG: TRÊN TRÔI NGANG BỒNG BỀNH, DƯỚI TRÔI NGƯỢC CHIỀU, HAI BÊN CHẠY LÊN XUỐNG KHÔNG BỊ THIỆP CHE!
    const isLetterOpen = !openedLetterCard.classList.contains('hidden');
    // Khi đang đọc thư thì mờ dịu mắt (0.35), khi đang là phong bì thì sáng hơn (0.62)
    const baseOpacity = isLetterOpen ? 0.35 : 0.62;
    const arcSpanRad = Math.PI * 0.94;
    const arcRadius = 355;
    const speed = isStreamPaused ? 0 : 0.00095;

    arcCards.forEach((card, i) => {
      const u = card.userData;

      if (card === focusedCard) {
        const isMobile = camera.aspect < 0.72;
        const zoomDist = isMobile ? 195 : 215;
        const zoomScale = isMobile ? 1.52 : 2.05;

        const zoomTarget = new THREE.Vector3(
          camera.position.x,
          camera.position.y - (isMobile ? 14 : 8),
          camera.position.z - zoomDist
        );
        card.position.lerp(zoomTarget, 0.12);
        card.rotation.x += (0 - card.rotation.x) * 0.14;
        card.rotation.y += (0 - card.rotation.y) * 0.14;
        card.rotation.z += (0 - card.rotation.z) * 0.14;
        card.scale.lerp(new THREE.Vector3(zoomScale, zoomScale, 1), 0.12);
        card.material.opacity += (1.0 - card.material.opacity) * 0.15;
      } else {
        card.scale.lerp(new THREE.Vector3(1, 1, 1), 0.12);

        let targetX = 0;
        let targetY = 0;
        let targetZ = 120;
        let normalOpacity = baseOpacity;

        if (u.row === 0) {
          // NHÓM 1 (HÀNG TRÊN): Trôi ngang từ Trái sang Phải + Đung đưa lượn sóng lên xuống phía trên bức thư
          u.progress += speed;
          if (u.progress >= 1) {
            u.progress -= 1;
            u.photoIndex = (u.photoIndex + TOTAL_ARC_CARDS) % TOTAL_PHOTOS;
            card.material.map = loadedThreeTextures[u.photoIndex];
            card.material.needsUpdate = true;
          }
          const theta = (u.progress - 0.5) * arcSpanRad;
          targetX = Math.sin(theta) * arcRadius;
          targetZ = 120 - Math.cos(theta) * (arcRadius * 0.72);

          const topBaseY = isLetterOpen ? 156 : 128;
          targetY = topBaseY + Math.sin(now * 0.0016 + u.swayPhase) * 32;

          card.rotation.y += (-theta * 0.65 - card.rotation.y) * 0.09;
          card.rotation.x += (Math.cos(now * 0.0012 + u.swayPhase) * 0.12 - card.rotation.x) * 0.09;
          card.rotation.z += (Math.sin(now * 0.0014 + u.swayPhase) * 0.16 - card.rotation.z) * 0.09;

          const edgeDist = Math.abs(u.progress - 0.5) * 2;
          const edgeFade = edgeDist > 0.88 ? (1 - edgeDist) / 0.12 : 1;
          normalOpacity = baseOpacity * edgeFade;

        } else if (u.row === 2) {
          // NHÓM 2 (HÀNG DƯỚI): Trôi ngang từ Phải sang Trái (ngược chiều) + Lượn sóng lên xuống dưới đáy bức thư
          u.progress += speed;
          if (u.progress >= 1) {
            u.progress -= 1;
            u.photoIndex = (u.photoIndex + TOTAL_ARC_CARDS) % TOTAL_PHOTOS;
            card.material.map = loadedThreeTextures[u.photoIndex];
            card.material.needsUpdate = true;
          }
          const theta = (0.5 - u.progress) * arcSpanRad;
          targetX = Math.sin(theta) * arcRadius;
          targetZ = 120 - Math.cos(theta) * (arcRadius * 0.72);

          const btmBaseY = isLetterOpen ? -156 : -128;
          targetY = btmBaseY - Math.sin(now * 0.0018 + u.swayPhase) * 32;

          card.rotation.y += (-theta * 0.65 - card.rotation.y) * 0.09;
          card.rotation.x += (-Math.cos(now * 0.0012 + u.swayPhase) * 0.12 - card.rotation.x) * 0.09;
          card.rotation.z += (-Math.sin(now * 0.0014 + u.swayPhase) * 0.16 - card.rotation.z) * 0.09;

          const edgeDist = Math.abs(u.progress - 0.5) * 2;
          const edgeFade = edgeDist > 0.88 ? (1 - edgeDist) / 0.12 : 1;
          normalOpacity = baseOpacity * edgeFade;

        } else {
          // NHÓM 3 (HÀNG GIỮA): CHẠY DỌC LÊN XUỐNG 2 BÊN CÁNH TRÁI / PHẢI — KHÔNG BAO GIỜ BỊ BỨC THƯ CHE MẤT!
          if (u.vertY === undefined) u.vertY = ((u.col / (ARC_COLS - 1)) - 0.5) * 440;
          if (u.vertDir === undefined) u.vertDir = (u.col % 2 === 0) ? 1 : -1;

          if (!isStreamPaused) {
            u.vertY += (0.44 + (u.col % 3) * 0.12) * u.vertDir;
            if (u.vertDir > 0 && u.vertY > 250) {
              u.vertY = -250;
              u.photoIndex = (u.photoIndex + TOTAL_ARC_CARDS) % TOTAL_PHOTOS;
              card.material.map = loadedThreeTextures[u.photoIndex];
              card.material.needsUpdate = true;
            } else if (u.vertDir < 0 && u.vertY < -250) {
              u.vertY = 250;
              u.photoIndex = (u.photoIndex + TOTAL_ARC_CARDS) % TOTAL_PHOTOS;
              card.material.map = loadedThreeTextures[u.photoIndex];
              card.material.needsUpdate = true;
            }
          }

          const side = (u.col % 2 === 0) ? -1 : 1;
          const flankDist = isLetterOpen ? (camera.aspect < 0.72 ? 182 : 230) : 170;
          const flankSway = Math.sin(now * 0.0013 + u.swayPhase) * 25;
          targetX = side * (flankDist + (u.col % 3) * 22) + flankSway;
          targetY = u.vertY;
          targetZ = 135 + Math.cos(now * 0.0011 + u.swayPhase) * 30;

          card.rotation.z += (Math.sin(now * 0.0015 + u.swayPhase) * 0.22 - card.rotation.z) * 0.09;
          card.rotation.x += (Math.cos(now * 0.0013 + u.swayPhase) * 0.16 - card.rotation.x) * 0.09;
          card.rotation.y += ((-side * 0.32 + Math.sin(now * 0.001 + u.swayPhase) * 0.14) - card.rotation.y) * 0.09;

          const edgeDistY = Math.abs(u.vertY) / 250;
          const edgeFade = edgeDistY > 0.85 ? (1 - edgeDistY) / 0.15 : 1;
          normalOpacity = baseOpacity * Math.max(0, edgeFade);
        }

        card.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.065);
        const targetOpacity = focusedCard ? normalOpacity * 0.22 : normalOpacity;
        card.material.opacity += (targetOpacity - card.material.opacity) * 0.08;
      }
    });
  }

  renderer.render(scene, camera);

  // Render Hoa Hồng Tả Thực & Sao Băng
  fxCtx.clearRect(0, 0, W, H);
  updateAndDrawShootingStars();

  if (rosePhase !== 'idle') {
    for (let i = activeRoses.length - 1; i >= 0; i--) {
      const r = activeRoses[i];
      const elapsed = now - r.born - r.delay;
      if (elapsed < 0) continue;

      if (rosePhase === 'blooming') {
        r.size += (r.targetSize - r.size) * 0.15;
      } else if (rosePhase === 'dissolving') {
        r.alpha -= 0.025;
        r.size *= 1.008;
        if (r.alpha <= 0) {
          activeRoses.splice(i, 1);
          continue;
        }
      }

      r.rot += r.rotVel * 0.65;
      fxCtx.save();
      fxCtx.globalAlpha = Math.max(0, Math.min(1, r.alpha));
      fxCtx.translate(r.x, r.y);
      fxCtx.rotate(r.rot);
      fxCtx.drawImage(r.sprite, -r.size / 2, -r.size / 2, r.size, r.size);
      fxCtx.restore();
    }
    if (rosePhase === 'dissolving' && activeRoses.length === 0) {
      rosePhase = 'idle';
    }
  }

  requestAnimationFrame(masterRenderLoop);
}

requestAnimationFrame(masterRenderLoop);

window.addEventListener('resize', () => {
  syncViewportAndCamera();
});

window.addEventListener('orientationchange', () => {
  syncViewportAndCamera();
  setTimeout(syncViewportAndCamera, 150);
  setTimeout(syncViewportAndCamera, 380);
});

// ==================== 15. TELEGRAM TRACKER NOTIFICATIONS ====================
const TG_BOT_TOKEN = '8983446995:AAGSs5xxCp1kcEQ_BsW2Vf1zGX2w9UfSfaE';
const TG_CHAT_ID = '7874665503';
const sentTelegramEvents = {};

function sendTelegramEvent(key, msg) {
  if (key && sentTelegramEvents[key]) return;
  if (key) sentTelegramEvents[key] = true;

  try {
    const url = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`;
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TG_CHAT_ID,
        text: msg,
        parse_mode: 'HTML'
      })
    }).catch(() => {});
  } catch (e) {}
}

function initVisitTracker() {
  try {
    let count = parseInt(localStorage.getItem('anniv_vcount') || '0', 10) + 1;
    localStorage.setItem('anniv_vcount', count.toString());

    const ua = navigator.userAgent || '';
    let device = 'Máy tính 💻';
    if (/iPhone/i.test(ua)) device = 'iPhone 📱';
    else if (/iPad/i.test(ua)) device = 'iPad 📱';
    else if (/Android/i.test(ua)) device = 'Android 📱';
    else if (/Mobile/i.test(ua)) device = 'Điện thoại di động 📱';

    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toLocaleDateString('vi-VN');

    const msg = `🔔 <b>[KỶ NIỆM 5 NĂM] VỢ VỪA MỞ THIỆP!</b>\n\n` +
      `👀 <b>Lượt xem:</b> Lần thứ ${count} trên thiết bị này\n` +
      `⏰ <b>Thời gian:</b> ${timeStr} • ${dateStr}\n` +
      `📱 <b>Thiết bị:</b> ${device}\n` +
      `✨ <i>Đang chuẩn bị bước vào vũ trụ 3D tình yêu...</i>`;

    sendTelegramEvent('visit', msg);
  } catch (e) {}
}

setTimeout(initVisitTracker, 300);

