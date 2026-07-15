/* ---- UI interactions (theme, roles, magnetic buttons, hire form) ---- */
/* roles shown one by one, in order */
  const roles = ['Software Developer', 'Full Stack Developer'];
  let roleIdx = 0;
  const heroRole = document.getElementById('heroRole');
  const navRole = document.getElementById('navRole');
  setInterval(()=>{
    roleIdx = (roleIdx + 1) % roles.length;
    [heroRole, navRole].forEach(el=>{
      if(!el) return;
      el.style.opacity = 0;
      setTimeout(()=>{ el.textContent = roles[roleIdx]; el.style.opacity = 1; }, 350);
    });
  }, 2400);

  /* project detail modal */
  const modal = document.getElementById('projModal');
  const modalGallery = document.getElementById('modalGallery');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalTags = document.getElementById('modalTags');
  const modalLink = document.getElementById('modalLink');
  const modalClose = document.getElementById('modalClose');

  function openProjectModal(card){
    modalTitle.textContent = card.dataset.title || '';
    modalDesc.textContent = card.dataset.desc || '';
    modalTags.innerHTML = (card.dataset.tags || '').split(',').filter(Boolean)
      .map(t=>`<span class="tag">${t.trim()}</span>`).join('');

    const imgs = (card.dataset.imgs || card.dataset.img || '').split(',').map(s=>s.trim()).filter(Boolean);
    modalGallery.innerHTML = imgs.map(src => `
      <div class="browser-frame">
        <div class="bar"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span></div>
        <img src="${src}" alt="${card.dataset.title || ''} screenshot" loading="lazy" />
      </div>
    `).join('');

    if(card.dataset.link){
      modalLink.href = card.dataset.link; modalLink.classList.add('show');
    } else {
      modalLink.removeAttribute('href'); modalLink.classList.remove('show');
    }
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }
  function closeProjectModal(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
  document.querySelectorAll('.proj-card').forEach(card=>{
    card.addEventListener('click', ()=> openProjectModal(card));
    card.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openProjectModal(card); }
    });
  });
  modalClose.addEventListener('click', closeProjectModal);
  modal.addEventListener('click', (e)=>{ if(e.target === modal) closeProjectModal(); });
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeProjectModal(); });

  /* "Hire me" always scrolls to the contact form and focuses the name field */
  document.querySelectorAll('[data-hire]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.preventDefault();
      const target = document.getElementById('contact');
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(()=>{ document.getElementById('name')?.focus(); }, 550);
    });
  });

  /* hire form -> POSTs to /api/contact, a serverless function that sends the
     message through your Gmail account via Nodemailer + an App Password.
     The password lives only as a server-side environment variable — never
     in this file. Requires deploying api/contact.js (see README below).
     Until it's deployed, this falls back to opening the visitor's own
     email client instead, so the form never silently fails. */
  const form = document.getElementById('hireForm');
  const note = document.getElementById('formNote');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    note.textContent = '';
    try{
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      const data = await res.json();
      if(res.ok && data.ok){
        note.style.color = 'var(--success)';
        note.textContent = 'Message sent — I\'ll get back to you soon.';
        form.reset();
      } else {
        throw new Error(data.error || 'Something went wrong');
      }
    } catch(err){
      // fallback: opens the visitor's own email client, addressed to you
      const subject = encodeURIComponent('Portfolio inquiry from ' + name);
      const body = encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')');
      window.location.href = `mailto:vmekhle@gmail.com?subject=${subject}&body=${body}`;
      note.textContent = 'Opening your email client…';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send message';
    }
  });

/* ---- 3D core (Three.js) ---- */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isSmall = window.innerWidth < 720;
const lowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;

const COUNT = reduceMotion ? 0 : (isSmall || lowPower ? 1400 : 3200);

const canvas = document.getElementById('core-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true, powerPreference:'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall ? 1.5 : 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 100);
camera.position.set(0,0,6.2);

scene.add(new THREE.AmbientLight(0x334466, 0.6));
const key = new THREE.PointLight(0x4f9bff, 2.4, 20); key.position.set(3,2,4); scene.add(key);
const rim = new THREE.PointLight(0x6c5ce7, 2.0, 20); rim.position.set(-3,-2,-3); scene.add(rim);

function fibonacciSphere(n, radius){
  const pts = new Float32Array(n*3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for(let i=0;i<n;i++){
    const y = 1 - (i/(n-1))*2;
    const r = Math.sqrt(1-y*y);
    const theta = golden*i;
    pts[i*3] = Math.cos(theta)*r*radius;
    pts[i*3+1] = y*radius;
    pts[i*3+2] = Math.sin(theta)*r*radius;
  }
  return pts;
}
function torusKnot(n,R,r,p,q){
  const pts = new Float32Array(n*3);
  for(let i=0;i<n;i++){
    const t = (i/n)*Math.PI*2;
    const a=p*t, b=q*t;
    const cx=(R+r*Math.cos(b))*Math.cos(a);
    const cy=(R+r*Math.cos(b))*Math.sin(a);
    const cz=r*Math.sin(b);
    pts[i*3]=cx*0.85; pts[i*3+1]=cy*0.85; pts[i*3+2]=cz*0.85;
  }
  return pts;
}
function helix(n, radius, turns, height){
  const pts = new Float32Array(n*3);
  for(let i=0;i<n;i++){
    const t=i/n; const strand=i%2;
    const angle = t*Math.PI*2*turns + (strand?Math.PI:0);
    pts[i*3]=Math.cos(angle)*radius;
    pts[i*3+1]=(t-0.5)*height;
    pts[i*3+2]=Math.sin(angle)*radius;
  }
  return pts;
}

const shapes = {
  sense: fibonacciSphere(COUNT, 1.7),
  decide: torusKnot(COUNT, 1.35, 0.55, 2, 3),
  act: helix(COUNT, 1.15, 4.5, 3.2)
};

const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(COUNT*3);
positions.set(shapes.sense);
geometry.setAttribute('position', new THREE.BufferAttribute(positions,3));

const colors = new Float32Array(COUNT*3);
const cA = new THREE.Color(0x4f9bff);
const cB = new THREE.Color(0x8f7ff5);
for(let i=0;i<COUNT;i++){
  const c = cA.clone().lerp(cB, Math.random());
  colors[i*3]=c.r; colors[i*3+1]=c.g; colors[i*3+2]=c.b;
}
geometry.setAttribute('color', new THREE.BufferAttribute(colors,3));

function makeSprite(){
  const s=64; const cnv=document.createElement('canvas'); cnv.width=cnv.height=s;
  const ctx=cnv.getContext('2d');
  const g = ctx.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
  g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(0.35,'rgba(255,255,255,0.6)'); g.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=g; ctx.fillRect(0,0,s,s);
  return new THREE.CanvasTexture(cnv);
}
const sprite = makeSprite();

const material = new THREE.PointsMaterial({
  size: isSmall?0.045:0.036, map: sprite, vertexColors:true, transparent:true,
  depthWrite:false, blending: THREE.AdditiveBlending, opacity:0.95
});
const core = new THREE.Points(geometry, material);
scene.add(core);

const fieldCount = reduceMotion?0:(isSmall?200:500);
const fieldGeo = new THREE.BufferGeometry();
const fieldPos = new Float32Array(fieldCount*3);
for(let i=0;i<fieldCount;i++){
  fieldPos[i*3]=(Math.random()-0.5)*14; fieldPos[i*3+1]=(Math.random()-0.5)*14; fieldPos[i*3+2]=(Math.random()-0.5)*14-3;
}
fieldGeo.setAttribute('position', new THREE.BufferAttribute(fieldPos,3));
const fieldMat = new THREE.PointsMaterial({ size:0.02, map:sprite, color:0xffffff, transparent:true, opacity:0.3, blending:THREE.AdditiveBlending, depthWrite:false });
const field = new THREE.Points(fieldGeo, fieldMat);
scene.add(field);

let composer;
const useBloom = !reduceMotion && !(isSmall && lowPower);
if(useBloom){
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.85, 0.6, 0.15);
  composer.addPass(bloom);
}

let mouseX=0, mouseY=0, targetRotX=0, targetRotY=0, curRotX=0, curRotY=0;
window.addEventListener('pointermove', (e)=>{
  mouseX = (e.clientX/window.innerWidth)*2-1;
  mouseY = (e.clientY/window.innerHeight)*2-1;
  targetRotY = mouseX*0.5; targetRotX = mouseY*0.3;
  key.position.x = 3+mouseX*2; key.position.y = 2-mouseY*2;
}, { passive:true });

let fromArr = shapes.sense.slice();
let toArr = shapes.sense.slice();
let morphT = 1;
const posAttr = geometry.attributes.position;

function setShape(name){ fromArr = posAttr.array.slice(); toArr = shapes[name]; morphT = 0; }

const copyMap = {
  sense: { title:'Skills', body:'Java, Spring Boot, Hibernate JPA, PHP, MySQL, and JavaScript — the core toolkit behind everything I build.' },
  decide: { title:'Experience', body:'2+ years shipping production ERP, billing, and e-commerce systems at Arigam Software, plus an internship at Test Yantra.' },
  act: { title:'Projects', body:'Six shipped builds, from enterprise billing platforms to a from-scratch fireworks animation — scroll down to see them.' }
};
function renderCopy(key){
  const c = copyMap[key];
  document.querySelector('.cap-copy').innerHTML = `<h3>${c.title}</h3><p>${c.body}</p>`;
}
renderCopy('sense');

function setActiveTab(shape){
  document.querySelectorAll('.cap-tab').forEach(t=>t.classList.toggle('active', t.dataset.shape === shape));
}

document.querySelectorAll('.cap-tab').forEach(tab=>{
  tab.addEventListener('click', ()=>{
    const shape = tab.dataset.shape;
    setActiveTab(shape);
    setShape(shape);
    renderCopy(shape);
    lastAutoShape = shape;
    const targetId = tab.dataset.target;
    const targetEl = targetId && document.getElementById(targetId);
    if(targetEl) targetEl.scrollIntoView({ behavior:'smooth', block:'start' });
  });
});

/* the core also morphs — and the matching tab lights up — as Skills / Experience /
   Projects scroll into view, so navigating through the page mirrors clicking a tab */
const sectionShapeMap = {
  'experience': 'decide',
  'projects': 'act',
  'skills': 'sense'
};
var lastAutoShape = 'sense';
const sectionObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const shape = sectionShapeMap[entry.target.id];
      if(shape && shape !== lastAutoShape){
        lastAutoShape = shape;
        setShape(shape);
        setActiveTab(shape);
        renderCopy(shape);
      }
    }
  });
}, { threshold: 0.4 });
Object.keys(sectionShapeMap).forEach(id=>{
  const el = document.getElementById(id);
  if(el) sectionObserver.observe(el);
});

gsap.to(core.rotation, { y: Math.PI*2, ease:'none', scrollTrigger:{ trigger: document.body, start:'top top', end:'bottom bottom', scrub:1.2 } });
gsap.to(camera.position, { z: 4.6, ease:'none', scrollTrigger:{ trigger: document.body, start:'top top', end:'bottom bottom', scrub:1.2 } });
gsap.to('#core-canvas', { opacity: 0.35, ease:'none', scrollTrigger:{ trigger:'footer', start:'top bottom', end:'top center', scrub:true } });

document.querySelectorAll('.reveal').forEach((el)=>{
  gsap.to(el, { opacity:1, y:0, duration:1, ease:'power3.out', scrollTrigger:{ trigger: el, start:'top 85%' } });
});

gsap.from('.hero .eyebrow, .hero h1, .hero p.sub, .hero-actions', {
  opacity:0, y:24, duration:1.1, ease:'power3.out', stagger:0.12, delay:0.15
});

document.querySelectorAll('.magnetic').forEach(btn=>{
  btn.addEventListener('mousemove', (e)=>{
    const r = btn.getBoundingClientRect();
    const relX = e.clientX - r.left - r.width/2;
    const relY = e.clientY - r.top - r.height/2;
    gsap.to(btn, { x: relX*0.28, y: relY*0.5, duration:0.4, ease:'power3.out' });
  });
  btn.addEventListener('mouseleave', ()=>{ gsap.to(btn, { x:0, y:0, duration:0.5, ease:'elastic.out(1,0.4)' }); });
});

const clock = new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  core.position.y = Math.sin(t*0.6)*0.06;
  field.rotation.y = t*0.02;
  curRotX += (targetRotX-curRotX)*0.04;
  curRotY += (targetRotY-curRotY)*0.04;
  core.rotation.x = curRotX + Math.sin(t*0.15)*0.05;
  core.rotation.z = curRotY*0.3;
  camera.position.x += ((mouseX*0.4)-camera.position.x)*0.03;
  camera.position.y += ((-mouseY*0.25)-camera.position.y)*0.03;
  camera.lookAt(0,0,0);
  if(morphT<1){
    morphT = Math.min(1, morphT+0.028);
    const ease = 1-Math.pow(1-morphT,3);
    const arr = posAttr.array;
    for(let i=0;i<arr.length;i++){ arr[i] = fromArr[i] + (toArr[i]-fromArr[i])*ease; }
    posAttr.needsUpdate = true;
  }
  if(composer){ composer.render(); } else { renderer.render(scene, camera); }
}
if(!reduceMotion){ animate(); } else { renderer.render(scene, camera); }

window.addEventListener('resize', ()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  if(composer) composer.setSize(window.innerWidth, window.innerHeight);
});
