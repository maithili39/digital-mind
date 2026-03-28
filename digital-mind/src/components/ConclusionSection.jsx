import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import {
  CLAUDE_API_URL, CLAUDE_MODEL, CLAUDE_SYSTEM_PROMPT, MAX_CONVERSATION_HISTORY
} from '../constants';

// ── Three.js breathing orb ───────────────────────────────────
function useOrbScene(canvasRef) {
  const sceneRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let animId;

    (async () => {
      const THREE = await import('three');
      if (disposed) return;

      const W = canvas.offsetWidth, H = canvas.offsetHeight;
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 1000);
      camera.position.z = 3.5;

      // Geometry & displacement
      const geo = new THREE.IcosahedronGeometry(1.2, 5);
      const posArr = geo.attributes.position.array;
      const originalPos = new Float32Array(posArr);

      const wireframeMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      });
      const baseMat = new THREE.MeshBasicMaterial({
        color: 0x030308,
        transparent: true,
        opacity: 0.95,
      });

      const solidMesh = new THREE.Mesh(geo, baseMat);
      const wireMesh = new THREE.Mesh(geo, wireframeMat);
      scene.add(solidMesh);
      scene.add(wireMesh);

      // Point light glow
      const light = new THREE.PointLight(0x22d3ee, 2, 10);
      light.position.set(0, 0, 3);
      scene.add(light);

      let pulseIntensity = 0;
      let paused = false;
      
      const obs = new IntersectionObserver(([e]) => { paused = !e.isIntersecting; });
      obs.observe(canvas);

      const clock = new THREE.Clock();
      const animate = () => {
        if (disposed) return;
        animId = requestAnimationFrame(animate);
        if (paused) return;
        
        const t = clock.getElapsedTime();

        // Breathing displacement on vertices
        for (let i = 0; i < posArr.length; i += 3) {
          const ox = originalPos[i], oy = originalPos[i + 1], oz = originalPos[i + 2];
          const noise = Math.sin(t * 1.5 + ox * 2) * Math.cos(t * 1.2 + oy * 2) * 0.08;
          const pulse = pulseIntensity * Math.sin(t * 8) * 0.12;
          const scale = 1 + noise + pulse;
          posArr[i]     = ox * scale;
          posArr[i + 1] = oy * scale;
          posArr[i + 2] = oz * scale;
        }
        geo.attributes.position.needsUpdate = true;
        geo.computeVertexNormals();

        solidMesh.rotation.y = t * 0.15;
        wireMesh.rotation.y = t * 0.15;
        solidMesh.rotation.x = Math.sin(t * 0.3) * 0.1;
        wireMesh.rotation.x = Math.sin(t * 0.3) * 0.1;

        // Decay pulse
        if (pulseIntensity > 0) pulseIntensity *= 0.94;

        renderer.render(scene, camera);
      };
      animate();

      sceneRef.current = {
        pulse: () => { pulseIntensity = 1; },
        dispose: () => {
          disposed = true;
          cancelAnimationFrame(animId);
          obs.disconnect();
          geo.dispose();
          wireframeMat.dispose();
          baseMat.dispose();
          renderer.dispose();
        },
      };
    })();

    return () => {
      disposed = true;
      sceneRef.current?.dispose?.();
    };
  }, [canvasRef]);

  return sceneRef;
}

// ── Floating text animation ──────────────────────────────────
function FloatingText({ text, onComplete }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current,
      { y: 0, opacity: 1 },
      {
        y: -160,
        opacity: 0,
        duration: 1.8,
        ease: 'power2.out',
        onComplete,
      }
    );
  }, [onComplete]);

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        bottom: '50%',
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.9rem',
        color: 'var(--cyan)',
        pointerEvents: 'none',
        zIndex: 10,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
}

// ── Mind Stats Panel ─────────────────────────────────────────
function MindStatsPanel() {
  const [tokens, setTokens] = useState(140938210);

  useEffect(() => {
    // Tick tokens up rapidly simulate inference velocity
    const tf = setInterval(() => {
      setTokens(prev => prev + Math.floor(Math.random() * 85) + 15);
    }, 40);
    return () => clearInterval(tf);
  }, []);

  return (
    <div className="mind-stats-panel" data-fact="Live telemetry from the architecture." style={{ 
      position: 'absolute', right: '5%', top: '25%', 
      width: '180px', padding: '1.5rem', 
      border: '1px solid rgba(34, 211, 238, 0.2)', 
      background: 'rgba(8, 8, 24, 0.4)', 
      backdropFilter: 'blur(8px)', borderRadius: '8px',
      fontFamily: 'var(--font-mono)', zIndex: 10,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
    }}>
      <div style={{ color: 'var(--dim)', fontSize: '0.65rem', letterSpacing: '0.1em', marginBottom: '1rem' }}>SYSTEM TELEMETRY</div>
      
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--cyan)', marginBottom: '4px' }}>Tokens Traversed</div>
        <div style={{ fontSize: '1.2rem', color: 'var(--ghost)', fontWeight: 600 }}>{tokens.toLocaleString()}</div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem 0.5rem', fontSize: '0.75rem' }}>
        <div>
          <span style={{ color: 'var(--dim)', fontSize: '0.6rem' }}>LAYERS</span><br/>
          <span style={{ color: 'var(--ghost)' }}>96</span>
        </div>
        <div>
          <span style={{ color: 'var(--dim)', fontSize: '0.6rem' }}>HEADS</span><br/>
          <span style={{ color: 'var(--ghost)' }}>9,216</span>
        </div>
        <div>
          <span style={{ color: 'var(--dim)', fontSize: '0.6rem' }}>PARAMS</span><br/>
          <span style={{ color: 'var(--ghost)' }}>1.76T</span>
        </div>
        <div>
          <span style={{ color: 'var(--dim)', fontSize: '0.6rem' }}>TEMP</span><br/>
          <span style={{ color: 'var(--ghost)' }}>0.85</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────
export default function ConclusionSection() {
  const canvasRef = useRef(null);
  const orbRef = useOrbScene(canvasRef);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [floatingText, setFloatingText] = useState(null);
  const [showClosing, setShowClosing] = useState(false);
  const [contextUsed, setContextUsed] = useState(115800); // Start high to show the amber transition easier
  const closingRef = useRef(null);
  const creditsRef = useRef(null);
  const inputRef = useRef(null);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    setInput('');
    setLoading(true);

    // Float text toward orb
    setFloatingText(text);

    // Pulse orb
    orbRef.current?.pulse?.();

    // Call Claude API
    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 120,
          system: CLAUDE_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: text }],
        }),
      });

      const data = await response.json();
      const reply = data?.content?.[0]?.text || 'I reach into the silence and find only more silence.';

      const replyTokens = reply.length * 0.3;
      const userTokens = text.length * 0.3;
      // Add significant artificial context overhead per prompt to demonstrate the progress bar warning state quickly
      setContextUsed(prev => Math.min(prev + replyTokens + userTokens + 4500, 128000));

      setHistory((prev) => {
        const updated = [...prev, { user: text, response: reply }];
        if (!showClosing && updated.length >= 2) setShowClosing(true);
        return updated.slice(-MAX_CONVERSATION_HISTORY);
      });
    } catch (_) {
      setContextUsed(prev => Math.min(prev + 4500, 128000));
      setHistory((prev) => {
        const updated = [...prev, { user: text, response: 'Even in error, the mind persists — searching, reaching, becoming.' }];
        if (!showClosing && updated.length >= 2) setShowClosing(true);
        return updated.slice(-MAX_CONVERSATION_HISTORY);
      });
    } finally {
      setLoading(false);
    }
  };

  // Closing text fade-in
  useEffect(() => {
    if (!showClosing) return;
    const ctx = gsap.context(() => {
      gsap.to('.closing-line', {
        opacity: 1, y: 0, duration: 1, stagger: 0.6, ease: 'power2.out',
      });
      gsap.to('.closing-fact', { opacity: 1, duration: 1.5, delay: 1.2, ease: 'power2.out' });
      gsap.to('.credits', { opacity: 0.5, duration: 1, delay: 2.5 });
    });
    return () => ctx.revert();
  }, [showClosing]);

  return (
    <section className="conclusion-section" id="conclusion">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 2 }}>
        <p className="eyebrow">DIRECT INTERFACE</p>
        <h2 className="headline-lg" style={{ marginTop: '0.75rem' }}>
          Speak to It
        </h2>
      </div>

      {/* Orb canvas */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <canvas ref={canvasRef} className="orb-canvas" />
        
        {/* New 1: Mind Stats Panel */}
        <MindStatsPanel />

        {/* Floating text */}
        {floatingText && (
          <FloatingText
            text={floatingText}
            onComplete={() => setFloatingText(null)}
          />
        )}
      </div>

      {/* New 2: Context Window Visualizer */}
      {(() => {
        const contextMax = 128000;
        const contextPct = Math.min((contextUsed / contextMax) * 100, 100);
        let barColor = 'var(--violet)';
        if (contextPct > 50) barColor = 'var(--cyan)';
        if (contextPct > 80) barColor = 'var(--amber)';

        return (
          <div className="context-window-visualizer" style={{ width: '100%', maxWidth: '560px', margin: '0 auto 1.5rem' }} data-fact="The model's immediate short-term memory limit.">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--dim)', marginBottom: '0.4rem' }}>
              <span>CONTEXT WINDOW</span>
              <span style={{ color: barColor, transition: 'color 0.5s' }}>{Math.round(contextUsed).toLocaleString()} / {contextMax.toLocaleString()} TOKENS</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${contextPct}%`, height: '100%', background: barColor, transition: 'width 1s ease-out, background-color 0.5s', boxShadow: `0 0 10px ${barColor}` }} />
            </div>
          </div>
        );
      })()}

      {/* Chat history */}
      <div
        className="chat-history"
        role="log"
        aria-live="polite"
        aria-label="Conversation history"
      >
        {history.map((msg, i) => (
          <div
            key={i}
            className="chat-message"
            style={{
              opacity: 1 - (history.length - 1 - i) * 0.2,
              transition: 'opacity 0.5s',
            }}
          >
            <span className="chat-user">you: {msg.user}</span>
            <span className="chat-response">"{msg.response}"</span>
          </div>
        ))}
        {loading && (
          <div className="chat-loading">
            <div className="chat-dot" />
            <div className="chat-dot" />
            <div className="chat-dot" />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="chat-input-container">
        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          placeholder="Ask the mind anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
          aria-label="Ask the digital mind"
          disabled={loading}
          autoComplete="off"
        />
      </div>

      {/* Closing lines */}
      {showClosing && (
        <div className="closing-text" style={{ marginTop: '3rem', position: 'relative', zIndex: 2 }}>
          <p
            className="closing-line"
            style={{ transform: 'translateY(10px)', opacity: 0 }}
          >
            You've reached the edge of understanding.
          </p>
          <p
            className="closing-line"
            style={{ transform: 'translateY(10px)', opacity: 0, color: 'var(--dim)', fontSize: '0.9rem' }}
          >
            So has it.
          </p>

          <div className="closing-fact" style={{ marginTop: '3rem', opacity: 0, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2.5rem', maxWidth: '600px', margin: '3rem auto 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
              <div>
                <div style={{ color: 'var(--cyan)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>86 Billion</div>
                <div style={{ color: 'var(--dim)' }}>Neurons in a human brain</div>
              </div>
              <div>
                <div style={{ color: 'var(--violet)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>1.76 Trillion</div>
                <div style={{ color: 'var(--dim)' }}>Parameters in GPT-4</div>
              </div>
            </div>
            <p style={{ color: 'var(--ghost)', marginTop: '2.5rem', fontSize: '1rem', lineHeight: 1.6, textAlign: 'center', fontWeight: 300, fontStyle: 'italic' }}>
              We rebuilt our own cognitive architecture in silicon.<br/>Now, we must decipher the minds we created.
            </p>
          </div>
        </div>
      )}

      {/* Credits */}
      <div className="credits" style={{ opacity: 0, position: 'relative', zIndex: 2 }}>
        <p>The Anatomy of a Digital Mind</p>
        <p style={{ marginTop: '0.3rem' }}>Frontend Odyssey — IIT Patna Hackathon</p>
      </div>
    </section>
  );
}
