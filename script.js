document.addEventListener('DOMContentLoaded', ()=>{
  const target = new Date(2026, 4, 20, 0, 0, 0);
  const pad = (n) => String(n).padStart(2, '0');

  function updateCountdown(){
    const now = new Date();
    const diff = Math.max(0, target - now);
    
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const updateUnit = (id, value, isDays = false) => {
      const front = document.getElementById(id + '-front');
      const back = document.getElementById(id + '-back');
      const card = front?.closest('.flip-card');
      
      if (!front || !back || !card) return;
      
      const newValue = isDays ? String(value) : pad(value);
      const oldValue = front.textContent.trim();
      
      if (oldValue !== newValue) {
        if (card.classList.contains('flipping')) return;
        
        back.textContent = newValue;
        card.classList.add('flipping');
        
        setTimeout(() => {
          front.textContent = newValue;
          card.classList.remove('flipping');
        }, 550);
      }
    };

    updateUnit('days', days, true);
    updateUnit('hours', hours, false);
    updateUnit('minutes', minutes, false);
    updateUnit('seconds', seconds, false);

    if (diff <= 0) {
      document.querySelectorAll('.note').forEach(n => n.textContent = 'Conference started!');
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Continuous smooth rotation removed

  // Mouse tilt effect removed

  // Canvas background
  const canvas = document.getElementById('bg');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let W = window.innerWidth;
  let H = window.innerHeight;
  
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resize);
  resize();

  const starsCount = Math.min(140, Math.floor((W * H) / 9000));
  const stars = Array.from({ length: starsCount }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.6 + 0.2,
    v: Math.random() * 0.4 + 0.02,
    tw: Math.random() * Math.PI * 2
  }));

  let glow = { x: W / 2, y: H / 2, intensity: 0 };
  
  document.addEventListener('mousemove', (e) => {
    glow.x = e.clientX;
    glow.y = e.clientY;
    glow.intensity = 1;
  }, { passive: true });

  document.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    if (t) {
      document.body.classList.add('touch');
      glow.x = t.clientX;
      glow.y = t.clientY;
      glow.intensity = 1.4;
    }
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    if (t) {
      glow.x = t.clientX;
      glow.y = t.clientY;
      glow.intensity = 1.2;
    }
  }, { passive: true });

  document.addEventListener('touchend', () => {
    glow.intensity = Math.max(0, glow.intensity - 0.04);
  }, { passive: true });

  let animTime = 0;
  
  function draw() {
    animTime += 0.016;
    ctx.clearRect(0, 0, W, H);

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#030007');
    grad.addColorStop(0.5, '#060318');
    grad.addColorStop(1, '#000008');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    const radialGrad = ctx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, Math.max(W, H) * 0.6);
    radialGrad.addColorStop(0, `rgba(60,203,188,${0.12 * glow.intensity})`);
    radialGrad.addColorStop(0.25, `rgba(188,72,253,${0.06 * glow.intensity})`);
    radialGrad.addColorStop(1, 'rgba(0,0,0,0)');
    
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = radialGrad;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';

    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.translate(W / 2, H / 2);
    
    const smallScreen = Math.min(W, H) < 600;
    const ringCount = smallScreen ? 2 : 4;
    
    for (let i = 0; i < ringCount; i++) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(120,80,200,${0.06 + i * 0.02})`;
      ctx.lineWidth = smallScreen ? (12 - i * 3) : (18 - i * 4);
      
      const radius = (i * 60) + (Math.min(W, H) * 0.10) + Math.sin(animTime * (0.3 + i * 0.1)) * 6;
      ctx.arc(0, 0, radius, animTime * 0.05 + i, animTime * 0.05 + i + Math.PI * 1.2);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    
    for (const s of stars) {
      s.y -= s.v + 0.2 * Math.sin(animTime + s.tw);
      s.x += Math.sin(animTime * 0.4 + s.tw) * 0.1;
      
      if (s.y < -10) {
        s.y = H + 10;
        s.x = Math.random() * W;
      }
      
      ctx.fillStyle = `rgba(255,255,255,${0.5 + Math.random() * 0.5})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    const decayRate = ('ontouchstart' in window || navigator.maxTouchPoints > 0) ? 0.03 : 0.02;
    glow.intensity = Math.max(0, glow.intensity - decayRate);

    requestAnimationFrame(draw);
  }
  
  requestAnimationFrame(draw);

  document.getElementById('explore')?.addEventListener('click', () => {
    window.location.href = 'committees.html';
  });

  document.getElementById('join')?.addEventListener('click', () => {
    window.location.href = 'applications.html';
  });

  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (hamburger && mobileMenu) {
    function toggleMenu(open) {
      const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
      const shouldOpen = typeof open === 'boolean' ? !open : !isOpen;
      
      hamburger.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
      mobileMenu.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');
      mobileMenu.classList.toggle('open', shouldOpen);
      hamburger.classList.toggle('open', shouldOpen);
      document.body.classList.toggle('mobile-menu-open', shouldOpen);
    }
    
    hamburger.addEventListener('click', () => toggleMenu());
    
    document.querySelectorAll('.top-links a, .mobile-menu a').forEach(a => {
      a.addEventListener('click', () => {
        if (window.innerWidth <= 640) toggleMenu(true);
      });
    });
  }
});
