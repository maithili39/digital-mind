import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MOBILE_BREAKPOINT, MOBILE_MULTIPLIER } from '../constants';

gsap.registerPlugin(ScrollTrigger);

// ── Floating Brain Labels ──────────────────────────────────────
function AnatomyLabel({ top, left, right, bottom, lineAngle, title, sub, delay, isRight }) {
  return (
    <div className="brain-label" style={{ 
      top, left, right, bottom, 
      animationDelay: `${delay}s` 
    }}>
      <div style={{ position: 'relative' }}>
        <span className="label-title">{title}</span>
        <span className="label-sub">{sub}</span>
        {/* The pointing line */}
        <div style={{
          position: 'absolute',
          width: '2px', height: '20px',
          background: 'var(--cyan)',
          top: '100%', left: isRight ? 'auto' : '10px', right: isRight ? '10px' : 'auto',
          transform: `rotate(${lineAngle}deg)`,
          transformOrigin: 'top center',
          opacity: 0.5
        }} />
      </div>
    </div>
  );
}

// ── Brain Activity HUD ─────────────────────────────────────────
function BrainActivityHUD({ activeCount, totalCount }) {
  const [fires, setFires] = useState(900);
  const [speed, setSpeed] = useState(280);
  const [leftPct, setLeftPct] = useState(50);
  
  useEffect(() => {
    const inter = setInterval(() => {
      setFires(Math.floor(Math.random() * (1203 - 847 + 1)) + 847);
      setSpeed(Math.floor(Math.random() * (312 - 268 + 1)) + 268);
      setLeftPct(Math.floor(Math.random() * 20) + 40); // 40-60%
    }, 800);
    return () => clearInterval(inter);
  }, []);

  const renderBar = (pct, chars) => {
    const filled = Math.round((pct / 100) * chars);
    return '█'.repeat(filled) + '░'.repeat(chars - filled);
  };

  return (
    <div className="brain-hud">
      <div style={{ marginBottom: '8px' }}>NEURAL ACTIVITY MONITOR</div>
      <div style={{ color: 'var(--dim)', marginBottom: '4px' }}>───────────────────────</div>
      <div className="hud-row">
        <span>Active neurons</span>
        <span className="hud-val">[{activeCount.toLocaleString()} / {totalCount.toLocaleString()}]</span>
      </div>
      <div className="hud-row">
        <span>Synaptic fires/sec</span>
        <span className="hud-val">[{fires.toLocaleString()}]</span>
      </div>
      <div className="hud-row">
        <span>Signal speed</span>
        <span className="hud-val">[{speed} m/s]</span>
      </div>
      <div className="hud-row">
        <span>Hemispheres</span>
        <span className="hud-val">L {renderBar(leftPct, 6)}  R {renderBar(100 - leftPct, 6)}</span>
      </div>
      <div style={{ color: 'var(--dim)', marginTop: '4px', marginBottom: '8px' }}>───────────────────────</div>
      <div className="hud-status">STATUS: AWAKE</div>
    </div>
  );
}

// ── Main Export ──────────────────────────────────────────────
export default function HeroSection() {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const subRef = useRef(null);
  const hintRef = useRef(null);
  const eyebrowRef = useRef(null);
  const typingRef = useRef(null);
  const sceneParams = useRef({ total: 8000, active: 200 });
  const [isReady, setIsReady] = useState(false);

  // ── Three.js Brain Scene ─────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let animId = null;
    let disposed = false;

    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    const TOTAL_PARTICLES = isMobile ? 4000 : 8000;
    const ACTIVE_PARTICLES = isMobile ? 100 : 200;
    sceneParams.current = { total: TOTAL_PARTICLES, active: ACTIVE_PARTICLES };

    (async () => {
      const THREE = await import('three');
      if (disposed) return;

      const W = window.innerWidth;
      const H = window.innerHeight;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const scene = new THREE.Scene();
      scene.background = null;

      const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
      camera.position.set(0, 0.5, 7);

      const brainGroup = new THREE.Group();
      scene.add(brainGroup);

      // Layer 1: Base Skull Wireframe
      const geo1 = new THREE.SphereGeometry(2.8, 32, 32);
      const mat1 = new THREE.MeshBasicMaterial({ wireframe: true, color: 0x7c3aed, opacity: 0.08, transparent: true });
      const mesh1 = new THREE.Mesh(geo1, mat1);
      brainGroup.add(mesh1);

      // Layer 1.5: Brain Folds Deformed Sphere
      const geo2 = new THREE.SphereGeometry(2.4, 24, 24);
      const pos2 = geo2.attributes.position;
      for (let i = 0; i < pos2.count; i++) {
        const x = pos2.getX(i);
        const y = pos2.getY(i);
        const z = pos2.getZ(i);
        // displacement: sin(x*4) * cos(y*3) * 0.3
        const noise = Math.sin(x * 4.0) * Math.cos(y * 3.0) * 0.3;
        // scale outward slightly 
        const len = Math.sqrt(x*x + y*y + z*z);
        const scale = 1 + (noise / len);
        pos2.setXYZ(i, x * scale, y * scale, z * scale);
      }
      geo2.computeVertexNormals();
      const mat2 = new THREE.MeshBasicMaterial({ wireframe: true, color: 0x22d3ee, opacity: 0.06, transparent: true });
      const mesh2 = new THREE.Mesh(geo2, mat2);
      brainGroup.add(mesh2);

      // Layer 2: Neural Pathway Particles
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(TOTAL_PARTICLES * 3);
      const pCol = new Float32Array(TOTAL_PARTICLES * 3);
      const pSize = new Float32Array(TOTAL_PARTICLES);
      
      const violet = new THREE.Color(0x7c3aed);
      const cyan = new THREE.Color(0x22d3ee);
      const amber = new THREE.Color(0xf59e0b);

      const activeIndices = [];
      // Select random indices to be active
      while (activeIndices.length < ACTIVE_PARTICLES) {
        let r = Math.floor(Math.random() * TOTAL_PARTICLES);
        if(!activeIndices.includes(r)) activeIndices.push(r);
      }

      const pulseOffsets = new Float32Array(ACTIVE_PARTICLES);

      for (let i = 0; i < TOTAL_PARTICLES; i++) {
        const radius = 2.3 + Math.random() * 0.7;
        const theta = Math.random() * 2 * Math.PI; 
        const phi = Math.acos((Math.random() * 2) - 1);
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        pPos[i*3] = x;
        pPos[i*3+1] = y;
        pPos[i*3+2] = z;

        const isActive = activeIndices.includes(i);
        if (isActive) {
          pCol[i*3] = amber.r; pCol[i*3+1] = amber.g; pCol[i*3+2] = amber.b;
          pSize[i] = 0.04;
          pulseOffsets[activeIndices.indexOf(i)] = i; // random phase
        } else {
          const isLeft = x < 0;
          const c = isLeft ? violet : cyan;
          pCol[i*3] = c.r; pCol[i*3+1] = c.g; pCol[i*3+2] = c.b;
          pSize[i] = 0.018;
        }
      }

      pGeo.setAttribute('position', new THREE.Float32BufferAttribute(pPos, 3));
      pGeo.setAttribute('color', new THREE.Float32BufferAttribute(pCol, 3));
      pGeo.setAttribute('size', new THREE.Float32BufferAttribute(pSize, 1));

      const pMat = new THREE.ShaderMaterial({
        vertexShader: `
          attribute float size;
          attribute vec3 color;
          varying vec3 vColor;
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if(dist > 0.5) discard;
            float alpha = smoothstep(0.5, 0.1, dist);
            gl_FragColor = vec4(vColor, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexColors: true,
      });

      const neurons = new THREE.Points(pGeo, pMat);
      brainGroup.add(neurons);

      // Layer 3: Synaptic Connections
      // Find 3 nearest neighbors for each active node among OTHER active nodes
      const linesPos = [];
      const linesCol = [];
      for (let i = 0; i < ACTIVE_PARTICLES; i++) {
        const idxA = activeIndices[i];
        const ax = pPos[idxA*3], ay = pPos[idxA*3+1], az = pPos[idxA*3+2];
        
        let dists = [];
        for (let j = 0; j < ACTIVE_PARTICLES; j++) {
          if (i === j) continue;
          const idxB = activeIndices[j];
          const bx = pPos[idxB*3], by = pPos[idxB*3+1], bz = pPos[idxB*3+2];
          const d = (ax-bx)**2 + (ay-by)**2 + (az-bz)**2;
          dists.push({ j, d });
        }
        dists.sort((a,b) => a.d - b.d);
        const nearest = dists.slice(0, 3);
        
        nearest.forEach(n => {
          const idxB = activeIndices[n.j];
          linesPos.push(ax, ay, az);
          linesPos.push(pPos[idxB*3], pPos[idxB*3+1], pPos[idxB*3+2]);
          linesCol.push(cyan.r, cyan.g, cyan.b, cyan.r, cyan.g, cyan.b);
        });
      }
      
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linesPos, 3));
      lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(linesCol, 3));
      
      const lineMat = new THREE.LineBasicMaterial({ 
        vertexColors: true, 
        transparent: true, 
        opacity: 0.35, 
        blending: THREE.AdditiveBlending 
      });
      const synapses = new THREE.LineSegments(lineGeo, lineMat);
      brainGroup.add(synapses);

      // Layer 4: Depth Fog
      const fogGeo = new THREE.BufferGeometry();
      const fogPos = new Float32Array(2000 * 3);
      for (let i = 0; i < 2000; i++) {
        const radius = 4 + Math.random() * 3;
        const theta = Math.random() * 2 * Math.PI; 
        const phi = Math.acos((Math.random() * 2) - 1);
        fogPos[i*3] = radius * Math.sin(phi) * Math.cos(theta);
        fogPos[i*3+1] = radius * Math.cos(phi);
        fogPos[i*3+2] = radius * Math.sin(phi) * Math.sin(theta);
      }
      fogGeo.setAttribute('position', new THREE.Float32BufferAttribute(fogPos, 3));
      
      const dimWhite = new THREE.Color(0xaaaacc);
      const fogMat = new THREE.PointsMaterial({
        color: dimWhite,
        size: 0.008,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const fog = new THREE.Points(fogGeo, fogMat);
      scene.add(fog);

      // Animation Loop
      let paused = false;

      // Intersection Observer to pause when offscreen
      const obs = new IntersectionObserver(([e]) => { paused = !e.isIntersecting; });
      obs.observe(sectionRef.current);

      const animate = () => {
        if (disposed) return;
        animId = requestAnimationFrame(animate);
        if (paused) return;

        const time = Date.now();

        // Rotate brain
        mesh1.rotation.y += 0.0015;
        mesh2.rotation.y += 0.0015;
        neurons.rotation.y += 0.0015;
        synapses.rotation.y += 0.0015;
        
        // Breathing
        const breath = Math.sin(time * 0.0003) * 0.1;
        mesh1.rotation.x = breath;
        mesh2.rotation.x = breath;
        neurons.rotation.x = breath;
        synapses.rotation.x = breath;

        // Pulse active neurons
        const sizes = pGeo.attributes.size.array;
        for (let i = 0; i < ACTIVE_PARTICLES; i++) {
          const particleIndex = activeIndices[i];
          const offset = pulseOffsets[i];
          // 0.04 is base size for active, Math.sin yields -1 to 1 
          // user formula: Math.sin(time * 0.003 + index) * 0.5 + 0.5 mapped to size
          const pulse = (Math.sin(time * 0.003 + offset) * 0.5 + 0.5);
          sizes[particleIndex] = 0.02 + (pulse * 0.04);
        }
        pGeo.attributes.size.needsUpdate = true;

        // Pulse synapse opacity
        lineMat.opacity = 0.15 + (Math.sin(time * 0.004) * 0.5 + 0.5) * 0.2;

        // Slow fog drift
        fog.rotation.y -= 0.0005;
        fog.rotation.x -= 0.0002;

        renderer.render(scene, camera);
      };
      animate();

      // Mouse Parallax
      const onMouseMove = (e) => {
        const mx = (e.clientX / window.innerWidth - 0.5) * 0.4;
        const my = (e.clientY / window.innerHeight - 0.5) * 0.2;
        gsap.to(brainGroup.rotation, { y: mx, x: my, duration: 2, ease: "power2.out", overwrite: 'auto' });
      };
      window.addEventListener('mousemove', onMouseMove);

      // Scroll Fade/Scale out
      gsap.to(brainGroup.scale, {
        x: 0.3, y: 0.3, z: 0.3,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        }
      });
      gsap.to(canvas, {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'center top',
          end: 'bottom top',
          scrub: true,
        }
      });

      // Resize handler
      const onResize = () => {
        const W2 = window.innerWidth;
        const H2 = window.innerHeight;
        renderer.setSize(W2, H2);
        camera.aspect = W2 / H2;
        camera.updateProjectionMatrix();
      };
      window.addEventListener('resize', onResize);

      setIsReady(true);

      return () => {
        disposed = true;
        cancelAnimationFrame(animId);
        obs.disconnect();
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onResize);
        geo1.dispose(); geo2.dispose(); pGeo.dispose(); lineGeo.dispose(); fogGeo.dispose();
        mat1.dispose(); mat2.dispose(); pMat.dispose(); lineMat.dispose(); fogMat.dispose();
        renderer.dispose();
      };
    })();
  }, []);

  // ── Typing Animation & Intro Sequence ───────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });

      // Eyebrow fades in first
      tl.fromTo(eyebrowRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      );

      // Headline fade in
      tl.fromTo(headlineRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' },
        '-=0.4'
      );

      // Subheadline
      tl.to(subRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.6');

      // Typing simulation
      if (typingRef.current) {
        const text = "> Scanning cortex... 8,000 nodes mapped... initialising...";
        typingRef.current.textContent = '';
        tl.to(typingRef.current, { opacity: 1, duration: 0.1 }, '-=0.2');
        
        let typingTl = gsap.timeline();
        [...text].forEach((char, i) => {
          typingTl.add(() => {
            if(typingRef.current) typingRef.current.textContent += char;
          }, i * 0.04);
        });
        tl.add(typingTl, '-=0.2');
      }

      // Scroll hint
      tl.to(hintRef.current, { opacity: 1, duration: 0.6 }, '+=0.5');
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="hero-section" ref={sectionRef} id="hero">
      <canvas ref={canvasRef} className="hero-canvas" />

      {/* Floating labels (Delay ~2s after JS loads) */}
      {isReady && (
        <>
          <AnatomyLabel top="25%" left="8%" title="Prefrontal Cortex" sub="Planning & Reasoning" lineAngle={30} delay={2} />
          <AnatomyLabel top="20%" right="8%" title="Neural Pathways" sub="87 billion connections" lineAngle={-30} isRight delay={2.3} />
          <AnatomyLabel top="65%" left="6%" title="Left Hemisphere" sub="Language & Logic" lineAngle={-45} delay={2.6} />
          <AnatomyLabel top="68%" right="6%" title="Right Hemisphere" sub="Pattern Recognition" lineAngle={45} isRight delay={2.9} />
          <BrainActivityHUD activeCount={sceneParams.current.active} totalCount={sceneParams.current.total} />
        </>
      )}

      <div className="hero-content content-above">
        <p className="eyebrow" ref={eyebrowRef} style={{ opacity: 0 }}>
          NEURAL INTERFACE ACTIVE
        </p>

        <h1 className="hero-headline headline-xl glitch" data-text="The Anatomy of a Digital Mind" ref={headlineRef} style={{ opacity: 0 }}>
          The Anatomy of a Digital Mind
        </h1>

        <p
          className="hero-subheadline body-text"
          ref={subRef}
          style={{ opacity: 0, transform: 'translateY(10px)', marginBottom: '1rem' }}
        >
          86 billion neurons. 1.76 trillion parameters. Two minds — one question.
        </p>

        <div className="mono" ref={typingRef} style={{ 
          color: 'var(--cyan)', 
          fontSize: '0.8rem', 
          opacity: 0, 
          height: '1.2rem',
          marginBottom: '3rem'
        }}>
          {/* Typwriter injected here */}
        </div>

        <div className="hero-scroll-hint" ref={hintRef} style={{ opacity: 0 }}>
          <span className="scroll-chevron">∧</span>
          <span className="scroll-label">scroll to begin</span>
        </div>
      </div>
    </section>
  );
}
