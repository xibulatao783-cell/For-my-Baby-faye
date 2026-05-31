// ---- STARS ----

const starCanvas = document.getElementById('stars-canvas');
const starCtx = starCanvas.getContext('2d');
starCanvas.width = window.innerWidth;
starCanvas.height = window.innerHeight;

const stars = Array.from({ length: 200 }, () => ({
  x: Math.random() * starCanvas.width,
  y: Math.random() * starCanvas.height,
  r: Math.random() * 1.5 + 0.3,
  alpha: Math.random(),
  speed: Math.random() * 0.01 + 0.003
}));

function drawStars() {
  starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
  stars.forEach(s => {
    s.alpha += s.speed;
    if (s.alpha > 1 || s.alpha < 0) s.speed *= -1;
    starCtx.beginPath();
    starCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    starCtx.fillStyle = `rgba(79,195,247,${s.alpha * 0.7})`;
    starCtx.fill();
  });
  requestAnimationFrame(drawStars);
}
drawStars();

// ---- PASSCODE ----

let input = '';
const CORRECT_CODE = '143';

function renderDots() {
  const container = document.getElementById('dots');
  container.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i < input.length ? ' filled' : '');
    container.appendChild(dot);
  }
}

function addNum(n) {
  if (input.length >= 3) return;
  input += n;
  renderDots();
  if (input.length === 3) setTimeout(checkCode, 300);
}

function deleteNum() {
  input = input.slice(0, -1);
  renderDots();
}

function clearNum() {
  input = '';
  renderDots();
}

function checkCode() {
  if (input === CORRECT_CODE) {
    goToWelcome();
  } else {
    const err = document.getElementById('error-msg');
    err.classList.add('show');
    setTimeout(() => {
      err.classList.remove('show');
      input = '';
      renderDots();
    }, 1500);
  }
}

renderDots();

// ---- PAGE TRANSITIONS ----

function goToWelcome() {
  document.getElementById('passcode-page').classList.add('hidden');
  document.getElementById('welcome-page').classList.remove('hidden');
}

function goToHeart() {
  document.getElementById('welcome-page').classList.add('hidden');
  document.getElementById('heart-page').classList.remove('hidden');
  startHeartAnimation();
}

// ---- HEART ANIMATION ----

function startHeartAnimation() {
  const canvas = document.getElementById('heart-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;
  const scale = Math.min(W, H) * 0.0038;

  function heartPoint(t) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
    return { x: cx + x * scale * 10, y: cy + y * scale * 10 };
  }

  const COLORS = [
    [79, 195, 247],
    [129, 212, 250],
    [173, 216, 230],
    [224, 247, 250],
    [41, 182, 246],
    [255, 255, 255],
  ];

  class Particle {
    constructor() { this.reset(true); }

    reset(initial) {
      const t = Math.random() * Math.PI * 2;
      const target = heartPoint(t);
      this.tx = target.x + (Math.random() - 0.5) * 6;
      this.ty = target.y + (Math.random() - 0.5) * 6;
      const angle = Math.random() * Math.PI * 2;
      const dist = (initial ? 0.7 : 0.4) * Math.max(W, H) * (0.5 + Math.random() * 0.5);
      this.x = cx + Math.cos(angle) * dist;
      this.y = cy + Math.sin(angle) * dist;
      this.size = Math.random() * 2.5 + 0.8;
      this.speed = 0.01 + Math.random() * 0.025;
      this.progress = 0;
      this.alpha = 0;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.pulsing = Math.random() * Math.PI * 2;
      this.delay = initial ? Math.random() * 3 : 0;
      this.timer = 0;
    }

    update() {
      this.timer++;
      if (this.timer < this.delay * 60) return;
      this.progress += this.speed;
      this.pulsing += 0.05;
      this.x += (this.tx - this.x) * this.speed * 2;
      this.y += (this.ty - this.y) * this.speed * 2;
      const p = this.progress;
      this.alpha = p < 0.3 ? p / 0.3 : p > 0.85 ? (1 - p) / 0.15 : 1;
      if (this.progress >= 1) this.reset(false);
    }

    draw() {
      if (this.timer < this.delay * 60) return;
      const pulse = 1 + Math.sin(this.pulsing) * 0.15;
      const [r, g, b] = this.color;
      const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3 * pulse);
      glow.addColorStop(0, `rgba(${r},${g},${b},${this.alpha})`);
      glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 3 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * pulse * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${this.alpha * 0.9})`;
      ctx.fill();
    }
  }

  const particles = Array.from({ length: 1200 }, () => new Particle());

  function drawHeartGlow() {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let layer = 0; layer < 3; layer++) {
      ctx.beginPath();
      let first = true;
      for (let t = 0; t <= Math.PI * 2; t += 0.05) {
        const p = heartPoint(t);
        if (first) { ctx.moveTo(p.x, p.y); first = false; }
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(79,195,247,${0.05 - layer * 0.01})`;
      ctx.lineWidth = 8 - layer * 2;
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#4fc3f7';
      ctx.stroke();
    }
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.4);
    gradient.addColorStop(0, 'rgba(0,20,60,0.4)');
    gradient.addColorStop(1, 'rgba(0,5,16,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    particles.forEach(p => { p.update(); p.draw(); });
    ctx.globalCompositeOperation = 'source-over';
    drawHeartGlow();
    requestAnimationFrame(animate);
  }

  animate();
}

// ---- RESIZE ----

window.addEventListener('resize', () => {
  starCanvas.width = window.innerWidth;
  starCanvas.height = window.innerHeight;
  const hc = document.getElementById('heart-canvas');
  if (hc) { hc.width = window.innerWidth; hc.height = window.innerHeight; }
});
