/* ---- part 1 ---- */
(function () {
    if (!window.THREE) { return }
    var T = THREE, calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
    function envTex(r) {
        var c = document.createElement('canvas'); c.width = 1024; c.height = 512; var x = c.getContext('2d'); x.fillStyle = '#B9C8F2'; x.fillRect(0, 0, 1024, 512);
        [[150, 160, 230, '#FF8FCB'], [520, 120, 200, '#FFFFFF'], [860, 200, 230, '#7FE3BF'], [330, 380, 250, '#9B84FF'], [740, 400, 260, '#6FA8FF'], [40, 330, 140, '#FFFFFF']].forEach(function (b) { var g = x.createRadialGradient(b[0], b[1], 0, b[0], b[1], b[2]); g.addColorStop(0, b[3]); g.addColorStop(1, 'rgba(220,230,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 1024, 512) });
        var t = new T.CanvasTexture(c); t.mapping = T.EquirectangularReflectionMapping; t.encoding = T.sRGBEncoding; var p = new T.PMREMGenerator(r); var e = p.fromEquirectangular(t).texture; p.dispose(); return e
    }
    function stage(cv, build) {
        var r; try { r = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }) } catch (e) { return false }
        r.setPixelRatio(Math.min(devicePixelRatio, 2)); r.outputEncoding = T.sRGBEncoding; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = .85;
        var s = new T.Scene(); s.environment = envTex(r); var cam = new T.PerspectiveCamera(34, 1, .1, 60); cam.position.set(0, 0, 11);
        var l = new T.DirectionalLight(0xffffff, 1.2); l.position.set(3, 5, 6); s.add(l); var root = new T.Group(); s.add(root); var tick = build(root);
        function fit() { var w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return; r.setSize(w, h, false); cam.aspect = w / h; if (cv.id === 'gl1') cam.position.z = Math.max(11, 12.4 / cam.aspect); cam.updateProjectionMatrix() }
        fit(); addEventListener('resize', fit); var mx = 0, my = 0; addEventListener('pointermove', function (e) { mx = (e.clientX / innerWidth - .5) * 2; my = (e.clientY / innerHeight - .5) * 2 });
        var hint = document.querySelector('.drag'), drag = false, px = 0, py = 0, vy = 0, vx = 0, ry = 0, rx = 0;
        cv.style.pointerEvents = 'auto'; cv.style.cursor = 'grab'; cv.style.touchAction = 'pan-y';
        cv.addEventListener('pointerdown', function (e) { drag = true; px = e.clientX; py = e.clientY; vy = 0; vx = 0; try { cv.setPointerCapture(e.pointerId) } catch (_) { } cv.style.cursor = 'grabbing'; if (hint) hint.style.opacity = 0 });
        cv.addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - px, dy = e.clientY - py; px = e.clientX; py = e.clientY; vy = dx * .012; vx = dy * .012; ry += vy; rx = Math.max(-1, Math.min(1, rx + vx)) });
        function up() { drag = false; cv.style.cursor = 'grab' }
        cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
        var vis = true; if ('IntersectionObserver' in window) { new IntersectionObserver(function (e) { vis = e[0].isIntersecting }).observe(cv) }
        var t0 = performance.now(); (function loop(now) { var t = calm ? 0 : (now - t0) / 1000; if (!drag) { ry += vy; rx += vx; vy *= .95; vx *= .95; rx *= .98; if (Math.abs(vy) < .004) ry += (Math.round(ry / 6.2832) * 6.2832 - ry) * .012 } root.rotation.y = ry + (calm ? 0 : mx * .25); root.rotation.x = rx + (calm ? 0 : my * .12); if (vis) { tick(t); r.render(s, cam) } requestAnimationFrame(loop) })(t0); return true
    }
    function pearl(c) { return new T.MeshPhysicalMaterial({ color: c, roughness: .06, metalness: 0, clearcoat: 1, clearcoatRoughness: .03, iridescence: 1, iridescenceIOR: 1.7, iridescenceThicknessRange: [100, 500], envMapIntensity: 1.4 }) }
    function crystal(c) { return new T.MeshPhysicalMaterial({ color: c, roughness: .04, metalness: .1, clearcoat: 1, flatShading: true, iridescence: 1, iridescenceThicknessRange: [200, 700], envMapIntensity: 1.6 }) }
    function mesh(g, m, x, y, z) { var o = new T.Mesh(g, m); o.position.set(x, y, z); return o }
    var ok1 = stage(document.getElementById('gl1'), function (root) {
        function rr(x, y, w, h, r, c) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath() }
        var TX = []; function tex(w, h, draw) { var c = document.createElement('canvas'); c.width = w; c.height = h; var g = c.getContext('2d'); draw(g, w, h); var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 4; t.redraw = function () { g.clearRect(0, 0, w, h); draw(g, w, h); t.needsUpdate = true }; TX.push(t); return t }
        var K = '#C3B1FF', S = '#9FE3D0', A = '#FFB4D9', N = '#E8ECFA';
        function code(lines) { return tex(512, 320, function (g, w, h) { g.fillStyle = 'rgba(27,42,68,.95)'; rr(0, 0, w, h, 28, g); g.fill();['#FF7B8A', '#FFD36E', '#7BE0A8'].forEach(function (c, i) { g.fillStyle = c; g.beginPath(); g.arc(34 + i * 26, 34, 8, 0, 7); g.fill() }); g.font = '500 25px ui-monospace,Menlo,Consolas,monospace'; lines.forEach(function (l, i) { var px = 32; l.forEach(function (s) { g.fillStyle = s[1]; g.fillText(s[0], px, 92 + i * 40); px += g.measureText(s[0]).width }) }) }) }
        var nameT = tex(1024, 640, function (g, w, h) {
            g.fillStyle = '#0E1930'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(120,140,200,.14)'; for (var i = 0; i < 14; i++) { rr(60, 70 + i * 36, 170 + ((i * 97) % 420), 10, 5, g); g.fill() } ['#FF7B8A', '#FFD36E', '#7BE0A8'].forEach(function (c, i) { g.fillStyle = c; g.beginPath(); g.arc(40 + i * 26, 34, 8, 0, 7); g.fill() });
            g.textBaseline = 'alphabetic'; var a = 'Virendra ', b = 'Kumar Mekhle', fs = 128, f = function () { g.font = 'italic 400 ' + fs + 'px "Instrument Serif",Georgia,serif' }; f(); var tw = g.measureText(a + b).width; if (tw > 880) { fs = Math.floor(fs * 880 / tw); f(); tw = g.measureText(a + b).width } var x0 = (w - tw) / 2, wa = g.measureText(a).width, gr = g.createLinearGradient(x0, 0, x0 + wa, 0); gr.addColorStop(0, '#FF9AD5'); gr.addColorStop(1, '#9D8BFF'); g.fillStyle = gr; g.fillText(a, x0, 310); g.fillStyle = '#FFFFFF'; g.fillText(b, x0 + wa, 310);
            g.fillStyle = '#6C7CFF'; g.fillRect(w / 2 - 45, 346, 90, 4);
            g.textAlign = 'center'; var fs2 = 60, s2 = 'Android and Software Engineer from India', f2 = function () { g.font = 'italic 400 ' + fs2 + 'px "Instrument Serif",Georgia,serif' }; f2(); var sw = g.measureText(s2).width; if (sw > 860) { fs2 = Math.floor(fs2 * 860 / sw); f2() } g.fillStyle = '#CFDAFF'; g.fillText(s2, w / 2, 430);
            g.fillStyle = 'rgba(123,224,168,.16)'; rr(w / 2 - 210, 480, 420, 52, 26, g); g.fill(); g.fillStyle = '#7BE0A8'; g.font = '500 26px Inter,system-ui,sans-serif'; g.fillText('Freelance Developer, Available Remote', w / 2, 515); g.textAlign = 'left'
        });
        if (document.fonts && document.fonts.load) { Promise.all([document.fonts.load('italic 400 100px "Instrument Serif"'), document.fonts.load('500 35px Inter')]).then(function () { TX.forEach(function (t) { t.redraw() }) }).catch(function () { }) }
        var deckT = tex(1024, 620, function (g, w, h) { g.fillStyle = '#CED5E6'; g.fillRect(0, 0, w, h); for (var r = 0; r < 5; r++)for (var c = 0; c < 14; c++) { g.fillStyle = '#27324D'; rr(40 + c * 68, 40 + r * 70, 60, 60, 10, g); g.fill() } g.fillStyle = '#BAC3D9'; rr(332, 430, 360, 160, 18, g); g.fill() });
        var al = new T.MeshPhysicalMaterial({ color: 0xD3DAEA, metalness: .6, roughness: .3, clearcoat: .5, envMapIntensity: 1.2 }), lap = new T.Group(), lid = new T.Group();
        lap.add(mesh(new T.BoxGeometry(4.6, .14, 3), al, 0, 0, 0));
        var deck = mesh(new T.PlaneGeometry(4.3, 2.6), new T.MeshBasicMaterial({ map: deckT, toneMapped: false }), 0, .075, .05); deck.rotation.x = -Math.PI / 2; lap.add(deck);
        lid.add(mesh(new T.BoxGeometry(4.6, 3, .1), al, 0, 1.5, 0), mesh(new T.PlaneGeometry(4.46, 2.86), new T.MeshBasicMaterial({ color: 0x05080F }), 0, 1.5, .052), mesh(new T.PlaneGeometry(4.3, 2.7), new T.MeshBasicMaterial({ map: nameT, toneMapped: false }), 0, 1.5, .055));
        function stk(draw, x, y, s, rot) { var tx = tex(256, 256, function (g, w, h) { g.fillStyle = '#fff'; g.beginPath(); g.arc(w / 2, h / 2, 124, 0, 7); g.fill(); draw(g, w, h) }); var m = mesh(new T.PlaneGeometry(.56 * s, .56 * s), new T.MeshBasicMaterial({ map: tx, transparent: true, toneMapped: false }), x, y, -.058); m.rotation.set(0, Math.PI, rot); lid.add(m); return m }
        function badge(txt, bg, fg, fs) { return function (g, w, h) { g.fillStyle = bg; g.beginPath(); g.arc(w / 2, h / 2, 108, 0, 7); g.fill(); g.fillStyle = fg; g.font = '700 ' + fs + 'px "Space Grotesk",Inter,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 4) } }
        function starS(g, w, h) { g.fillStyle = '#FFC933'; g.beginPath(); for (var i = 0; i < 10; i++) { var r = i % 2 ? 48 : 110, a = -Math.PI / 2 + i * Math.PI / 5; g.lineTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r) } g.closePath(); g.fill() }
        stk(function (g, w, h) { g.fillStyle = '#16223A'; g.beginPath(); g.arc(w / 2, h / 2, 112, 0, 7); g.fill(); g.fillStyle = '#FFFFFF'; g.font = 'italic 400 92px "Instrument Serif",Georgia,serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('VKM', w / 2, h / 2 + 6) }, 0, 1.5, 1.5, 0);
        stk(badge('JS', '#F7DF1E', '#1B2A44', 92), -1.6, 2.3, 1.1, -.2); stk(badge('Java', '#E76F00', '#FFFFFF', 66), 1.55, 2.3, 1, .1); stk(badge('SQL', '#2F6FEB', '#FFFFFF', 80), -1.55, .65, 1, .12); stk(badge('PHP', '#777BB3', '#FFFFFF', 74), 1.55, .65, 1.05, -.1);
        lid.position.set(0, .07, -1.5); lid.rotation.x = -.3; lap.add(lid); lap.scale.setScalar(.86); lap.position.set(0, -.5, 0); root.add(lap);
        function card(lines, x, y, z, ry) { var m = mesh(new T.PlaneGeometry(2.1, 1.31), new T.MeshBasicMaterial({ map: code(lines), transparent: true, toneMapped: false, side: T.DoubleSide }), x, y, z); m.rotation.y = ry; root.add(m); return m }
        var ca = card([[['@RestController', A]], [['class ', K], ['Billing', N], [' {', N]], [['  @GetMapping', A]], [['  List', S], ['<Invoice> all()', N]], [['}', N]]], -2.45, 2.25, .9, .25);
        var cb = card([[['@Composable', A]], [['fun ', K], ['ParkingScreen', N], ['() {', N]], [['  Text(', N], ['"Online"', S], [')', N]], [['  Sync(', N], ['offline', S], [')', N]], [['}', N]]], 2.45, -2.25, .9, -.25);
        function bar(g, a, b, r, m) { var v = new T.Vector3().subVectors(b, a), L = v.length(), c = mesh(new T.CylinderGeometry(r, r, L, 32), m, 0, 0, 0); c.position.copy(a).add(b).multiplyScalar(.5); c.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), v.clone().normalize()); g.add(c);[a, b].forEach(function (e) { g.add(mesh(new T.SphereGeometry(r, 32, 24), m, e.x, e.y, e.z)) }) }
        var br = new T.Group(), pk = pearl(0xF7B9E4), bl = pearl(0xA9C8FF), V = function (x, y) { return new T.Vector3(x, y, 0) };
        bar(br, V(-.5, .8), V(-1.4, 0), .17, pk); bar(br, V(-1.4, 0), V(-.5, -.8), .17, pk); bar(br, V(.5, .8), V(1.4, 0), .17, pk); bar(br, V(1.4, 0), V(.5, -.8), .17, pk); bar(br, V(.3, 1), V(-.3, -1), .14, bl);
        br.scale.setScalar(.42); br.position.set(2.6, 2.3, .6); root.add(br);
        var phoneT = tex(256, 512, function (g, w, h) { g.fillStyle = '#F4F6FF'; rr(0, 0, w, h, 28, g); g.fill(); g.fillStyle = '#6C5CE7'; g.fillRect(0, 0, w, 70); g.fillStyle = '#fff'; g.font = '600 22px Inter,sans-serif'; g.fillText('Parking', 22, 44); var y = 96;[['Online', '#7BE0A8'], ['Offline Sync', '#FFD36E'], ['Slot A12', '#C3B1FF']].forEach(function (s) { g.fillStyle = '#fff'; rr(18, y, w - 36, 90, 16, g); g.fill(); g.fillStyle = s[1]; g.beginPath(); g.arc(48, y + 45, 14, 0, 7); g.fill(); g.fillStyle = '#1B2A44'; g.font = '500 22px Inter,sans-serif'; g.fillText(s[0], 76, y + 52); y += 108 }) });
        var phone = new T.Group(); phone.add(mesh(new T.BoxGeometry(.82, 1.62, .08), new T.MeshPhysicalMaterial({ color: 0x1B2A44, metalness: .4, roughness: .25, clearcoat: 1 }), 0, 0, 0), mesh(new T.PlaneGeometry(.74, 1.5), new T.MeshBasicMaterial({ map: phoneT, toneMapped: false }), 0, 0, .045));
        phone.position.set(-3, -2.1, 1); phone.rotation.set(.1, .4, .12); root.add(phone);
        var p1 = mesh(new T.SphereGeometry(.45, 48, 32), pearl(0xF7B9E4), 3.2, .5, 1), p2 = mesh(new T.SphereGeometry(.32, 48, 32), pearl(0xB4F0D8), -3.2, .3, 1), gem = mesh(new T.OctahedronGeometry(.5, 0), crystal(0x9FD0FF), 0, 2.85, .2), tor = mesh(new T.TorusGeometry(.42, .16, 32, 64), pearl(0xA9C8FF), .2, -2.8, .5);
        gem.scale.set(.8, 1.4, .8); tor.rotation.x = 1.1;
        var r1 = mesh(new T.TorusGeometry(3.9, .012, 8, 200), new T.MeshBasicMaterial({ color: 0xffffff }), 0, 0, 0), r2 = mesh(new T.TorusGeometry(3.3, .012, 8, 200), new T.MeshBasicMaterial({ color: 0x4B5BEA, transparent: true, opacity: .4 }), 0, 0, 0);
        r1.rotation.set(1.25, -.3, 0); r2.rotation.set(1.25, -.3, 0);
        [p1, p2, gem, tor, r1, r2].forEach(function (o) { root.add(o) });
        return function (t) { var u = (1 - Math.cos(t * .52)) / 2; lap.rotation.y = -.12 + Math.PI * u * u * (3 - 2 * u); lap.rotation.x = .2; lap.position.y = -.5 + Math.sin(t * .8) * .06; ca.position.y = 2.25 + Math.sin(t * 1.1) * .1; cb.position.y = -2.25 + Math.sin(t * 1.2 + 1) * .1; br.rotation.y = Math.sin(t * .9) * .5; br.position.y = 2.3 + Math.sin(t * 1.3) * .1; phone.position.y = -2.1 + Math.sin(t * 1.2 + 3) * .08; phone.rotation.y = .4 + Math.sin(t) * .15; p1.position.y = .5 + Math.sin(t * 1.4) * .12; p2.position.y = .3 + Math.sin(t * 1.2 + 2) * .1; gem.rotation.y = t * .6; tor.rotation.z = t * .5 }
    });
    if (ok1) document.querySelector('.orbit').classList.add('on');
    var ok2 = stage(document.getElementById('gl2'), function (root) {
        var g = mesh(new T.OctahedronGeometry(1.5, 0), crystal(0xA9C4FF), 0, 0, 0); g.scale.set(.85, 1.35, .85); root.add(g);
        return function (t) { g.rotation.y = t * .5; g.position.y = Math.sin(t * 1.1) * .12 }
    });
    if (ok2) document.querySelector('.disc').classList.add('on');
})();
/* ---- part 2 ---- */
(function () {
    var T = window.TESTIMONIALS || [], s = document.getElementById('testimonials'), b = document.getElementById('tm'); if (!s || !b || !T.length) return;
    T.forEach(function (t) { var f = document.createElement('figure'); f.className = 'tc glass'; var q = document.createElement('blockquote'); q.textContent = '\u201C' + t.q + '\u201D'; var c = document.createElement('figcaption'), n = document.createElement('b'); n.textContent = t.n || 'Client'; c.appendChild(n); if (t.r) { var r = document.createElement('span'); r.textContent = t.r; c.appendChild(r) } f.appendChild(q); f.appendChild(c); b.appendChild(f) }); s.hidden = false
})();
/* ---- part 3 ---- */
(function () {
    var roles = ['Software Developer', 'Full Stack Developer', 'Web Developer', 'Website Designer', 'Application Developer'], ri = 0, nr = document.getElementById('navRole');
    var still = matchMedia('(prefers-reduced-motion:reduce)').matches;
    if (!still && nr) setInterval(function () { ri = (ri + 1) % roles.length; nr.style.opacity = 0; setTimeout(function () { nr.textContent = roles[ri]; nr.style.opacity = 1 }, 350) }, 4800);
    var eyeRoles = ['Freelance Developer, Available Remote', 'Full Stack Developer', 'Web Developer & Designer', 'Android & Software Engineer'];
    var eyeEl = document.getElementById('eyeRole');
    if (!still && eyeEl) {
        var eIdx = 0, cIdx = eyeRoles[0].length, del = false;
        function typeStep() {
            var cur = eyeRoles[eIdx];
            if (del) { cIdx--; eyeEl.textContent = cur.substring(0, cIdx) }
            else { cIdx++; eyeEl.textContent = cur.substring(0, cIdx) }
            var wait = del ? 28 : 55;
            if (!del && cIdx === cur.length) { wait = 3000; del = true }
            else if (del && cIdx === 0) { del = false; eIdx = (eIdx + 1) % eyeRoles.length; wait = 350 }
            setTimeout(typeStep, wait)
        }
        setTimeout(function () { del = true; typeStep() }, 3200)
    }
    var ov = document.getElementById('ov'), last = null;
    var PHOTOS = { wallet: { t: "Payment Way wallet app on a phone at a desk", p: "50% 50%", s: "images/wallet.webp" }, erp: { t: "ERP billing and accounting dashboard on a monitor", p: "50% 52%", s: "images/erp.webp" }, newspaper: { t: "Newspaper agency billing system on a desktop", p: "50% 55%", s: "images/newspaper.webp" }, cold: { t: "Cold storage management dashboard in a warehouse", p: "50% 50%", s: "images/cold.webp" }, parking: { t: "Parking app on a handheld device printing a receipt", p: "50% 50%", s: "images/parking.webp" }, technest: { t: "TechNest online shop on a monitor", p: "50% 50%", s: "images/technest.webp" }, sbmchat: { t: "SBMChat chat app on a phone", p: "50% 50%", s: "images/sbmchat.webp" }, fireworks: { t: "Fireworks agent shop on a monitor", p: "50% 46%", s: "images/fireworks.webp" } };
    document.querySelectorAll('.pc[data-photo]').forEach(function (c) { var m = PHOTOS[c.dataset.photo], t = c.querySelector('.thumb'); if (m && t) { t.classList.add('photo'); t.innerHTML = '<img alt="' + m.t + '" src="' + m.s + '" style="object-position:' + m.p + '" loading="lazy">' } });
    function open(c) {
        last = c; var th = c.querySelector('.thumb'); document.getElementById('mth').innerHTML = th ? th.outerHTML : '';
        document.getElementById('mt').textContent = c.dataset.title; document.getElementById('md').textContent = c.dataset.desc;
        document.getElementById('mf').innerHTML = (c.dataset.feat || '').split('|').filter(Boolean).map(function (t) { return '<li>' + t + '</li>' }).join('');
        document.getElementById('mg').innerHTML = c.dataset.tags.split(',').map(function (t) { return '<span>' + t.trim() + '</span>' }).join('');
        ov.classList.add('open'); ov.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; document.getElementById('mx').focus()
    }
    function close() { ov.classList.remove('open'); ov.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; if (last) last.focus() }
    document.querySelectorAll('.pc').forEach(function (c) { c.addEventListener('click', function () { open(c) }) });
    document.getElementById('mx').addEventListener('click', close);
    ov.addEventListener('click', function (e) { if (e.target === ov) close() });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') close() });
    var gp = document.getElementById('gp'), gb = document.getElementById('gb');
    function openGP() {
        if (note) { note.textContent = ''; note.style.color = '' }
        if (eh) { eh.textContent = ''; eh.className = 'hint' }
        if (ei) { ei.classList.remove('valid', 'invalid') }
        gp.classList.add('open');
        document.body.style.overflow = 'hidden';
        gb.setAttribute('aria-expanded', 'true');
        setTimeout(function () { document.getElementById('name').focus({ preventScroll: true }) }, 60)
    }
    function closeGP() {
        gp.classList.remove('open');
        document.body.style.overflow = '';
        gb.setAttribute('aria-expanded', 'false')
    }
    gb.addEventListener('click', function () { gp.classList.contains('open') ? closeGP() : openGP() });
    document.getElementById('gx').addEventListener('click', function () { closeGP(); gb.focus() });
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && gp.classList.contains('open')) closeGP() });
    document.querySelectorAll('[data-hire]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); openGP() }) });
    var f = document.getElementById('f'), note = document.getElementById('note'), sb = document.getElementById('sb'), ei = document.getElementById('email'), eh = document.getElementById('eh');
    var pat = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/, disp = ['mailinator.com', 'tempmail.com', 'temp-mail.org', 'guerrillamail.com', '10minutemail.com', 'throwawaymail.com', 'yopmail.com', 'trashmail.com', 'getnada.com', 'dispostable.com', 'fakeinbox.com', 'sharklasers.com', 'maildrop.cc', 'mintemail.com'], common = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'protonmail.com'], junk = ['test', 'asdf', 'abc', 'xxxx', 'fake', 'none', 'sample', 'example'];
    function lev(a, b) {
        var d = []; for (var i = 0; i <= a.length; i++) { d[i] = [i]; for (var j = 1; j <= b.length; j++)d[i][j] = i ? 0 : j }
        for (i = 1; i <= a.length; i++)for (j = 1; j <= b.length; j++)d[i][j] = a[i - 1] === b[j - 1] ? d[i - 1][j - 1] : 1 + Math.min(d[i - 1][j - 1], d[i - 1][j], d[i][j - 1]); return d[a.length][b.length]
    }
    function check(v) {
        if (!v) return { ok: false, hint: '' }; if (!pat.test(v)) return { ok: false, hint: "That doesn't look like a complete email address." };
        var p = v.split('@'), loc = p[0], dom = p[1].toLowerCase();
        if (/^(.)\1*$/.test(loc) || junk.indexOf(loc.toLowerCase()) > -1) return { ok: false, hint: 'That looks like a placeholder, not a real address.' };
        if (disp.indexOf(dom) > -1) return { ok: false, hint: "Temporary or disposable email addresses aren't accepted." };
        for (var k = 0; k < common.length; k++) { var kn = common[k], dd = lev(dom, kn); if (dom !== kn && dd > 0 && dd <= 2 && dom.length >= kn.length - 2) return { ok: false, hint: '', sug: loc + '@' + kn } }
        return { ok: true, hint: 'Looks good.' }
    }
    function render() {
        var v = ei.value.trim(); if (!v) { ei.classList.remove('valid', 'invalid'); eh.textContent = ''; eh.className = 'hint'; return false }
        var r = check(v); ei.classList.toggle('valid', r.ok); ei.classList.toggle('invalid', !r.ok); eh.className = 'hint ' + (r.ok ? 'ok' : 'bad');
        if (r.sug) { eh.innerHTML = 'Did you mean <button type="button" id="ap"></button>?'; var b = document.getElementById('ap'); b.textContent = r.sug; b.addEventListener('click', function () { ei.value = r.sug; render() }) } else eh.textContent = r.hint; return r.ok
    }
    ei.addEventListener('input', render); ei.addEventListener('blur', render);
    f.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = document.getElementById('name').value.trim(), email = ei.value.trim(), message = document.getElementById('msg').value.trim();
        if (!name || !message) { note.textContent = 'Add your name and a message.'; return }
        if (!render()) { ei.focus(); return }
        sb.disabled = true; sb.textContent = 'Sending…'; note.textContent = '';
        fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name, email: email, message: message }) })
            .then(function (r) {
                return r.json().then(function (d) {
                    if (r.ok && d.ok) {
                        note.style.color = 'var(--ok)';
                        note.textContent = "Message sent. I'll get back to you soon.";
                        f.reset();
                        eh.textContent = '';
                        ei.classList.remove('valid', 'invalid');
                        setTimeout(function () {
                            closeGP();
                            note.textContent = '';
                        }, 1800);
                    } else throw new Error('x')
                })
            })
            .catch(function () {
                location.href = 'mailto:vmekhle@gmail.com?subject=' + encodeURIComponent('Portfolio inquiry from ' + name) + '&body=' + encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')');
                note.textContent = 'Opening your email app…';
                setTimeout(function () { closeGP() }, 2000);
            })
            .finally(function () { sb.disabled = false; sb.textContent = 'Send Message' })
    });
})();
/* ---- websites slider ---- */
(function () {
    var wrap = document.getElementById('webSliderWrap');
    if (!wrap) return;
    var paused = false;
    function getCardStep() {
        var c = wrap.querySelector('.wc');
        if (!c) return 340;
        var isMobile = window.innerWidth <= 720;
        return isMobile ? wrap.clientWidth : (c.offsetWidth + 16);
    }
    function scrollNext() {
        var cardStep = getCardStep();
        var max = wrap.scrollWidth - wrap.clientWidth - 15;
        if (wrap.scrollLeft >= max) {
            wrap.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            wrap.scrollBy({ left: cardStep, behavior: 'smooth' });
        }
    }
    wrap.addEventListener('mouseenter', function () { paused = true });
    wrap.addEventListener('mouseleave', function () { paused = false });
    wrap.addEventListener('touchstart', function () { paused = true }, { passive: true });
    wrap.addEventListener('touchend', function () { setTimeout(function () { paused = false }, 3000) });
    setInterval(function () {
        if (!paused && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
            scrollNext();
        }
    }, 6000);
})();
/* ---- part 4 ---- */
(function () {
    var b = document.getElementById('mbtn'), p = document.getElementById('mpanel');
    if (!b || !p) return;
    function set(o) { p.classList.toggle('open', o); b.setAttribute('aria-expanded', o ? 'true' : 'false'); b.setAttribute('aria-label', o ? 'Close menu' : 'Open menu') }
    b.addEventListener('click', function (e) { e.stopPropagation(); set(!p.classList.contains('open')) });
    p.addEventListener('click', function (e) { if (e.target.closest('a')) set(false) });
    document.addEventListener('click', function (e) { if (!p.contains(e.target) && e.target !== b) set(false) });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false) });
    addEventListener('resize', function () { if (innerWidth > 1000) set(false) });
})();
/* ---- part 5 ---- */
(function () {
    var ids = ['home', 'about', 'services', 'experience', 'projects', 'websites', 'skills', 'contact'], links = document.querySelectorAll('.rail a,.links a');
    document.addEventListener('click', function (e) {
        var a = e.target.closest('a[href^="#"]');
        if (!a || a.hasAttribute('data-hire')) return;
        var h = a.getAttribute('href');
        if (!h || h === '#' || h.length < 2) return;
        var target = document.getElementById(h.slice(1));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
            if (window.history && window.history.replaceState) {
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
            }
        }
    });
    if (window.location.hash && window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    if (!('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id) }) } }) }, { rootMargin: '-45% 0px -50% 0px' });
    ids.forEach(function (id) { var s = document.getElementById(id); if (s) obs.observe(s) })
})();
/* ---- part 6 ---- */
(function () {
    var e = document.querySelector('.nm'), b = e && e.querySelector('.nmb'); if (!e || !b) return;
    var F = [["'Barlow Condensed','Arial Narrow',sans-serif", 700, 'normal'], ["'Playfair Display',Georgia,serif", 600, 'normal']], i = 0, still = matchMedia('(prefers-reduced-motion:reduce)').matches;
    function fit() { e.style.fontSize = ''; e.style.height = ''; var s0 = parseFloat(getComputedStyle(e).fontSize); var w = e.parentElement ? e.parentElement.clientWidth : window.innerWidth, s = s0, g = 0; while ((e.scrollWidth > w || e.offsetWidth > w) && s > 18 && g < 60) { s -= 1; e.style.fontSize = s + 'px'; g++ } }
    function apply() { var f = F[i]; e.style.fontFamily = f[0]; e.style.fontWeight = f[1]; e.style.fontStyle = f[2]; fit() }
    function next() { i = (i + 1) % F.length; apply(); b.classList.remove('wr'); void b.offsetWidth; b.classList.add('wr') }
    if (!still) setInterval(next, 5000);
    addEventListener('resize', fit); addEventListener('load', fit);
    if (document.fonts) { if (document.fonts.ready) document.fonts.ready.then(fit); Promise.all(F.map(function (f) { return document.fonts.load(f[2] + ' ' + f[1] + ' 40px ' + f[0]) })).then(fit).catch(function () { }) }
    fit()
})();
/* ---- part 7 ---- */
(function () {
    var calm = matchMedia('(prefers-reduced-motion:reduce)').matches, io = 'IntersectionObserver' in window;
    var blobs = [].slice.call(document.querySelectorAll('.blob')), fs = [.05, -.08, .06], busy = false;
    function onScroll() {
        if (busy) return; busy = true; requestAnimationFrame(function () {
            var y = window.scrollY || 0;
            if (!calm) blobs.forEach(function (b, i) { var d = Math.max(-140, Math.min(140, y * fs[i % 3])); b.style.transform = 'translate3d(0,' + d + 'px,0)' }); busy = false
        })
    }
    addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll();
    var E = 'cubic-bezier(.22,1,.36,1)', els = [].slice.call(document.querySelectorAll('section .head,.about,.svc,.job,.pc,.wc,.sk,.stats div,.tc'));
    function fx(el, i) {
        var l = i % 2 ? 1 : -1;
        if (calm) return ['none', E];
        var isMobile = window.innerWidth <= 768;
        if (isMobile) {
            if (el.classList.contains('about')) return ['translate3d(0,40px,0) scale(.95)', E];
            if (el.classList.contains('svc')) return ['translate3d(0,30px,0)', E];
            if (el.parentNode && el.parentNode.classList.contains('stats')) return ['scale(.85) translate3d(0,16px,0)', 'cubic-bezier(.34,1.56,.64,1)'];
            return ['translate3d(0,32px,0)', E];
        }
        if (el.classList.contains('about')) return ['translate3d(0,70px,0) scale(.9)', E];
        if (el.classList.contains('svc')) return ['perspective(900px) rotateX(28deg) translate3d(0,60px,0)', E];
        if (el.classList.contains('job')) return ['translate3d(' + (32 * l) + 'px,0,0) rotate(' + (1 * l) + 'deg)', E];
        if (el.classList.contains('pc')) return ['translate3d(' + (32 * l) + 'px,40px,0) scale(.95)', E];
        if (el.classList.contains('wc')) return ['translate3d(' + (24 * l) + 'px,30px,0) scale(.96)', E];
        if (el.classList.contains('sk')) return ['translate3d(' + (24 * l) + 'px,0,0)', E];
        if (el.parentNode && el.parentNode.classList.contains('stats')) return ['scale(.6) translate3d(0,24px,0)', 'cubic-bezier(.34,1.56,.64,1)'];
        if (el.classList.contains('soc')) return ['translate3d(0,28px,0)', E];
        return ['translate3d(0,40px,0)', E]
    }
    els.forEach(function (el) { var i = [].indexOf.call(el.parentNode.children, el), f = fx(el, i); el.style.setProperty('--from', f[0]); el.style.setProperty('--ease', f[1]); el.style.setProperty('--d', ((i % 3) * 120) + 'ms'); el.classList.add('rv') });
    function sweep() { var vh = innerHeight; els.forEach(function (el) { var r = el.getBoundingClientRect(), on = el.classList.contains('in'), end = (window.scrollY || 0) + vh >= document.documentElement.scrollHeight - 6; if (!on && ((r.top < vh * .88 && r.bottom > vh * .1) || (end && r.top < vh && r.bottom > 0))) el.classList.add('in'); else if (on && (r.top > vh * .99 || r.bottom < 0)) el.classList.remove('in') }) }
    var q = false; function req() { if (q) return; q = true; requestAnimationFrame(function () { q = false; sweep() }) }
    addEventListener('scroll', req, { passive: true }); addEventListener('resize', req); addEventListener('load', req);
    requestAnimationFrame(function () { requestAnimationFrame(sweep) });
    if (!io) return;
    var co = new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting) return; co.unobserve(e.target); var el = e.target, m = el.textContent.match(/^(\d+)(.*)$/); if (!m) return; var end = +m[1], suf = m[2], t0 = performance.now(); (function step(now) { var p = Math.min(1, (now - t0) / 1200), v = Math.round(end * (1 - Math.pow(1 - p, 3))); el.textContent = v + suf; if (p < 1) requestAnimationFrame(step) })(t0) }) }, { threshold: .6 });
    if (!calm) [].slice.call(document.querySelectorAll('.stats b')).forEach(function (n) { co.observe(n) });
})();
