/* ============================================================
   LINK & BUILD — Real World
   A Three.js "POV at your desk" wrapper around the whole game.

   Two modes toggle via the #world-toggle button:
   - FLAT  ("on the screen"): the game runs full-viewport exactly
     as before. All input goes to the virtual computer.
   - 3D    ("real world"): you sit at a desk, POV straight
     at a monitor whose screen is the *live* game DOM
     (CSS3DRenderer). The screen is not interactive here —
     you "exit" to go back onto the computer.

   Loads after three.min.js + CSS3DRenderer.js (UMD builds), so it
   works from both file:// and http://.
   ============================================================ */

(function () {
  const THREE = window.THREE;

  let built = false;
  let active = false;

  let container, gl, css, sceneGL, sceneCSS, camera, screenObject, screenEl;
  let composer, filmPass;

  // animated lights (referenced from the render loop)
  let monitorLight, lampLight;

  // keyboard camera controls
  const keys = {};
  const MOVE_SPEED = 1.6;   // metres/second
  let lastT = 0;

  // The monitor's native resolution (px). The DOM renders at this
  // size, then is scaled down onto the 3D screen plane. Kept at 720p
  // (not 1080p) to keep the composited layer light on GPU memory.
  const RES = { w: 1280, h: 720 };

  // World-space measurements (metres) — shared by WebGL and CSS3D
  // because both use the same camera.
  const M = {
    screenW: 1.62,
    screenH: 0.911,       // 16:9
    monitor: new THREE.Vector3(0, 1.25, 0),
    eye: new THREE.Vector3(0, 1.25, 0.92),
  };

  /* ---------- tiny mesh helper ---------- */
  function mesh(geo, color, opts = {}) {
    const m = new THREE.MeshStandardMaterial({
      color,
      roughness: opts.roughness !== undefined ? opts.roughness : 0.7,
      metalness: opts.metalness !== undefined ? opts.metalness : 0.05,
      emissive: opts.emissive !== undefined ? opts.emissive : 0x000000,
      emissiveIntensity: opts.emissiveIntensity !== undefined ? opts.emissiveIntensity : 1,
    });
    return new THREE.Mesh(geo, m);
  }

  function box(w, h, d, color, x, y, z, opts) {
    const o = mesh(new THREE.BoxGeometry(w, h, d), color, opts);
    o.position.set(x, y, z);
    o.castShadow = true;
    o.receiveShadow = true;
    return o;
  }

  // dark, desaturated palette — a room that feels wrong
  const C = {
    wall: 0x0a0c10,
    wallDark: 0x06070a,
    floor: 0x08090c,
    desk: 0x0d0e12,
    deskTop: 0x131519,
    bezel: 0x050608,
    accent: 0x14171e,
  };

  function buildRoom() {
    sceneGL = new THREE.Scene();
    sceneGL.background = new THREE.Color(0x020203);
    sceneGL.fog = new THREE.FogExp2(0x020203, 0.055);

    // --- lights ---
    // cold, low ambient (barely any fill)
    sceneGL.add(new THREE.HemisphereLight(0x3a4658, 0x05060a, 0.45));

    // hard overhead so the monitor casts a long, defined shadow
    const key = new THREE.SpotLight(0x8fb0d0, 2.2, 18, Math.PI / 5, 0.45, 1.6);
    key.position.set(0, 4.4, 2.2);
    key.target.position.set(0, 0.9, -0.6);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);   // 2048 is the sweet spot: crisp but cheap
    key.shadow.radius = 6;                // softens the PCF penumbra
    key.shadow.bias = -0.0002;
    key.shadow.normalBias = 0.03;         // kills self-shadow acne on flat faces
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 12;
    key.shadow.camera.fov = 40;           // tighter frustum = sharper shadows
    sceneGL.add(key);
    sceneGL.add(key.target);

    // monitor glow — a cheap fill light. No shadow: a point light's shadow
    // costs 6 depth-map renders per frame, which dominates the frame budget.
    monitorLight = new THREE.PointLight(0x8fc4ff, 2.4, 6, 2);
    monitorLight.position.set(0, 1.25, 0.55);
    sceneGL.add(monitorLight);

    // desk lamp — barely on, flickering
    lampLight = new THREE.PointLight(0xff9a4d, 1.1, 4.5, 2);
    lampLight.position.set(2.5, 1.7, 0.4);
    sceneGL.add(lampLight);

    // a cold rim light behind the player so the room reads as a silhouette
    const rim = new THREE.PointLight(0x30405a, 1.0, 8, 2);
    rim.position.set(0, 2.0, -3.0);
    sceneGL.add(rim);

    const room = new THREE.Group();
    sceneGL.add(room);

    // floor
    const floor = mesh(new THREE.PlaneGeometry(40, 40), C.floor, { roughness: 0.92 });
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    room.add(floor);

    // back wall
    const back = mesh(new THREE.PlaneGeometry(40, 11), C.wall, { roughness: 0.96 });
    back.position.set(0, 5.5, -3.2);
    back.receiveShadow = true;
    room.add(back);

    // side walls
    const left = mesh(new THREE.PlaneGeometry(40, 11), C.wallDark, { roughness: 0.96 });
    left.rotation.y = Math.PI / 2;
    left.position.set(-20, 5.5, 0);
    left.receiveShadow = true;
    room.add(left);
    const right = left.clone();
    right.position.x = 20;
    room.add(right);

    // a dead window — no view, just a faint lightless rectangle
    const windowGlow = mesh(new THREE.PlaneGeometry(2.6, 3.6), 0x0d1220, {
      roughness: 0.2,
      emissive: 0x0a101c,
      emissiveIntensity: 0.4,
    });
    windowGlow.rotation.y = Math.PI / 2;
    windowGlow.position.set(-19.99, 3.6, -1.0);
    room.add(windowGlow);

    // window frame bars, like it's been nailed shut
    for (let i = 0; i < 3; i++) {
      const bar = box(0.06, 0.06, 3.7, 0x050608, -19.98, 2.2 + i * 1.0, -1.0, { roughness: 0.4, metalness: 0.3 });
      bar.rotation.y = Math.PI / 2;
      room.add(bar);
    }

    // desk — heavy and worn
    const pedestal = box(3.6, 0.72, 2.0, C.desk, 0, 0.36, -0.6, { roughness: 0.9 });
    room.add(pedestal);
    const top = box(3.8, 0.06, 2.1, C.deskTop, 0, 0.72, -0.6, { roughness: 0.5 });
    room.add(top);

    // monitor: stand base + neck + bezel
    room.add(box(0.6, 0.04, 0.32, 0x050608, 0, 0.75, -0.02, { roughness: 0.4, metalness: 0.5 }));
    room.add(box(0.14, 0.16, 0.12, 0x050608, 0, 0.85, -0.02, { roughness: 0.4, metalness: 0.5 }));
    room.add(box(1.74, 1.02, 0.06, C.bezel, M.monitor.x, M.monitor.y, M.monitor.z, {
      roughness: 0.3,
      metalness: 0.5,
    }));

    // desk lamp — a bent, barely-there light
    room.add(box(0.04, 0.9, 0.04, 0x050608, 2.5, 1.05, 0.4, { roughness: 0.5, metalness: 0.5 }));
    const shade = mesh(new THREE.ConeGeometry(0.17, 0.24, 24, 1, true), 0x0c0e12, { roughness: 0.5, metalness: 0.5 });
    shade.position.set(2.5, 1.65, 0.4);
    room.add(shade);

    // keyboard + mouse
    room.add(box(1.0, 0.03, 0.34, 0x0a0b0e, 0, 0.76, 0.45, { roughness: 0.6 }));
    room.add(box(0.14, 0.05, 0.22, 0x0a0b0e, 0.85, 0.76, 0.42, { roughness: 0.6 }));

    // coffee cup, long cold
    const mug = mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.12, 20), 0x0c0d10, { roughness: 0.8 });
    mug.position.set(-1.1, 0.82, -0.25);
    room.add(mug);

    // a scattered post-it, barely legible
    const postit = mesh(new THREE.PlaneGeometry(0.12, 0.12), 0x0f1116, { roughness: 0.9 });
    postit.rotation.x = -Math.PI / 2;
    postit.position.set(-0.85, 0.755, -0.15);
    room.add(postit);

    // faint seams in the walls for depth
    for (let i = -2; i <= 2; i++) {
      const seam = box(0.012, 11, 0.02, 0x000000, i * 0.9, 5.5, -3.2, { roughness: 1 });
      room.add(seam);
    }
  }

  // One cheap fullscreen pass: vignette + chromatic aberration + grain +
  // a cold, desaturated grade. All effects are subtle so the game screen
  // stays readable.
  const FilmShader = {
    uniforms: {
      tDiffuse: { value: null },
      time: { value: 0 },
      vignette: { value: 0.85 },
      grain: { value: 0.05 },
      aberration: { value: 0.0018 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float time;
      uniform float vignette;
      uniform float grain;
      uniform float aberration;
      varying vec2 vUv;

      float rand(vec2 co) {
        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        // chromatic aberration: sample R/B slightly offset, stronger at edges
        vec2 centered = vUv - 0.5;
        float dist = length(centered);
        vec2 offset = aberration * dist * centered;
        float r = texture2D(tDiffuse, vUv + offset).r;
        float g = texture2D(tDiffuse, vUv).g;
        float b = texture2D(tDiffuse, vUv - offset).b;
        vec3 color = vec3(r, g, b);

        // cold, desaturated grade (eerie teal in the shadows)
        color = mix(color, vec3(dot(color, vec3(0.299, 0.587, 0.114))), 0.18);
        color = mix(color, vec3(0.02, 0.045, 0.07), 0.10);

        // vignette
        float vig = smoothstep(vignette, 0.15, dist);
        color *= 1.0 - vig * 0.55;

        // film grain
        float n = rand(vUv * time) - 0.5;
        color += n * grain;

        gl_FragColor = vec4(color, 1.0);
      }`,
  };

  function buildComposer() {
    composer = new THREE.EffectComposer(gl);
    composer.addPass(new THREE.RenderPass(sceneGL, camera));

    // bloom on the bright sources (monitor glow keys, lamp)
    const bloom = new THREE.UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.85,  // strength
      0.85,  // radius
      0.55,  // threshold (catch the monitor/lamp highlights)
    );
    composer.addPass(bloom);

    const film = new THREE.ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        time: { value: 0 },
        vignette: { value: 0.85 },
        grain: { value: 0.05 },
        aberration: { value: 0.0018 },
      },
      vertexShader: FilmShader.vertexShader,
      fragmentShader: FilmShader.fragmentShader,
    });
    film.renderToScreen = true;
    composer.addPass(film);
    filmPass = film;
    return film;
  }

  function build() {
    if (built) return;
    built = true;

    screenEl = document.getElementById('screen');

    container = document.createElement('div');
    container.id = 'world-canvas';
    container.style.position = 'fixed';
    container.style.inset = '0';
    container.style.zIndex = '8000';
    container.style.display = 'none';
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(
      85,
      window.innerWidth / window.innerHeight,
      0.05,
      50,
    );
    camera.rotation.order = 'YXZ';
    camera.position.copy(M.eye);
    camera.lookAt(M.monitor);

    // WebGL renderer (room) — tuned for a moody, filmic look
    gl = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    gl.setSize(window.innerWidth, window.innerHeight);
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.outputEncoding = THREE.sRGBEncoding;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
    gl.domElement.style.position = 'absolute';
    gl.domElement.style.inset = '0';
    container.appendChild(gl.domElement);

    // CSS3D renderer (the live game screen)
    css = new THREE.CSS3DRenderer();
    css.setSize(window.innerWidth, window.innerHeight);
    css.domElement.style.position = 'absolute';
    css.domElement.style.inset = '0';
    container.appendChild(css.domElement);

    buildRoom();
    buildComposer();

    sceneCSS = new THREE.Scene();

    window.addEventListener('resize', onResize);
  }

  function prepareScreen() {
    screenEl.style.position = 'absolute';
    screenEl.style.width = RES.w + 'px';
    screenEl.style.height = RES.h + 'px';

    // Build a fresh CSS3D plane each entry. The renderer caches each
    // object's transform (WeakMap keyed by object), so reusing a
    // plane whose inline transform we cleared would never re-apply.
    screenObject = new THREE.CSS3DObject(screenEl);
    const s = M.screenW / RES.w;
    screenObject.scale.set(s, s, s);
    screenObject.position.set(M.monitor.x, M.monitor.y, M.monitor.z + 0.028);
    // The screen is live DOM, so it stays fully interactive (click, type,
    // scroll) even while it's sitting inside the 3D monitor.
    screenObject.element.style.pointerEvents = 'auto';

    sceneCSS.children.length = 0;
    sceneCSS.add(screenObject);
  }

  function resetScreen() {
    screenEl.style.position = '';
    screenEl.style.width = '';
    screenEl.style.height = '';
    screenEl.style.transform = '';
    screenEl.style.display = '';
    screenEl.style.pointerEvents = '';
    screenEl.style.userSelect = '';
    // The CSS3DObject's "removed" listener detaches its element when we
    // drop it from the scene, so #screen may have no parent here. Put it
    // back into the body (flat mode) whenever it isn't already there.
    if (!screenEl.parentNode) {
      document.body.appendChild(screenEl);
    } else if (screenEl.parentNode !== document.body) {
      document.body.appendChild(screenEl);
    }
  }

  /* ---------- camera controls ---------- */
  function cameraKeyBlocked() {
    // If the user is typing in a game input/textarea, don't drive the camera.
    const el = document.activeElement;
    if (!el) return false;
    return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable;
  }

  function onKeyDown(e) {
    if (!cameraKeyBlocked()) {
      keys[e.code] = true;
    }
    // don't scroll/caret-move the page while flying the camera
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'ShiftLeft', 'ShiftRight'].includes(e.code)) {
      e.preventDefault();
    }
  }
  function onKeyUp(e) { keys[e.code] = false; }

  function updateCamera(dt) {
    if (dt > 0.1) dt = 0.1; // clamp spikes (tab switch, etc.)

    // forward/back along the camera's look axis (horizontal only)
    const fwd = new THREE.Vector3();
    camera.getWorldDirection(fwd);
    fwd.y = 0;
    if (fwd.lengthSq() < 1e-6) fwd.set(0, 0, -1);
    fwd.normalize();
    const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();
    const up = new THREE.Vector3(0, 1, 0);

    let move = new THREE.Vector3();
    if (keys['ArrowUp'] || keys['KeyW']) move.add(fwd);
    if (keys['ArrowDown'] || keys['KeyS']) move.sub(fwd);
    if (keys['ArrowRight'] || keys['KeyD']) move.add(right);
    if (keys['ArrowLeft'] || keys['KeyA']) move.sub(right);
    if (keys['Space']) move.add(up);
    if (keys['ShiftLeft'] || keys['ShiftRight'] || keys['KeyC']) move.sub(up);

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(MOVE_SPEED * dt);
      camera.position.add(move);
    }

    // pan/turn with Q/E (and R/F up/down)
    if (keys['KeyQ']) camera.rotateY(-1.6 * dt);
    if (keys['KeyE']) camera.rotateY(1.6 * dt);
    if (keys['KeyR']) camera.rotateX(1.6 * dt);
    if (keys['KeyF']) camera.rotateX(-1.6 * dt);

    // gentle clamp so the camera doesn't stray wildly or go below the floor
    camera.position.y = Math.max(0.35, camera.position.y);
    camera.position.x = Math.min(19, Math.max(-19, camera.position.x));
    camera.position.z = Math.min(16, Math.max(-16, camera.position.z));
  }

  /* ---------- render loop ---------- */
  let rafId = null;
  function loop() {
    rafId = requestAnimationFrame(loop);

    const now = performance.now() / 1000;
    const dt = lastT ? now - lastT : 0;
    lastT = now;
    updateCamera(dt);

    if (filmPass) filmPass.uniforms.time.value = now;
    composer.render();
    css.render(sceneCSS, camera);
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    gl.setSize(window.innerWidth, window.innerHeight);
    css.setSize(window.innerWidth, window.innerHeight);
    if (composer) composer.setSize(window.innerWidth, window.innerHeight);
  }

  /* ---------- enter / exit ---------- */
  function enter() {
    build();
    if (active) return;
    active = true;

    prepareScreen();
    container.style.display = 'block';
    document.body.classList.add('realworld');
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    loop();
    updateButton();
  }

  function exit() {
    if (!active) return;
    active = false;

    cancelAnimationFrame(rafId);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    for (const k in keys) keys[k] = false;
    lastT = 0;
    container.style.display = 'none';
    document.body.classList.remove('realworld');
    if (screenObject) {
      sceneCSS.remove(screenObject);
      screenObject = null;
    }
    resetScreen();
    updateButton();
  }

  function updateButton() {
    const btn = document.getElementById('world-toggle');
    if (!btn) return;
    btn.innerHTML = active
      ? '<span>⌨️</span> Exit Real World'
      : '<span>🌐</span> Enter Real World';
  }

  function init() {
    // Wrap the game UI once into #screen. This is behaviour-neutral:
    // flat mode remains byte-identical to before.
    const screen = document.createElement('div');
    screen.id = 'screen';
    const roots = ['boot', 'signup', 'desktop', 'browser', 'alphamail', 'debug-bar'];
    for (const id of roots) {
      const el = document.getElementById(id);
      if (el) screen.appendChild(el);
    }
    document.body.appendChild(screen);

    // A subtle "monitor" overlay (scanlines + edge glow) shown only in
    // real-world mode. Pointer-events: none so it never blocks input.
    const overlay = document.createElement('div');
    overlay.id = 'screen-overlay';
    screen.appendChild(overlay);

    const btn = document.getElementById('world-toggle');
    if (btn) {
      btn.addEventListener('click', () => (active ? exit() : enter()));
      updateButton();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.RealWorld = { enter, exit, get active() { return active; } };
})();
