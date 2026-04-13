// ── Three.js background
const canvas = document.getElementById('bg-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 80;

// Multicolor particles — split into groups
const neonColors = [0x00f5ff, 0xbf00ff, 0xff006e, 0x00ff9d, 0xffb800];
const pGroups = [];
const particleCanvas = document.createElement('canvas');
particleCanvas.width = 32;
particleCanvas.height = 32;
const particleContext = particleCanvas.getContext('2d');
const particleGradient = particleContext.createRadialGradient(16, 16, 0, 16, 16, 16);
particleGradient.addColorStop(0, 'rgba(255,255,255,1)');
particleGradient.addColorStop(0.35, 'rgba(255,255,255,0.85)');
particleGradient.addColorStop(1, 'rgba(255,255,255,0)');
particleContext.fillStyle = particleGradient;
particleContext.fillRect(0, 0, 32, 32);
const particleTexture = new THREE.CanvasTexture(particleCanvas);

neonColors.forEach((col, gi) => {
  const count = window.innerWidth < 768 ? 180 : 320;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 220;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 220;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 180;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: col,
    size: window.innerWidth < 768 ? 1.35 : 1.75,
    map: particleTexture,
    transparent: true,
    opacity: 0.58,
    depthWrite: false,
    sizeAttenuation: false,
  });
  const pts = new THREE.Points(geo, mat);
  pts.rotation.x = gi * 0.4;
  scene.add(pts);
  pGroups.push(pts);
});

// Mouse influence
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', e => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

let t = 0;
function animate() {
  requestAnimationFrame(animate);
  t += 0.008;

  pGroups.forEach((pts, i) => {
    pts.rotation.y += 0.0004 + i * 0.00005;
    pts.rotation.x += 0.0001 + i * 0.00003;
  });

  camera.position.x += (mouseX * 8 - camera.position.x) * 0.04;
  camera.position.y += (mouseY * 5 - camera.position.y) * 0.04;
  camera.lookAt(scene.position);

  renderer.render(scene, camera);
}
animate();

// ── Mobile navigation
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelectorAll('.nav-links a');

function closeNav() {
  document.body.classList.remove('nav-open');
  navToggle?.setAttribute('aria-expanded', 'false');
}

navToggle?.addEventListener('click', () => {
  const isOpen = document.body.classList.toggle('nav-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.forEach(link => {
  link.addEventListener('click', closeNav);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) closeNav();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeNav();
});

// ── Ripple on card click
function rippleClick(e, el) {
  const rect = el.getBoundingClientRect();
  const r = document.createElement('span');
  r.classList.add('ripple');
  const size = Math.max(rect.width, rect.height) * 1.5;
  r.style.width = r.style.height = size + 'px';
  r.style.left = (e.clientX - rect.left - size / 2) + 'px';
  r.style.top = (e.clientY - rect.top - size / 2) + 'px';
  el.appendChild(r);
  setTimeout(() => r.remove(), 700);
}

document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('click', event => rippleClick(event, card));
});

// ── Skill bars intersection observer
const skillObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.skill-bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.width + '%';
      });
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.skills-grid').forEach(el => skillObs.observe(el));

// ── Timeline intersection observer
const timelineObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 150);
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.timeline-item').forEach(el => timelineObs.observe(el));

// ── Send message handler
function handleSend(btn) {
  const orig = btn.querySelector('span').textContent;
  btn.querySelector('span').textContent = 'Sending...';
  btn.disabled = true;
  setTimeout(() => {
    btn.querySelector('span').textContent = 'Message Sent ✓';
    btn.classList.add('btn-success');
    setTimeout(() => {
      btn.querySelector('span').textContent = orig;
      btn.disabled = false;
      btn.classList.remove('btn-success');
    }, 3000);
  }, 1200);
}

document.querySelector('.contact-submit')?.addEventListener('click', event => {
  handleSend(event.currentTarget);
});
