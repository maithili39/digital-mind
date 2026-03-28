import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ATTENTION_HEADS, PRESET_SENTENCES, MOBILE_BREAKPOINT } from '../constants';

// ── Seed-based pseudo-random for consistent patterns ─────────
function seededRand(seed) {
  const s = Math.sin(seed) * 43758.5453123;
  return s - Math.floor(s);
}

function getAttentionWeights(wordIdx, headIdx, wordCount) {
  return Array.from({ length: wordCount }, (_, j) => {
    const seed = wordIdx * 100 + headIdx * 10 + j;
    return seededRand(seed);
  });
}

function normalise(arr) {
  const sum = arr.reduce((a, b) => a + b, 0);
  return sum === 0 ? arr : arr.map((v) => v / sum);
}

// ── Ambient particle background (Three.js) ───────────────────
function AmbientCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let animId;
    (async () => {
      const THREE = await import('three');
      if (disposed) return;
      const W = canvas.offsetWidth, H = canvas.offsetHeight;
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
      renderer.setSize(W, H);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, W / H, 1, 2000);
      camera.position.z = 600;
      const count = window.innerWidth < MOBILE_BREAKPOINT ? 400 : 800;
      const pos = new Float32Array(count * 3);
      const vel = [];
      for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 1200;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 700;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 200;
        vel.push({ y: 0.3 + Math.random() * 0.5 });
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({
        color: 0x22d3ee,
        size: 1.5,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      scene.add(new THREE.Points(geo, mat));
      const animate = () => {
        if (disposed) return;
        animId = requestAnimationFrame(animate);
        const p = geo.attributes.position.array;
        for (let i = 0; i < count; i++) {
          p[i * 3 + 1] += vel[i].y;
          if (p[i * 3 + 1] > 360) p[i * 3 + 1] = -360;
        }
        geo.attributes.position.needsUpdate = true;
        renderer.render(scene, camera);
      };
      animate();
    })();
    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0,
      }}
    />
  );
}

// ── Transformer Block SVG Anatomy ────────────────────────────
function TransformerAnatomy() {
  return (
    <div className="transformer-anatomy" style={{ margin: '3rem auto', maxWidth: '400px', textAlign: 'center' }}>
      <p className="mono" style={{ fontSize: '0.8rem', color: 'var(--ghost)', letterSpacing: '0.1em', marginBottom: '2rem' }}>
        TRANSFORMER BLOCK ANATOMY
      </p>
      
      <svg width="400" height="480" viewBox="0 0 400 480" style={{ overflow: 'visible' }}>
        {/* Bypass arrow (Residual connection) right side */}
        <path d="M 280 80 L 360 80 L 360 250 L 280 250" fill="none" stroke="var(--ghost)" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
        <path d="M 280 300 L 360 300 L 360 410 L 280 410" fill="none" stroke="var(--ghost)" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
        <polyline points="275,245 280,250 275,255" fill="none" stroke="var(--ghost)" strokeWidth="1" opacity="0.5" />
        <polyline points="275,405 280,410 275,415" fill="none" stroke="var(--ghost)" strokeWidth="1" opacity="0.5" />
        
        {/* Flow arrows down */}
        <path d="M 200 40 L 200 60" stroke="var(--dim)" strokeWidth="1" markerEnd="url(#arrow)" />
        <path d="M 200 100 L 200 120" stroke="var(--dim)" strokeWidth="1" markerEnd="url(#arrow)" />
        <path d="M 200 210 L 200 230" stroke="var(--dim)" strokeWidth="1" markerEnd="url(#arrow)" />
        <path d="M 200 270 L 200 280" stroke="var(--dim)" strokeWidth="1" markerEnd="url(#arrow)" />
        <path d="M 200 320 L 200 340" stroke="var(--dim)" strokeWidth="1" markerEnd="url(#arrow)" />
        <path d="M 200 380 L 200 390" stroke="var(--dim)" strokeWidth="1" markerEnd="url(#arrow)" />
        <path d="M 200 430 L 200 450" stroke="var(--dim)" strokeWidth="1" markerEnd="url(#arrow)" />
        
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <polyline points="1,1 5,3 1,5" fill="none" stroke="var(--dim)" strokeWidth="1" />
          </marker>
        </defs>

        {/* INPUT EMBEDDINGS */}
        <g transform="translate(100, 0)" className="anatomy-box" data-fact="Converts discrete words into dense continuous vectors.">
          <rect width="200" height="40" rx="4" fill="var(--deep-navy)" stroke="var(--cyan)" strokeWidth="1" />
          <text x="100" y="24" fill="var(--cyan)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">INPUT EMBEDDINGS</text>
        </g>
        
        {/* POSITIONAL ENCODING */}
        <g transform="translate(100, 60)" className="anatomy-box" data-fact="Injects order into the sequence since Attention has no absolute sense of time.">
          <rect width="200" height="40" rx="4" fill="var(--deep-navy)" stroke="var(--violet)" strokeWidth="1" />
          <text x="100" y="18" fill="var(--violet)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">POSITIONAL ENCODING</text>
          <text x="100" y="32" fill="var(--dim)" fontSize="8" fontFamily="var(--font-mono)" textAnchor="middle">sin/cos wave pattern</text>
        </g>

        {/* MULTI-HEAD ATTENTION */}
        <g transform="translate(100, 120)" className="anatomy-box" data-fact="Computes relationship scores between every word and every other word.">
          <rect width="200" height="90" rx="4" fill="var(--void-black)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <text x="100" y="20" fill="var(--ghost)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">MULTI-HEAD ATTENTION</text>
          <rect x="20" y="35" width="40" height="25" rx="2" fill="none" stroke="var(--violet)" />
          <text x="40" y="52" fill="var(--violet)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">Q</text>
          <rect x="80" y="35" width="40" height="25" rx="2" fill="none" stroke="var(--cyan)" />
          <text x="100" y="52" fill="var(--cyan)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">K</text>
          <rect x="140" y="35" width="40" height="25" rx="2" fill="none" stroke="var(--amber)" />
          <text x="160" y="52" fill="var(--amber)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">V</text>
          <text x="100" y="80" fill="var(--dim)" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">softmax(QKᵀ/√dk)</text>
        </g>

        {/* ADD & LAYER NORM 1 */}
        <g transform="translate(100, 230)" className="anatomy-box" data-fact="Residual connection stabilizes gradients; Layer Norm normalizes activations.">
          <rect width="200" height="40" rx="4" fill="var(--void-black)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <text x="100" y="24" fill="var(--ghost)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">ADD & LAYER NORM</text>
        </g>

        {/* FEED-FORWARD */}
        <g transform="translate(100, 280)" className="anatomy-box" data-fact="Applies non-linear transformations to each position independently.">
          <rect width="200" height="40" rx="4" fill="var(--void-black)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <text x="100" y="18" fill="var(--ghost)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">FEED-FORWARD NETWORK</text>
          <text x="100" y="32" fill="var(--dim)" fontSize="8" fontFamily="var(--font-mono)" textAnchor="middle">Linear → ReLU → Linear</text>
        </g>

        {/* ADD & LAYER NORM 2 */}
        <g transform="translate(100, 340)" className="anatomy-box">
          <rect width="200" height="40" rx="4" fill="var(--void-black)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <text x="100" y="24" fill="var(--ghost)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">ADD & LAYER NORM</text>
        </g>

        {/* OUTPUT */}
        <g transform="translate(100, 390)" className="anatomy-box">
          <rect width="200" height="40" rx="4" fill="var(--deep-navy)" stroke="var(--amber)" strokeWidth="1" />
          <text x="100" y="24" fill="var(--amber)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">OUTPUT</text>
        </g>
      </svg>
    </div>
  );
}

// ── Stat Cards ───────────────────────────────────────────────
function StatCards() {
  const stats = [
    { num: '96 layers', label: 'Transformer blocks' },
    { num: '96 heads', label: 'per layer' },
    { num: '12,288 dim', label: 'embedding size' },
    { num: '1.76T params*', label: '*estimated' },
  ];
  return (
    <div className="stat-cards-row">
      {stats.map((s, i) => (
        <div key={i} className="stat-card">
          <div className="pulse-text" style={{ fontSize: '1.4rem', color: 'var(--ghost)', fontWeight: 300, fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>{s.num}</div>
          <div className="mono" style={{ fontSize: '11px', color: 'var(--dim)', marginTop: '0.5rem' }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────
export default function AttentionSection() {
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [activeHead, setActiveHead] = useState(0);
  const [selectedWord, setSelectedWord] = useState(null);
  const [lines, setLines] = useState([]);
  const containerRef = useRef(null);
  const wordRefs = useRef([]);
  const svgRef = useRef(null);

  const sentence = PRESET_SENTENCES[sentenceIdx];
  const words = sentence.words;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;

  // Compute lines when word or head changes
  const computeLines = useCallback(() => {
    if (selectedWord === null || !svgRef.current) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const rawWeights = getAttentionWeights(selectedWord, activeHead, words.length);
    const weights = normalise(rawWeights);

    const newLines = words.map((_, j) => {
      const fromEl = wordRefs.current[selectedWord];
      const toEl = wordRefs.current[j];
      if (!fromEl || !toEl) return null;
      const fr = fromEl.getBoundingClientRect();
      const tr = toEl.getBoundingClientRect();
      return {
        x1: fr.left + fr.width / 2 - svgRect.left,
        y1: fr.top + fr.height / 2 - svgRect.top,
        x2: tr.left + tr.width / 2 - svgRect.left,
        y2: tr.top + tr.height / 2 - svgRect.top,
        weight: weights[j],
        key: `${selectedWord}-${j}-${activeHead}`,
      };
    }).filter(Boolean);

    setLines(newLines);
  }, [selectedWord, activeHead, words]);

  useEffect(() => {
    // Small delay so DOM settles after sentence change
    const t = setTimeout(computeLines, 80);
    return () => clearTimeout(t);
  }, [computeLines]);

  // Animate lines with GSAP when they change
  useEffect(() => {
    if (!svgRef.current) return;
    const lineEls = svgRef.current.querySelectorAll('.attn-line');
    lineEls.forEach((el) => {
      gsap.fromTo(el,
        { strokeOpacity: 0, strokeWidth: 0 },
        {
          strokeOpacity: parseFloat(el.dataset.weight) * 0.85,
          strokeWidth: parseFloat(el.dataset.weight) * 6 + 0.5,
          duration: 0.4,
          ease: 'power2.out',
        }
      );
    });
  }, [lines]);

  const handleWordClick = (idx) => {
    setSelectedWord(idx === selectedWord ? null : idx);
    if (idx === selectedWord) setLines([]);
  };

  const handleSentenceChange = (idx) => {
    setSentenceIdx(idx);
    setSelectedWord(null);
    setLines([]);
  };

  // Heatmap for all heads × words
  const heatmapData = Array.from({ length: ATTENTION_HEADS }, (_, h) =>
    Array.from({ length: words.length }, (_, w) => {
      const raw = getAttentionWeights(selectedWord ?? 0, h, words.length);
      const norm = normalise(raw);
      return norm[w];
    })
  );

  return (
    <section className="attention-section" id="attention" ref={containerRef}>
      <AmbientCanvas />

      <div className="content-above" style={{ width: '100%', maxWidth: '1100px' }}>
        {/* Label */}
        <div className="attention-label">
          <TransformerAnatomy />
          <StatCards />
          
          <h2 className="headline-lg" style={{ marginTop: '2rem' }}>
            Inside the Mechanism
          </h2>
          <p className="body-text" style={{ margin: '0.5rem auto 1.5rem' }}>
            Click a word to visualise attention
          </p>
        </div>

        {/* Head toggles */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div className="head-toggles" style={{ justifyContent: 'center' }}>
            {Array.from({ length: ATTENTION_HEADS }, (_, h) => (
              <button
                key={h}
                className={`head-btn ${activeHead === h ? 'active' : ''}`}
                onClick={() => setActiveHead(h)}
                aria-pressed={activeHead === h}
                aria-label={`Attention head ${h + 1}`}
              >
                H{h + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Layout */}
        <div className="attention-layout" style={{ position: 'relative' }}>
          {/* SVG overlay for lines */}
          <svg
            ref={svgRef}
            className="attention-svg"
            style={{ position: 'absolute', inset: 0, overflow: 'visible', zIndex: 1, pointerEvents: 'none' }}
          >
            <defs>
              <filter id="glow-filter">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {lines.map((l) => {
              const mx = (l.x1 + l.x2) / 2;
              const my = (l.y1 + l.y2) / 2;
              const pct = Math.round(l.weight * 100);
              return (
                <g key={l.key}>
                  <line
                    className="attn-line"
                    x1={l.x1} y1={l.y1}
                    x2={l.x2} y2={l.y2}
                    stroke="var(--cyan)"
                    strokeOpacity={l.weight * 0.85}
                    strokeWidth={l.weight * 6 + 0.5}
                    filter="url(#glow-filter)"
                    data-weight={l.weight}
                  />
                  {pct > 5 && (
                    <text x={mx} y={my - 6} className="attn-percent">
                      {pct}%
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Left: Word pills + controls */}
          <div className="attention-left" style={{ position: 'relative', zIndex: 2 }}>
            <div className="word-pills">
              {words.map((word, i) => (
                <button
                  key={`${sentenceIdx}-${i}`}
                  className={`word-pill ${selectedWord === i ? 'selected' : ''}`}
                  role="button"
                  aria-label={`Query attention for: ${word}`}
                  onClick={() => handleWordClick(i)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleWordClick(i)}
                  ref={(el) => (wordRefs.current[i] = el)}
                  data-fact={`Token representation of "${word}" acts as Query, Key, and Value vectors.`}
                >
                  {word}
                </button>
              ))}
            </div>

            {/* Sentence chips */}
            <div>
              <p className="eyebrow" style={{ marginBottom: '0.75rem' }}>Preset sentences</p>
              <div className="sentence-chips">
                {PRESET_SENTENCES.map((s, i) => (
                  <button
                    key={s.id}
                    className={`sentence-chip ${sentenceIdx === i ? 'active' : ''}`}
                    onClick={() => handleSentenceChange(i)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {selectedWord === null && (
              <p style={{ color: 'var(--dim)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                ↑ Click any word to reveal attention patterns
              </p>
            )}
          </div>

          {/* Right: Heatmap */}
          {!isMobile && (
            <div className="attention-right" style={{ position: 'relative', zIndex: 2 }}>
              <p className="eyebrow" style={{ marginBottom: '1rem' }}>Attention Heatmap</p>
              <div className="heatmap">
                {/* Col headers */}
                <div className="heatmap-row">
                  <span style={{ width: 24 }} />
                  {words.map((w, i) => (
                    <span
                      key={i}
                      style={{
                        width: 28,
                        fontSize: '0.55rem',
                        fontFamily: 'var(--font-mono)',
                        color: selectedWord === i ? 'var(--cyan)' : 'var(--dim)',
                        textAlign: 'center',
                        transition: 'color 0.3s',
                      }}
                    >
                      {w.slice(0, 4)}
                    </span>
                  ))}
                </div>

                {heatmapData.map((row, h) => (
                  <div key={h} className="heatmap-row">
                    <span className="heatmap-head-label mono">H{h + 1}</span>
                    {row.map((val, w) => {
                      const intensity = Math.round(val * 255);
                      const isSelected = h === activeHead;
                      const bg = isSelected
                        ? `rgba(34, 211, 238, ${val * 0.85})`
                        : `rgba(124, 58, 237, ${val * 0.6})`;
                      return (
                        <div
                          key={w}
                          className="heatmap-cell"
                          style={{ background: bg }}
                          title={`H${h + 1}, ${words[w]}: ${val.toFixed(2)}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
              <p style={{ color: 'var(--dim)', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', marginTop: '0.75rem' }}>
                Active head: H{activeHead + 1} (highlighted)
              </p>
            </div>
          )}
        </div>

        {/* Live Formula & Why it matters callout */}
        <div style={{ marginTop: '3rem' }}>
          <div className="formula-box" data-fact="The mathematical core of Transformer models.">
            Attention(<span className={selectedWord !== null ? 'formula-hl-q' : ''}>Q</span>,{' '}
            <span className={selectedWord !== null ? 'formula-hl-k' : ''}>K</span>,{' '}
            <span className={selectedWord !== null ? 'formula-hl-v' : ''}>V</span>) ={' '}
            softmax(<span className={selectedWord !== null ? 'formula-hl-q' : ''}>Q</span>
            <span className={selectedWord !== null ? 'formula-hl-k' : ''}>K</span><span style={{color: 'var(--dim)'}}>ᵀ / √dk</span>) ·{' '}
            <span className={selectedWord !== null ? 'formula-hl-v' : ''}>V</span>
          </div>

          <div className="stat-callout" style={{ maxWidth: '800px', margin: '1.5rem auto' }}>
            <p className="mono" style={{ fontSize: '0.8rem', color: 'var(--dim)', margin: 0, lineHeight: 1.6 }}>
              <span style={{color: 'var(--cyan)'}}>GPT-4 runs 96 × 96 = 9,216 attention heads simultaneously.</span><br/>
              Each head learns to focus on different linguistic relationships — grammar, coreference, syntax, semantics.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
