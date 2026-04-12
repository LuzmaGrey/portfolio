// ── Custom cursor
const cur = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cur.style.left = mx - 5 + 'px';
  cur.style.top = my - 5 + 'px';
});

function animRing() {
  rx += (mx - rx - 18) * 0.14;
  ry += (my - ry - 18) * 0.14;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(animRing);
}
animRing();

const neonRing = ['rgba(0,245,255,0.9)', 'rgba(191,0,255,0.9)', 'rgba(255,0,110,0.9)', 'rgba(0,255,157,0.9)', 'rgba(255,184,0,0.9)'];
let neonIdx = 0;
document.querySelectorAll('a,button,.project-card,.skill-item,.contact-link').forEach(el => {
  el.addEventListener('mouseenter', () => {
    neonIdx = (neonIdx + 1) % neonRing.length;
    ring.style.width = '56px'; ring.style.height = '56px';
    ring.style.borderColor = neonRing[neonIdx];
    cur.style.background = neonRing[neonIdx].replace('0.9','1');
    cur.style.transform = 'scale(1.5)';
  });
  el.addEventListener('mouseleave', () => {
    ring.style.width = '36px'; ring.style.height = '36px';
    ring.style.borderColor = 'rgba(0,245,255,0.6)';
    cur.style.background = '#00f5ff';
    cur.style.transform = 'scale(1)';
  });
});

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

neonColors.forEach((col, gi) => {
  const count = 360;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 220;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 220;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 180;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: col, size: 0.55, transparent: true, opacity: 0.55, sizeAttenuation: true });
  const pts = new THREE.Points(geo, mat);
  pts.rotation.x = gi * 0.4;
  scene.add(pts);
  pGroups.push(pts);
});

// Grid lines — purple tinted
const gridHelper = new THREE.GridHelper(200, 20, 0x2a0050, 0x150028);
gridHelper.position.y = -40;
gridHelper.material.opacity = 0.5;
gridHelper.material.transparent = true;
scene.add(gridHelper);

// Floating geometric shapes — each a different neon color
const shapes = [];
const geos = [
  new THREE.OctahedronGeometry(4, 0),
  new THREE.TetrahedronGeometry(3.5, 0),
  new THREE.IcosahedronGeometry(3, 0),
  new THREE.OctahedronGeometry(2.5, 0),
  new THREE.TetrahedronGeometry(2.8, 0),
];

for (let i = 0; i < 10; i++) {
  const col = neonColors[i % neonColors.length];
  const mat = new THREE.MeshBasicMaterial({ color: col, wireframe: true, transparent: true, opacity: 0.13 });
  const mesh = new THREE.Mesh(geos[i % geos.length], mat);
  mesh.position.set(
    (Math.random() - 0.5) * 130,
    (Math.random() - 0.5) * 90,
    (Math.random() - 0.5) * 60 - 20
  );
  mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
  scene.add(mesh);
  shapes.push({ mesh, speed: Math.random() * 0.003 + 0.001 });
}

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

  shapes.forEach(({ mesh, speed }) => {
    mesh.rotation.x += speed;
    mesh.rotation.y += speed * 0.7;
    mesh.position.y += Math.sin(t + mesh.position.x) * 0.02;
  });

  gridHelper.position.z = ((t * 3) % 10);
  renderer.render(scene, camera);
}
animate();

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
