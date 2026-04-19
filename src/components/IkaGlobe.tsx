'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

/* ─── Post-processing shaders ────────────────────────────────────────────── */
// Cinematic: vignette + subtle chromatic aberration + film grain in one pass
const CinematicShader = {
  uniforms: {
    tDiffuse:     { value: null as THREE.Texture | null },
    uTime:        { value: 0 },
    uVignette:    { value: 0.85 },  // softened — was 1.15
    uAberration:  { value: 0.0008 }, // halved — was 0.0018
    uGrain:       { value: 0.018 },  // much lighter — was 0.045
    uResolution:  { value: new THREE.Vector2(1, 1) },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uVignette;
    uniform float uAberration;
    uniform float uGrain;
    uniform vec2  uResolution;
    varying vec2 vUv;

    float rand(vec2 co) {
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv;
      vec2 center = uv - 0.5;

      // Chromatic aberration — radial, stronger at edges
      float dist = length(center);
      vec2 dir = center * dist * uAberration * 8.0;
      float r = texture2D(tDiffuse, uv + dir).r;
      float g = texture2D(tDiffuse, uv).g;
      float b = texture2D(tDiffuse, uv - dir).b;
      vec3 color = vec3(r, g, b);

      // Vignette
      float vig = smoothstep(0.85, 0.25, dist * uVignette);
      color *= mix(0.55, 1.0, vig);

      // Film grain
      float grain = (rand(uv * uResolution + uTime) - 0.5) * uGrain;
      color += grain;

      // Subtle cool-space color tilt (lift blacks with dark navy, cool highlights)
      vec3 lift = vec3(0.008, 0.012, 0.020);
      color = color + lift * (1.0 - color);

      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

/* ─── Media ──────────────────────────────────────────────────────────────── */
const IKA_MEMORIES = [
  { id: 1, image: '/aal 5.jpeg',  phi: Math.PI * 0.48, theta: 0.2,            label: 'a favourite' },
  { id: 2, image: '/aal6.jpeg',   phi: Math.PI * 0.32, theta: Math.PI * 0.75, label: 'always smiling' },
  { id: 3, image: '/aal 7.jpeg',  phi: Math.PI * 0.68, theta: Math.PI * 1.45, label: 'golden hour' },
  { id: 4, image: '/aal 8.jpeg',  phi: Math.PI * 0.25, theta: Math.PI * 1.15, label: 'so you' },
  { id: 5, image: '/aal v3.mp4',  phi: Math.PI * 0.74, theta: Math.PI * 0.38, label: 'a moment' },
];

type ViewState = 'globe' | 'launching' | 'zooming' | 'exploding' | 'surface';

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function sph(phi: number, theta: number) {
  return new THREE.Vector3(
    Math.sin(phi) * Math.cos(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta),
  );
}

/* ─── Texture loaders ────────────────────────────────────────────────────── */
async function loadImageTexture(url: string): Promise<THREE.CanvasTexture | null> {
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = 'anonymous';
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const cvs = document.createElement('canvas');
    cvs.width = img.width; cvs.height = img.height;
    cvs.getContext('2d')!.drawImage(img, 0, 0);
    const tex = new THREE.CanvasTexture(cvs);
    tex.needsUpdate = true;
    return tex;
  } catch { return null; }
}

async function buildBWEarthTexture(): Promise<THREE.CanvasTexture | null> {
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = 'anonymous';
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = 'https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg';
    });
    const W = img.width, H = img.height;
    const cvs = document.createElement('canvas');
    cvs.width = W; cvs.height = H;
    const ctx = cvs.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const raw = ctx.getImageData(0, 0, W, H);
    const d = raw.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i]/255, g = d[i+1]/255, b = d[i+2]/255;
      const lum = 0.299*r + 0.587*g + 0.114*b;
      let v: number;
      if (lum > 0.80)                             v = 0.80 + (lum - 0.80);
      else if (b > r * 1.05 && b > g && b > 0.22) v = 0.06 + lum * 0.14;
      else                                          v = 0.30 + lum * 0.38;
      const noise = (Math.random() - 0.5) * 0.02;
      const out = Math.min(255, Math.max(0, (v + noise) * 255));
      d[i] = d[i+1] = d[i+2] = out;
    }
    ctx.putImageData(raw, 0, 0);
    const tex = new THREE.CanvasTexture(cvs);
    tex.needsUpdate = true;
    return tex;
  } catch { return null; }
}

function buildGreyFallbackTexture(): THREE.CanvasTexture {
  const W = 512, H = 256;
  const cvs = document.createElement('canvas');
  cvs.width = W; cvs.height = H;
  const ctx = cvs.getContext('2d')!;
  ctx.fillStyle = '#1c1c1c'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#555';
  [[0.13,0.38,0.08,0.18],[0.22,0.68,0.05,0.14],[0.49,0.26,0.04,0.08],[0.49,0.52,0.06,0.16],[0.68,0.30,0.15,0.15],[0.77,0.65,0.06,0.05]].forEach(([cx,cy,rx,ry]) => {
    ctx.beginPath(); ctx.ellipse(cx*W, cy*H, rx*W, ry*H, 0, 0, Math.PI*2); ctx.fill();
  });
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 0.5;
  for (let y=0; y<=1; y+=1/6) { ctx.beginPath(); ctx.moveTo(0,y*H); ctx.lineTo(W,y*H); ctx.stroke(); }
  for (let x=0; x<=1; x+=1/12) { ctx.beginPath(); ctx.moveTo(x*W,0); ctx.lineTo(x*W,H); ctx.stroke(); }
  const tex = new THREE.CanvasTexture(cvs);
  tex.needsUpdate = true;
  return tex;
}

/* ─── Component ─────────────────────────────────────────────────────────── */
interface IkaGlobeProps { onClose: () => void; autoPlay?: boolean; }

export default function IkaGlobe({ onClose, autoPlay = true }: IkaGlobeProps) {
  const mountRef    = useRef<HTMLDivElement>(null);
  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const frameRef    = useRef<number>(0);
  const groupRef    = useRef<THREE.Group | null>(null);
  const cameraRef   = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const cinematicPassRef = useRef<ShaderPass | null>(null);

  /* Moon refs */
  const moonPivotRef   = useRef<THREE.Group | null>(null);
  const moonMeshRef    = useRef<THREE.Mesh | null>(null);
  const moonAngleRef   = useRef(0);
  const rocketRef      = useRef<THREE.Group | null>(null);
  const launchPointRef = useRef(new THREE.Vector3());

  /* View state — ref for animation loop + React state for UI */
  const viewStateRef   = useRef<ViewState>('globe');
  const [viewState, setViewState] = useState<ViewState>('globe');
  const zoomTargetRef  = useRef(new THREE.Vector3());
  const zoomLookRef    = useRef(new THREE.Vector3());

  /* Drag */
  const isDragging = useRef(false);
  const lastMouse  = useRef({ x: 0, y: 0 });
  const velocity   = useRef({ x: 0, y: 0 });
  const rot        = useRef({ x: 0.28, y: 0 });

  /* Screen projections */
  const [pinPos,      setPinPos]      = useState<{ x: number; y: number; visible: boolean }[]>([]);
  const [launchPinPos, setLaunchPinPos] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });

  /* Moon surface message reveal */
  const [showLine1, setShowLine1] = useState(false);
  const [showLine2, setShowLine2] = useState(false);
  const [showLine3, setShowLine3] = useState(false);
  const [showBack,  setShowBack]  = useState(false);
  /* Overlay refs — mutated directly from rAF to avoid React re-renders */
  const zoomFadeRef    = useRef<HTMLDivElement>(null);
  const explosionRef   = useRef<HTMLDivElement>(null);
  const explosionValRef = useRef(0);

  /* Parallax refs for Surface View */
  const globalMouseRef = useRef({ x: 0, y: 0 });
  const layerSkyRef = useRef<HTMLDivElement>(null);
  const layerEarthRef = useRef<HTMLDivElement>(null);
  const layerTerrainRef = useRef<HTMLDivElement>(null);

  /** Set zoom-fade opacity without a React re-render */
  const setZoomFade = (v: number) => {
    if (zoomFadeRef.current) zoomFadeRef.current.style.opacity = String(v);
  };
  /** Set explosion-flash opacity without a React re-render */
  const setExplosionFade = (v: number) => {
    if (explosionRef.current) explosionRef.current.style.opacity = String(v);
  };

  /* Random stars for HTML overlay */
  const overlayStars = useMemo(() => Array.from({ length: 180 }, (_, i) => ({
    x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 1.8 + 0.4,
    opacity: Math.random() * 0.7 + 0.3,
    delay: Math.random() * 3,
  })), []);

  /* Audio */
  useEffect(() => {
    if (!autoPlay) return;
    const audio = new Audio("/Don't Let Me Go - Cigarettes After Sex.mp3");
    audio.volume = 1.0; audio.play().catch(() => {});
    audioRef.current = audio;
    const stop = () => audio.pause();
    window.addEventListener('fireworks:start', stop);
    return () => { window.removeEventListener('fireworks:start', stop); audio.pause(); };
  }, [autoPlay]);

  /* Three.js scene */
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const W = el.clientWidth || window.innerWidth;
    const H = el.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    el.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 1000);
    camera.position.set(0, 0, 3.2);
    cameraRef.current = camera;
    const defaultFov = 42;
    const cinematicFov = 28;

    /* Globe group */
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    /* Earth sphere */
    const sphereGeo = new THREE.SphereGeometry(1, 80, 80);
    const fallback  = buildGreyFallbackTexture();
    const sphereMat = new THREE.MeshPhongMaterial({ map: fallback, color: 0xffffff, specular: 0xaaaaaa, shininess: 40 });
    group.add(new THREE.Mesh(sphereGeo, sphereMat));

    /* Atmosphere — removed; bloom now handles the atmospheric glow naturally */

    /* Earth texture async */
    buildBWEarthTexture().then(tex => {
      if (tex) { sphereMat.map = tex; sphereMat.needsUpdate = true; fallback.dispose(); }
    });

    /* Photo pin dots */
    IKA_MEMORIES.forEach(mem => {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      dot.position.copy(sph(mem.phi, mem.theta));
      group.add(dot);
    });

    /* ── Moon ───────────────────────────────────────────────────────────── */
    const moonPivot = new THREE.Group();
    moonPivot.rotation.x = 0.22;
    scene.add(moonPivot);
    moonPivotRef.current = moonPivot;

    const moonGeo = new THREE.SphereGeometry(0.27, 48, 48);
    const moonMat = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, specular: 0x333333, shininess: 5 });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonMesh.position.set(2.1, 0, 0);
    moonPivot.add(moonMesh);
    moonMeshRef.current = moonMesh;

    /* Moon texture */
    loadImageTexture('https://threejs.org/examples/textures/planets/moon_1024.jpg').then(tex => {
      if (tex) { moonMat.map = tex; moonMat.color.set(0xffffff); moonMat.needsUpdate = true; }
    });

    /* Cinematic Lunar Surface (Foreground Craters) */
    const groundGeo = new THREE.SphereGeometry(30, 64, 32, 0, Math.PI * 2, 0, 0.1);
    const groundMat = new THREE.MeshPhongMaterial({ 
      color: 0x222222, 
      specular: 0x111111, 
      shininess: 2, 
      transparent: true, 
      opacity: 0 
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    scene.add(groundMesh);
    // Asynchronously load the moon texture for the ground too
    loadImageTexture('https://threejs.org/examples/textures/planets/moon_1024.jpg').then(tex => {
      if (tex) { groundMat.map = tex; groundMat.needsUpdate = true; }
    });


    /* ── OBJ Rocket ─────────────────────────────────────────────────────────── */
    const rocketGroup = new THREE.Group();

    // Rocket Fire Particles (Always visible when launching)
    const fireGeo = new THREE.BufferGeometry();
    const fireCount = 70;
    const firePos = new Float32Array(fireCount * 3);
    for (let i=0; i<fireCount; i++) {
        firePos[i*3] = (Math.random()-0.5)*0.01;
        firePos[i*3+1] = -0.05 - Math.random() * 0.1; // trail further back
        firePos[i*3+2] = (Math.random()-0.5)*0.01;
    }
    fireGeo.setAttribute('position', new THREE.BufferAttribute(firePos, 3));
    
    // Smooth Additive Glow instead of raw squares
    const fireMat = new THREE.PointsMaterial({ 
      color: 0xffaa00, 
      size: 0.012, 
      transparent: true, 
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    const fireSystem = new THREE.Points(fireGeo, fireMat);
    fireSystem.name = 'fireParticles';
    rocketGroup.add(fireSystem);

    // Engine Glow
    const engineLight = new THREE.PointLight(0xff7700, 1.5, 0.2);
    engineLight.position.set(0, -0.07, 0);
    rocketGroup.add(engineLight);

    // Load custom OBJ
    const loader = new OBJLoader();
    loader.load('/scifi_cartoon_rocket.obj', (obj) => {
      
      // Strip out giant planes or boundary boxes
      const toRemove: THREE.Object3D[] = [];
      obj.traverse((child) => {
        if (child.name.toLowerCase().includes('plane')) {
          toRemove.push(child);
        }
      });
      toRemove.forEach(c => c.parent?.remove(c));

      // Auto-assign cartoonish gloss materials and fix bounding
      obj.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          // Assign fallback white gloss if material lacks properties
          if (!mesh.material || (Array.isArray(mesh.material) && mesh.material.length === 0)) {
            mesh.material = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.1, roughness: 0.4 });
          } else {
             // If materials exist (e.g., from an MTL file side-load), make sure they look good
             if (!Array.isArray(mesh.material)){
               (mesh.material as THREE.MeshStandardMaterial).roughness = 0.4;
               (mesh.material as THREE.MeshStandardMaterial).metalness = 0.2;
             }
          }
        }
      });

      // Normalize size to perfectly fit ~0.1 units like the old rocket
      const box = new THREE.Box3().setFromObject(obj);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 0.1 / maxDim;
      
      // Center the object
      const center = new THREE.Vector3();
      box.getCenter(center);
      
      const wrapper = new THREE.Group();
      obj.position.sub(center); // perfectly centered local
      wrapper.add(obj);
      wrapper.scale.setScalar(scale);

      // Rocket .obj models from standard modeling tools usually point 'up' the Z axis.
      // E.g. in Blender, Z is up, Y is forward. We need the nose pointing up the +Y axis.
      // Depending on the model, we may need a -Math.PI/2 rotation on X to point nose up. 
      // If it looks sideways, you can change wrapper.rotation.x below. Let's try pointing Z up.
      // wrapper.rotation.x = -Math.PI / 2;

      rocketGroup.add(wrapper);
    }, undefined, (e) => console.error("Could not load rocket obj", e));

    rocketGroup.visible = false;
    scene.add(rocketGroup);
    rocketRef.current = rocketGroup;

    // Launch point on Earth surface (latitude/longitude like)
    launchPointRef.current.copy(sph(Math.PI * 0.35, Math.PI * 1.75));


    /* Lights */
    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(4, 2, 3);
    scene.add(key);
    scene.add(new THREE.PointLight(0xffffff, 0.5, 12).position.set(-3, -1, -2) && (() => { const l = new THREE.PointLight(0xffffff, 0.5, 12); l.position.set(-3, -1, -2); return l; })());

    /* Stars */
    const pBuf = new Float32Array(800 * 3);
    for (let i = 0; i < 800; i++) {
      pBuf[i*3]   = (Math.random()-0.5)*25;
      pBuf[i*3+1] = (Math.random()-0.5)*25;
      pBuf[i*3+2] = (Math.random()-0.5)*25;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pBuf, 3));
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.02, transparent: true, opacity: 0.6 })));

    /* ── Post-processing pipeline ─────────────────────────────────────── */
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    // Bloom — subtle, cinematic
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(W, H),
      0.35,   // strength
      0.55,   // radius
      0.82,   // threshold (only bright surfaces bloom)
    );
    composer.addPass(bloomPass);

    // Cinematic: vignette + chromatic aberration + film grain
    const cinematicPass = new ShaderPass(CinematicShader);
    cinematicPass.uniforms.uResolution.value.set(W, H);
    composer.addPass(cinematicPass);
    cinematicPassRef.current = cinematicPass;

    // Final color-space correction
    composer.addPass(new OutputPass());

    composerRef.current = composer;

    /* Resize */
    const onResize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h);
      composer.setSize(w, h);
      bloomPass.resolution.set(w, h);
      cinematicPass.uniforms.uResolution.value.set(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    /* Render loop */
    const tmpVec   = new THREE.Vector3();
    const poleVec  = new THREE.Vector3(0, 0.27, 0); // north pole in moon local space

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      const vs = viewStateRef.current;

      if (vs === 'globe') {
        /* Normal globe interaction */
        if (!isDragging.current) {
          velocity.current.x *= 0.93;
          velocity.current.y *= 0.93;
          if (Math.abs(velocity.current.y) < 0.0009) velocity.current.y = 0.0018;
        }
        rot.current.x += velocity.current.x;
        rot.current.y += velocity.current.y;
        rot.current.x = Math.max(-Math.PI/2.2, Math.min(Math.PI/2.2, rot.current.x));
        group.rotation.x = rot.current.x;
        group.rotation.y = rot.current.y;

      } else if (vs === 'launching') {
        /* Rocket launch sequence */
        const rocket = rocketRef.current;
        if (rocket) {
          rocket.visible = true;
          
          // Orbital Mechanics: Calculate real-time telemetry towards the moon
          let distToMoon = 100;
          const moonMesh = moonMeshRef.current;
          if (moonMesh) {
             const moonPos = new THREE.Vector3();
             moonMesh.getWorldPosition(moonPos);
             
             // Smoothly arc the rocket's nose towards the Moon's coordinates
             const dirToMoon = moonPos.clone().sub(rocket.position).normalize();
             rocket.up.lerp(dirToMoon, 0.015).normalize();
             rocket.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), rocket.up);
             
             distToMoon = rocket.position.distanceTo(moonPos);
          }

          // Move rocket outwards VERY SLOWLY along its curved trajectory
          rocket.position.add(rocket.up.clone().multiplyScalar(0.0028));

          // Animate fire particles backwards
          const firePts = rocket.children.find(c => c.name === 'fireParticles') as THREE.Points;
          if (firePts) {
            const arr = firePts.geometry.attributes.position.array as Float32Array;
            for(let i=0; i<70; i++) {
               arr[i*3+1] -= 0.004; // fall back
               if (arr[i*3+1] < -0.15) {
                  arr[i*3+1] = -0.04;
                  arr[i*3] = (Math.random()-0.5)*0.01;
                  arr[i*3+2] = (Math.random()-0.5)*0.01;
               }
            }
            firePts.geometry.attributes.position.needsUpdate = true;
          }
          
          // Construct cinematic 3/4 chase curve framing
          const forward = rocket.up.clone();
          const upVec = new THREE.Vector3(0, 1, 0);
          if (Math.abs(forward.dot(upVec)) > 0.99) upVec.set(1, 0, 0); // avoid gimbal lock
          const right = new THREE.Vector3().crossVectors(upVec, forward).normalize();
          const top = new THREE.Vector3().crossVectors(forward, right).normalize();

          // Camera gently trails in a cinematic offset (behind, right, and up)
          const camTargetPos = rocket.position.clone()
            .add(forward.clone().multiplyScalar(-0.12))
            .add(right.clone().multiplyScalar(0.04))
            .add(top.clone().multiplyScalar(0.035));
          
          camera.position.lerp(camTargetPos, 0.04);
          // Angle gaze towards the rocket's fuselage
          camera.lookAt(rocket.position.clone().add(forward.clone().multiplyScalar(0.03)));
          
          // Trigger explosion specifically when intercepting the moon's inner proximity
          if (distToMoon < 0.65) {
            handleTransitionToSurface(); // Calculate moon targets right before exploding
            explosionValRef.current = 0;
            viewStateRef.current = 'exploding';
          }
        }

      } else if (vs === 'exploding') {
        explosionValRef.current += 0.015; // Slower speed of explosion

        // 0 to 0.5: Ramp up white flash
        // 0.5 to 1.5: Ramp down white flash
        let flashOpacity = 0;
        if (explosionValRef.current < 0.5) {
          flashOpacity = explosionValRef.current * 2;
        } else {
          flashOpacity = Math.max(0, 1 - (explosionValRef.current - 0.5));
        }
        setExplosionFade(flashOpacity);

        // At peak of explosion, snap the camera to the moon and hide the rocket
        if (explosionValRef.current >= 0.5 && explosionValRef.current < 0.55) {
          if (rocketRef.current) rocketRef.current.visible = false;
          
          camera.position.copy(zoomTargetRef.current);
          camera.lookAt(zoomLookRef.current);
          camera.fov = cinematicFov;
          camera.updateProjectionMatrix();

          setZoomFade(1); 
        }

        // When explosion finishes
        if (explosionValRef.current >= 1.5) {
           viewStateRef.current = 'surface';
           setViewState('surface');
           
           setTimeout(() => setShowLine1(true), 500);
           setTimeout(() => setShowLine2(true), 1500);
           setTimeout(() => setShowLine3(true), 2700);
           setTimeout(() => setShowBack(true), 4000);
        }

      } else if (vs === 'surface') {
        camera.position.lerp(zoomTargetRef.current, 0.008);
        const t = Date.now() * 0.00012;
        camera.lookAt(new THREE.Vector3(
          zoomLookRef.current.x + Math.sin(t) * 0.04,
          zoomLookRef.current.y + Math.cos(t * 0.75) * 0.015,
          zoomLookRef.current.z,
        ));

        // Calculate and apply Parallax logic strictly to DOM
        const mx = globalMouseRef.current.x;
        const my = globalMouseRef.current.y;
        if (layerSkyRef.current) {
           layerSkyRef.current.style.transform = `translate(${mx * -8}px, ${-my * -8}px) scale(1.05)`;
        }
        if (layerEarthRef.current) {
           layerEarthRef.current.style.transform = `translate(${mx * -24}px, ${-my * -24}px) scale(1.05)`;
        }
        if (layerTerrainRef.current) {
           layerTerrainRef.current.style.transform = `translate(${mx * 28}px, ${-my * 28}px) scale(1.05)`;
        }
      }

      /* Moon dynamic orbit */
      let orbitSpeed = 0.003;
      const angleSin = Math.sin(moonPivot.rotation.y);
      if (angleSin > 0.1) {
         // Positive Sine indicates Moon is sweeping behind Earth -> accelerate
         orbitSpeed = 0.015;
      } else if (angleSin < -0.1) {
         // Negative Sine indicates Moon is sweeping across the front -> decelerate so it stays visible longer
         orbitSpeed = 0.0008;
      }
      // Only orbit if we're not inside the surface or exploding views
      if (vs === 'globe' || vs === 'launching') {
         moonPivot.rotation.y += orbitSpeed;
      }
      moonMesh.rotation.y += 0.002; // Moon's own axial rotation

      // Advance cinematic shader time uniform for animated film grain
      if (cinematicPassRef.current) {
        cinematicPassRef.current.uniforms.uTime.value += 0.016;
      }

      // Render through the post-processing composer instead of raw renderer
      if (composerRef.current) {
        composerRef.current.render();
      } else {
        renderer.render(scene, camera);
      }

      /* Project photo pins */
      const cw = el.clientWidth, ch = el.clientHeight;
      if (vs === 'globe') {
        setPinPos(IKA_MEMORIES.map(mem => {
          const wp = sph(mem.phi, mem.theta).applyEuler(new THREE.Euler(rot.current.x, rot.current.y, 0));
          const ndc = wp.clone().project(camera);
          return { x: ((ndc.x+1)/2)*cw, y: ((-ndc.y+1)/2)*ch, visible: wp.z > 0.05 };
        }));

        /* Project launch pin (North Pole of Earth) to screen */
        const launchWP = launchPointRef.current.clone().applyEuler(new THREE.Euler(rot.current.x, rot.current.y, 0));
        const ndc = launchWP.clone().project(camera);
        setLaunchPinPos({
          x: ((ndc.x+1)/2)*cw,
          y: ((-ndc.y+1)/2)*ch,
          visible: launchWP.z > 0 && Math.abs(ndc.x) < 1.1 && Math.abs(ndc.y) < 1.1 && ndc.z < 1,
        });
      }
    };
    animate();

      const onGlobalMouseMove = (e: MouseEvent) => {
        globalMouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
        globalMouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      };
      window.addEventListener('mousemove', onGlobalMouseMove);

      return () => {
        cancelAnimationFrame(frameRef.current);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('mousemove', onGlobalMouseMove);
        composerRef.current?.dispose();
        renderer.dispose();
        if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      };
    }, []);

  /* ── Drag ────────────────────────────────────────────────────────────── */
  const onPointerDown = (e: React.PointerEvent) => {
    if (viewStateRef.current !== 'globe') return;
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    velocity.current = { x: 0, y: 0 };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    velocity.current = { x: dy * 0.006, y: dx * 0.006 };
    rot.current.x += dy * 0.006;
    rot.current.y += dx * 0.006;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = () => { isDragging.current = false; };

  const handleLaunchClick = () => {
    const rocket = rocketRef.current;
    const camera = cameraRef.current;
    if (!rocket || !camera) return;
    
    // Spawn rocket at the exact current world position of the pin on the rotating globe
    const startPos = launchPointRef.current.clone().applyEuler(new THREE.Euler(rot.current.x, rot.current.y, 0));
    
    rocket.position.copy(startPos);
    // Our OBJ scales locally, pointing its nose up the +Y axis.
    // We map its +Y axis exactly to the outward normal of the Earth
    const normal = startPos.clone().normalize();
    rocket.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    rocket.up.copy(normal); // save it so `animate` can move along `rocket.up`
    rocket.visible = true;

    // Immediately snap the camera into the exact 3/4 chase framing
    const upVec = new THREE.Vector3(0, 1, 0);
    if (Math.abs(normal.dot(upVec)) > 0.99) upVec.set(1, 0, 0);
    const right = new THREE.Vector3().crossVectors(upVec, normal).normalize();
    const top = new THREE.Vector3().crossVectors(normal, right).normalize();

    const camTarget = startPos.clone()
        .add(normal.clone().multiplyScalar(-0.06))
        .add(right.clone().multiplyScalar(0.02))
        .add(top.clone().multiplyScalar(0.015));

    camera.position.copy(camTarget);
    camera.lookAt(startPos.clone().add(normal.clone().multiplyScalar(0.03)));

    viewStateRef.current = 'launching';
    setViewState('launching');
    setShowLine1(false); setShowLine2(false); setShowLine3(false); setShowBack(false);
  };

  const handleTransitionToSurface = () => {
    const moonMesh = moonMeshRef.current;
    if (!moonMesh) return;

    const moonPos = new THREE.Vector3();
    moonMesh.getWorldPosition(moonPos);

    const dirToEarth = new THREE.Vector3(0, 0, 0).sub(moonPos).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const surfacePos = moonPos.clone().add(dirToEarth.clone().multiplyScalar(0.265)).add(up.clone().multiplyScalar(0.02));
    zoomTargetRef.current = surfacePos;
    zoomLookRef.current = new THREE.Vector3(0, 0.2, 1).normalize().multiplyScalar(10).add(moonPos);

    // Note: We no longer transition to 'zooming', the render loop's 'exploding' state will snap us here.
    // We just prepare the targets.
  };

  /* ── Back from moon ──────────────────────────────────────────────────── */
  const handleBackFromMoon = () => {
    if (rocketRef.current) rocketRef.current.visible = false;
    const camera = cameraRef.current;
    if (!camera) return;
    camera.position.set(0, 0, 3.2);
    camera.lookAt(0, 0, 0);
    camera.fov = 42;
    camera.updateProjectionMatrix();
    
    rot.current = { x: 0.28, y: 0 };
    velocity.current = { x: 0, y: 0 };
    viewStateRef.current = 'globe';
    setViewState('globe');
    setShowLine1(false); setShowLine2(false); setShowLine3(false); setShowBack(false);
    setZoomFade(0);
    setExplosionFade(0);
    explosionValRef.current = 0;
  };

  const CARD_W = 108;
  const IMG_H  = Math.round(CARD_W * 16 / 9);

  return (
    <div style={{ width:'100vw', height:'100vh', position:'relative', overflow:'hidden', background:'#000' }}>

      {/* Fade to black overlay — opacity driven by ref, never causes React re-render */}
      <div ref={zoomFadeRef} style={{
        position:'absolute', inset:0, zIndex:100, pointerEvents:'none',
        background:'#000', opacity: 0,
      }} />

      {/* Explosion white flash — opacity driven by ref */}
      <div ref={explosionRef} style={{
        position:'absolute', inset:0, zIndex:101, pointerEvents:'none',
        background:'#fff', opacity: 0, mixBlendMode: 'screen',
      }} />

      {/* Spotlight glow */}
      <div style={{
        position:'absolute', inset:0, zIndex:0, pointerEvents:'none',
        background:'radial-gradient(ellipse 40% 50% at 50% 52%, rgba(255,255,255,0.04) 0%, transparent 70%)',
      }} />

      {/* Three.js target */}
      <div
        ref={mountRef}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
        style={{ position:'absolute', inset:0, zIndex:1, cursor: viewState === 'globe' ? 'grab' : 'default' }}
      />

      {/* Film grain */}
      <div style={{
        position:'absolute', inset:0, zIndex:2, pointerEvents:'none',
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundRepeat:'repeat', backgroundSize:'300px 300px',
        opacity:0.038, mixBlendMode:'overlay',
      }} />

      {/* ── Photo polaroid pins ─────────────────────────────────────────── */}
      {viewState === 'globe' && pinPos.map((pos, i) => {
        const mem = IKA_MEMORIES[i];
        if (!pos.visible) return null;
        const tilt = (i % 2 === 0 ? 1 : -1) * (1.0 + i * 0.55);
        return (
          <div key={mem.id} style={{
            position:'absolute', left:pos.x, top:pos.y,
            transform:'translate(-50%, -103%)',
            zIndex:20, pointerEvents:'none',
          }}>
            <div style={{
              width:'1px', height:'26px', margin:'0 auto',
              background:'linear-gradient(to top, rgba(255,255,255,0.5), transparent)', position:'relative',
            }}>
              <div style={{
                position:'absolute', bottom:'-4px', left:'50%', transform:'translateX(-50%)',
                width:'6px', height:'6px', borderRadius:'50%',
                background:'#fff', boxShadow:'0 0 7px rgba(255,255,255,0.8)',
              }} />
            </div>
            <div style={{
              width: CARD_W, background:'#f4f4f4', borderRadius:'2px',
              padding:'5px 5px 18px 5px',
              boxShadow:'0 14px 50px rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,0.7)',
              transform:`rotate(${tilt}deg)`,
            }}>
              <div style={{ width:'100%', height: IMG_H, overflow:'hidden', borderRadius:'1px', background:'#111' }}>
                {mem.image.endsWith('.mp4') ? (
                  <video src={mem.image} autoPlay muted loop playsInline
                    style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                ) : (
                  <img src={mem.image} alt="" draggable={false}
                    style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                )}
              </div>
              <p style={{
                fontFamily:'var(--serif)', fontStyle:'italic', fontSize:'8px',
                color:'#555', textAlign:'center', marginTop:'5px', lineHeight:1.2,
              }}>{mem.label}</p>
            </div>
          </div>
        );
      })}

      {/* ── Read Message pin — global launch pin ─────────────────────────── */}
      {viewState === 'globe' && launchPinPos.visible && (
        <button
          onClick={handleLaunchClick}
          style={{
            position:'absolute',
            left: launchPinPos.x, top: launchPinPos.y,
            transform:'translate(-50%, -108%)',
            zIndex:25, background:'transparent', border:'none', cursor:'pointer',
            display:'flex', flexDirection:'column', alignItems:'center', gap:0,
            padding:0,
          }}
        >
          {/* Frosted glass card */}
          <div style={{
            width:'130px',
            background:'rgba(255,255,255,0.07)',
            border:'1px solid rgba(255,255,255,0.35)',
            borderRadius:'10px',
            backdropFilter:'blur(14px)',
            padding:'16px 14px 14px',
            display:'flex', flexDirection:'column', alignItems:'center', gap:'10px',
            boxShadow:'0 8px 36px rgba(0,0,0,0.65)',
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.14)';
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.6)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.07)';
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.35)';
            }}
          >
            {/* Pulsing dot */}
            <div style={{ position:'relative', width:'30px', height:'30px', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ position:'absolute', width:'30px', height:'30px', borderRadius:'50%', border:'1px solid rgba(255,255,255,0.8)', animation:'moonPing 2s ease-out infinite' }} />
              <div style={{ position:'absolute', width:'30px', height:'30px', borderRadius:'50%', border:'1px solid rgba(255,255,255,0.4)', animation:'moonPing 2s ease-out infinite 0.75s' }} />
              <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#fff', boxShadow:'0 0 10px rgba(255,255,255,1)' }} />
            </div>
            <div style={{ textAlign:'center' }}>
              <p style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:'11.5px', color:'rgba(255,255,255,0.9)', lineHeight:1.3, margin:0 }}>
                read message
              </p>
              <p style={{ fontFamily:'var(--sans)', fontSize:'8px', color:'rgba(255,255,255,0.38)', letterSpacing:'0.13em', textTransform:'uppercase', margin:'4px 0 0' }}>
                launch rocket
              </p>
            </div>
          </div>
          {/* Thread connector */}
          <div style={{ width:'1px', height:'22px', background:'linear-gradient(to bottom, rgba(255,255,255,0.35), transparent)' }} />
        </button>
      )}


      {/* ── Moon surface scene overlay ───────────────────────────────────── */}
      {(viewState === 'surface') && (
        <div style={{
          position:'absolute', inset:0, zIndex:105,
          pointerEvents: showBack ? 'auto' : 'none',
          overflow:'hidden',
          backgroundColor:'#000',
        }}>
          {/* Layer 1: Starfield — z:1, lowest */}
          <div ref={layerSkyRef} style={{
            position:'absolute', inset:-40, zIndex:1,
            backgroundImage:'url(/NIGHTSKY.png)', backgroundSize:'cover', backgroundPosition:'center',
            willChange:'transform',
          }} />

          {/* Layer 2: Earth — z:2, screen blended over sky */}
          <div ref={layerEarthRef} style={{
            position:'absolute', inset:-40, zIndex:2,
            backgroundImage:'url(/EARTH.png)', backgroundSize:'cover', backgroundPosition:'center',
            mixBlendMode:'screen',
            willChange:'transform',
          }} />

          {/* Layer 3: Terrain — z:3, masked to bottom half */}
          <div ref={layerTerrainRef} style={{
            position:'absolute', inset:-40, zIndex:3,
            backgroundImage:'url(/MOONSURFACE.png)', backgroundSize:'cover', backgroundPosition:'center',
            WebkitMaskImage:'linear-gradient(to bottom, transparent 35%, black 48%)',
            maskImage:'linear-gradient(to bottom, transparent 35%, black 48%)',
            willChange:'transform',
          }} />

          {/* ── POST-PROCESSING STACK ─────────────────────────────────────── */}

          {/* P1: Bottom darkness — terrain contrast */}
          <div style={{ position:'absolute', inset:0, zIndex:4, pointerEvents:'none',
            background:'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.25) 45%, transparent 100%)' }} />

          {/* P2: Deep elliptical vignette */}
          <div style={{ position:'absolute', inset:0, zIndex:5, pointerEvents:'none',
            background:'radial-gradient(ellipse 75% 70% at 50% 45%, transparent 15%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.88) 100%)' }} />

          {/* P3: Cool color grade — lifts shadows with a dark navy blue tint */}
          <div style={{ position:'absolute', inset:0, zIndex:6, pointerEvents:'none',
            background:'linear-gradient(160deg, rgba(8,16,40,0.35) 0%, transparent 60%)',
            mixBlendMode:'multiply' }} />

          {/* P4: Chromatic aberration — red channel fringe at top */}
          <div style={{ position:'absolute', inset:0, zIndex:7, pointerEvents:'none',
            background:'linear-gradient(to bottom, rgba(255,30,30,0.018) 0%, transparent 30%)',
            mixBlendMode:'screen', transform:'translate(-1px,0)' }} />
          {/* P4b: Blue channel fringe at bottom */}
          <div style={{ position:'absolute', inset:0, zIndex:7, pointerEvents:'none',
            background:'linear-gradient(to top, rgba(30,80,255,0.022) 0%, transparent 30%)',
            mixBlendMode:'screen', transform:'translate(1px,0)' }} />

          {/* P5: Animated film grain */}
          <div style={{
            position:'absolute', inset:0, zIndex:8, pointerEvents:'none',
            backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundRepeat:'repeat', backgroundSize:'300px 300px',
            opacity:0.055, mixBlendMode:'overlay',
            animation:'grainShift 0.12s steps(1) infinite',
          }} />

          {/* P6: Scanlines — CRT texture */}
          <div style={{
            position:'absolute', inset:0, zIndex:9, pointerEvents:'none',
            backgroundImage:'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)',
            opacity:0.5,
          }} />

          {/* Overlay stars — sky area only */}
          {overlayStars.map((s, i) => (
            <div key={i} style={{
              position:'absolute',
              left:`${s.x}%`, top:`${s.y * 0.5}%`,
              width:`${s.size}px`, height:`${s.size}px`,
              borderRadius:'50%', background:'#fff',
              opacity: s.opacity * 0.5,
              animation:`twinkle ${2 + s.delay}s ease-in-out infinite`,
              pointerEvents:'none', zIndex:1,
            }} />
          ))}

          {/* ── HUD — top left coordinate beacon ── */}
          <div style={{
            position:'absolute', top:'6vh', left:'6vw', zIndex:10,
            opacity: showLine1 ? 1 : 0,
            transform: showLine1 ? 'translateY(0)' : 'translateY(-12px)',
            transition:'opacity 1.2s cubic-bezier(0.16,1,0.3,1), transform 1.2s cubic-bezier(0.16,1,0.3,1)',
            display:'flex', flexDirection:'column', gap:'0.35rem',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
              {/* Pulsing beacon dot */}
              <div style={{ position:'relative', width:'8px', height:'8px', flexShrink:0 }}>
                <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'rgba(255,255,255,0.9)', boxShadow:'0 0 8px rgba(255,255,255,0.8)' }} />
                <div style={{ position:'absolute', inset:'-5px', borderRadius:'50%', border:'1px solid rgba(255,255,255,0.3)', animation:'moonPing 2.4s ease-out infinite' }} />
              </div>
              <span style={{
                fontFamily:'var(--sans), monospace', fontSize:'0.58rem',
                color:'rgba(255,255,255,0.5)', letterSpacing:'0.22em', textTransform:'uppercase',
              }}>
                Lunar Surface · 00°N 00°W
              </span>
            </div>
            <div style={{
              display:'flex', gap:'1.5rem', paddingLeft:'1.4rem',
              opacity: showLine2 ? 1 : 0,
              transform: showLine2 ? 'translateY(0)' : 'translateY(-8px)',
              transition:'opacity 1s cubic-bezier(0.16,1,0.3,1) 0.2s, transform 1s cubic-bezier(0.16,1,0.3,1) 0.2s',
            }}>
              <span style={{ fontFamily:'var(--sans), monospace', fontSize:'0.55rem', color:'rgba(255,255,255,0.28)', letterSpacing:'0.18em', textTransform:'uppercase' }}>
                384,400 km
              </span>
              <span style={{ fontFamily:'var(--sans), monospace', fontSize:'0.55rem', color:'rgba(255,255,255,0.28)', letterSpacing:'0.18em', textTransform:'uppercase' }}>
                T+00:04:37
              </span>
            </div>
          </div>

          {/* ── Return button — top right ── */}
          <button
            onClick={handleBackFromMoon}
            style={{
              position:'absolute', top:'6vh', right:'6vw', zIndex:20,
              background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.15)',
              color:'rgba(255,255,255,0.45)',
              fontFamily:'var(--sans)', textTransform:'uppercase', letterSpacing:'0.2em',
              fontSize:'0.6rem', cursor:'pointer', backdropFilter:'blur(8px)',
              borderRadius:'100px', padding:'0.55rem 1.4rem',
              transition:'all 0.4s cubic-bezier(0.16,1,0.3,1)',
              opacity: showBack ? 1 : 0, pointerEvents: showBack ? 'auto' : 'none',
              display:'flex', alignItems:'center', gap:'0.6rem',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background='rgba(255,255,255,0.12)';
              e.currentTarget.style.borderColor='rgba(255,255,255,0.4)';
              e.currentTarget.style.color='rgba(255,255,255,0.9)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background='rgba(255,255,255,0.05)';
              e.currentTarget.style.borderColor='rgba(255,255,255,0.15)';
              e.currentTarget.style.color='rgba(255,255,255,0.45)';
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Return
          </button>

          {/* ── Central message — full editorial treatment ── */}
          <div style={{
            position:'absolute', inset:0, zIndex:10,
            display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center',
            pointerEvents:'none',
          }}>
            {/* Thin decorative rule above */}
            <div style={{
              width: showLine2 ? '80px' : '0px',
              height:'1px',
              background:'linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent)',
              marginBottom:'2rem',
              transition:'width 1.4s cubic-bezier(0.16,1,0.3,1) 0.3s',
            }} />

            {/* Label */}
            <p style={{
              fontFamily:'var(--sans)', fontSize:'0.62rem', letterSpacing:'0.35em',
              textTransform:'uppercase', color:'rgba(255,255,255,0.3)', margin:'0 0 1.6rem',
              opacity: showLine1 ? 1 : 0, transform: showLine1 ? 'translateY(0)' : 'translateY(10px)',
              transition:'opacity 1.2s cubic-bezier(0.16,1,0.3,1), transform 1.2s cubic-bezier(0.16,1,0.3,1)',
            }}>
              a message from 384,400 km away
            </p>

            {/* Main quote — the hero */}
            <p style={{
              fontFamily:'var(--serif)', fontStyle:'italic',
              fontSize:'clamp(2rem, 5vw, 3.8rem)',
              color:'rgba(255,255,255,0.95)',
              lineHeight:1.25, letterSpacing:'-0.01em',
              textAlign:'center', margin:0,
              maxWidth:'700px', padding:'0 2rem',
              opacity: showLine3 ? 1 : 0,
              transform: showLine3 ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.97)',
              transition:'opacity 2s cubic-bezier(0.16,1,0.3,1), transform 2s cubic-bezier(0.16,1,0.3,1)',
              textShadow:'0 2px 40px rgba(0,0,0,0.8), 0 0 80px rgba(255,255,255,0.05)',
            }}>
              And somehow, you&rsquo;re the only one I think&nbsp;of.
            </p>

            {/* Attribution */}
            <p style={{
              fontFamily:'var(--sans)', fontSize:'0.6rem', letterSpacing:'0.25em',
              textTransform:'uppercase', color:'rgba(255,255,255,0.2)',
              marginTop:'2rem',
              opacity: showBack ? 1 : 0, transform: showBack ? 'translateY(0)' : 'translateY(10px)',
              transition:'opacity 1.2s cubic-bezier(0.16,1,0.3,1) 0.3s, transform 1.2s cubic-bezier(0.16,1,0.3,1) 0.3s',
            }}>
              — aal
            </p>

            {/* Thin decorative rule below */}
            <div style={{
              width: showLine2 ? '80px' : '0px',
              height:'1px',
              background:'linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent)',
              marginTop:'2rem',
              transition:'width 1.4s cubic-bezier(0.16,1,0.3,1) 0.5s',
            }} />
          </div>
        </div>
      )}



      {/* ── Header (globe view only) ─────────────────────────────────────── */}
      {viewState === 'globe' && (
        <div style={{
          position:'absolute', top:'3rem', left:'50%', transform:'translateX(-50%)',
          textAlign:'center', zIndex:30, pointerEvents:'none',
        }}>
          <p style={{
            fontFamily:'var(--sans)', fontSize:'0.58rem', letterSpacing:'0.38em',
            color:'rgba(255,255,255,0.25)', marginBottom:'0.55rem', textTransform:'uppercase',
          }}>
            a secret little archive
          </p>
          <h2 style={{
            fontFamily:'var(--serif)', fontStyle:'italic',
            fontSize:'clamp(1.6rem, 3.2vw, 2.5rem)', color:'rgba(255,255,255,0.85)',
            fontWeight:400, lineHeight:1.1,
          }}>
            just for you
          </h2>
        </div>
      )}

      {/* ── Footer (globe view only) ─────────────────────────────────────── */}
      {viewState === 'globe' && (
        <div style={{
          position:'absolute', bottom:'2.5rem', left:'50%', transform:'translateX(-50%)',
          zIndex:30, display:'flex', flexDirection:'column', alignItems:'center', gap:'1rem',
        }}>
          <p style={{
            fontFamily:'var(--serif)', fontStyle:'italic',
            color:'rgba(255,255,255,0.2)', fontSize:'0.76rem', letterSpacing:'0.04em',
          }}>
            spin it around
          </p>
          <button
            onClick={onClose}
            style={{
              background:'transparent', border:'1px solid rgba(255,255,255,0.18)',
              color:'rgba(255,255,255,0.5)',
              fontFamily:'var(--serif)', fontStyle:'italic',
              fontSize:'0.85rem', padding:'0.6rem 2rem',
              borderRadius:'100px', cursor:'pointer',
              backdropFilter:'blur(6px)', transition:'all 0.3s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.5)'; e.currentTarget.style.color='rgba(255,255,255,0.9)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.18)'; e.currentTarget.style.color='rgba(255,255,255,0.5)'; }}
          >
            go back ←
          </button>
        </div>
      )}

      <style>{`
        @keyframes moonPing {
          0%   { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50%       { opacity: 1; }
        }
        @keyframes grainShift {
          0%  { background-position:   0%   0%; }
          10% { background-position:  25%  10%; }
          20% { background-position:  50%   5%; }
          30% { background-position:  75%  20%; }
          40% { background-position: 100%  15%; }
          50% { background-position:  10%  80%; }
          60% { background-position:  40%  60%; }
          70% { background-position:  60%  40%; }
          80% { background-position:  80%  90%; }
          90% { background-position:  20%  70%; }
        }
      `}</style>
    </div>
  );
}
