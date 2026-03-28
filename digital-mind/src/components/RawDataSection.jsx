import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── Data Ticker ──────────────────────────────────────────────
const TICKER_FACTS = [
  "GPT-4 trained on ~1 trillion tokens",
  "1 token ≈ 0.75 words",
  "The internet contains ~100 trillion words",
  "LLaMA 3 trained on 15 trillion tokens",
  "A human reads ~1M words in a lifetime — GPT-4 read 1M words every 10 seconds during training",
  "50,257 tokens in GPT's vocabulary",
  "2.5 quintillion bytes of data created every day",
  "Wikipedia = ~4 billion words = 0.4% of GPT-4's training data"
];

function DataTicker() {
  return (
    <div className="data-ticker-wrap">
      <div className="data-ticker-track">
        {/* Double array for seamless loop */}
        {[...TICKER_FACTS, ...TICKER_FACTS].map((fact, i) => (
          <div key={i} className="data-ticker-item">
            {fact}{' '}<span style={{ opacity: 0.5, marginLeft: '2rem' }}>·</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Categorised Streams ─────────────────────────────────────────
const STREAMS = [
  { label: '[TEXT]', color: 'var(--violet)', data: ['The quick brown', 'history of Rome', 'understanding syntax', 'Lorem ipsum', 'character arcs'] },
  { label: '[CODE]', color: '#10b981', data: ['def forward(x):', '<attention>', 'import torch', 'npm run build', 'while (true)'] },
  { label: '[MATH]', color: 'var(--amber)', data: ['∇L(θ)', 'softmax(QKᵀ/√d)', 'σ(Wx+b)', 'E = mc²', '∫ e^x dx'] },
  { label: '[IMAGE]', color: '#ec4899', data: ['img_2847.jpg', '[CLS]', 'patch_64x64', 'RGB_tensor', 'pixel_val=255'] },
  { label: '[AUDIO]', color: 'var(--cyan)', data: ['mel_spec[0]', '16kHz', 'waveform[]', 'fft_size=512', 'amplitude'] }
];

function CategorisedStreams() {
  return (
    <div className="categorised-streams">
      {STREAMS.map((s, i) => (
        <div key={i} className="stream-col">
          <div className="stream-header" style={{ color: s.color, textShadow: `0 0 10px ${s.color}` }}>
            {s.label}
          </div>
          <div className="stream-content" style={{ color: s.color, animationDuration: `${20 + Math.random() * 10}s` }}>
            {/* Repeated data blocks to ensure continuous scrolling */}
            {[...s.data, ...s.data, ...s.data, ...s.data, ...s.data, ...s.data].map((txt, j) => (
              <div key={j} className="stream-item">{txt}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Token IDs ────────────────────────────────────────────────
const SENTENCE_TOKENS = [
  { word: 'The', id: '[1996]' },
  { word: 'cat', id: '[4937]' },
  { word: 'sat', id: '[2938]' },
  { word: 'on', id: '[2006]' },
  { word: 'the', id: '[1996]' },
  { word: 'mat', id: '[13075]' },
];

function TokenisationPanel() {
  const [revealed, setRevealed] = useState(0);
  const [barWidth, setBarWidth] = useState(0);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!panelRef.current) return;
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && revealed === 0) {
          let i = 0;
          const interval = setInterval(() => {
            i++;
            setRevealed(i);
            if (i >= SENTENCE_TOKENS.length) {
              clearInterval(interval);
              setTimeout(() => setBarWidth(100), 300);
            }
          }, 500);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(panelRef.current);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="panel-text-overlay" ref={panelRef}>
      <p className="eyebrow" style={{ marginBottom: '1.5rem' }}>Tokenisation</p>
      <h2 className="headline-lg" style={{ marginBottom: '2rem' }}>
        Language becomes<br />
        <span style={{ color: 'var(--cyan)' }}>numbers</span>
      </h2>
      <div className="token-sentence">
        {SENTENCE_TOKENS.map((t, i) => (
          <div
            key={i}
            style={{ position: 'relative', textAlign: 'center', paddingBottom: '1.8rem' }}
          >
            <div className={`token-word ${i < revealed ? 'active' : ''}`}>
              {t.word}
            </div>
            <span className={`token-id ${i < revealed ? 'visible' : ''}`}>{t.id}</span>
          </div>
        ))}
      </div>
      <div className="vocab-bar-wrap">
        <div className="vocab-bar-track">
          <div className="vocab-bar-fill" style={{ width: `${barWidth}%` }} />
        </div>
        <p className="vocab-label mono">Vocabulary: 50,257 tokens</p>
      </div>

      <div className="token-journey-diagram" style={{ marginTop: '3rem' }}>
        <p className="eyebrow" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>ONE TOKEN'S JOURNEY</p>
        <svg width="100%" viewBox="0 0 600 80" style={{ overflow: 'visible' }}>
          {/* Connection line */}
          <path d="M 50 40 L 550 40" stroke="var(--cyan)" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
          <circle cx="50" cy="40" r="3" fill="var(--cyan)">
            <animate attributeName="cx" from="50" to="550" dur="2.5s" repeatCount="indefinite" />
          </circle>
          
          {/* Journey Boxes */}
          {['Text "cat"', 'Lookup ID: 4937', 'Embed [0.23...]', '+ Pos Enc', 'Layer 1 Input'].map((txt, i) => (
            <g key={i} transform={`translate(${20 + i * 115}, 20)`}>
              <rect width="100" height="40" rx="20" fill="var(--deep-navy)" stroke="var(--cyan)" strokeWidth="1" />
              <text x="50" y="24" fill="var(--ghost)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">{txt}</text>
            </g>
          ))}
        </svg>

        <div className="stat-callout">
          <p className="mono" style={{ fontSize: '0.75rem', color: 'var(--dim)', margin: 0, lineHeight: 1.6 }}>
            <span style={{color: 'var(--cyan)'}}>GPT-4 processes 128,000 tokens per context window</span><br/>
            Each token = 768-dimensional vector in GPT-2, <span style={{color: 'var(--ghost)'}}>12,288-dimensional in GPT-4</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Embedding scatter ────────────────────────────────────────
const CLUSTERS = [
  { label: 'animals', color: '#22d3ee' },  // cyan
  { label: 'royalty', color: '#f59e0b' },  // amber
  { label: 'places', color: '#7c3aed' },   // violet
  { label: 'actions', color: '#10b981' }   // green
];

const SCATTER_POINTS = Array.from({ length: 60 }, (_, i) => {
  const cIdx = i % 4;
  return {
    x: cIdx === 0 ? 20 + Math.random() * 20 :
       cIdx === 1 ? 65 + Math.random() * 20 : 
       cIdx === 2 ? 40 + Math.random() * 20 : 
       15 + Math.random() * 25,
    y: cIdx === 0 ? 20 + Math.random() * 20 :
       cIdx === 1 ? 30 + Math.random() * 20 : 
       cIdx === 2 ? 65 + Math.random() * 20 : 
       65 + Math.random() * 20,
    z: (Math.random() - 0.5) * 60,
    color: CLUSTERS[cIdx].color,
    clusterIdx: cIdx
  };
});

function EmbeddingPanel() {
  const angleRef = useRef(0);
  const rafRef = useRef(null);
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    const spin = () => {
      angleRef.current += 0.3;
      setAngle(angleRef.current);
      rafRef.current = requestAnimationFrame(spin);
    };
    rafRef.current = requestAnimationFrame(spin);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="panel-text-overlay embedding-container" style={{ maxWidth: '700px' }}>
      <p className="eyebrow" style={{ marginBottom: '1.5rem' }}>Embedding Space</p>
      <h2 className="headline-md" style={{ marginBottom: '2rem' }}>
        Each word: a point in{' '}
        <span style={{ color: 'var(--violet)' }}>1,536-dimensional space</span>
      </h2>

      {/* 3D CSS scatter */}
      <div
        style={{
          width: '320px',
          height: '240px',
          margin: '0 auto 2rem',
          perspective: '600px',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '100%', height: '100%', position: 'relative',
            transformStyle: 'preserve-3d',
            transform: `rotateY(${angle}deg) rotateX(15deg)`,
          }}
        >
          {SCATTER_POINTS.map((pt, i) => {
            const rad = (angle * Math.PI) / 180;
            const depth = pt.z * Math.cos(rad);
            const scale = 0.6 + (depth + 60) / 120 * 0.4;
            return (
              <div
                key={i}
                className="embedding-point"
                style={{
                  position: 'absolute', left: `${pt.x}%`, top: `${pt.y}%`,
                  width: 8, height: 8, borderRadius: '50%',
                  background: pt.color, boxShadow: `0 0 8px ${pt.color}`,
                  transform: `scale(${scale}) translateZ(${pt.z}px)`,
                  opacity: scale * 0.9,
                }}
              />
            );
          })}
          
          {/* Cluster labels that fade in on hover */}
          {CLUSTERS.map((c, i) => {
             // Calculate rough center of each cluster manually based on generator logic
             const cx = i === 0 ? 30 : i === 1 ? 75 : i === 2 ? 50 : 27;
             const cy = i === 0 ? 30 : i === 1 ? 40 : i === 2 ? 75 : 75;
             return (
               <div key={i} className="embedding-zone" style={{ left: `${cx}%`, top: `${cy}%`, color: c.color }}>
                 {c.label}
               </div>
             )
          })}
        </div>
      </div>

      {/* Word2Vec Analogy Animation */}
      <div className="word2vec-anim" style={{ marginTop: '2rem' }}>
        <div className="mono" style={{ fontSize: '1.2rem', color: 'var(--ghost)' }}>
          king <span style={{color: 'var(--dim)'}}>−</span> man <span style={{color: 'var(--dim)'}}>+</span> woman <span style={{color: 'var(--dim)'}}>=</span>{' '}
          <span style={{ 
            opacity: Math.floor(angle / 60) % 2 === 1 ? 1 : 0, // toggle visibility every 60 degrees of rotation (~3s)
            color: 'var(--amber)', 
            textShadow: '0 0 10px var(--amber)',
            transition: 'opacity 0.6s'
          }}>queen</span>
        </div>
      </div>

      <div className="stat-callout" style={{ marginTop: '1.5rem' }}>
        <p className="mono" style={{ fontSize: '0.75rem', color: 'var(--dim)', margin: 0, lineHeight: 1.6 }}>
          Word2Vec embeddings (2013) first showed that vector arithmetic captures meaning.<br/>
          <span style={{color: 'var(--violet)'}}>GPT-4's embeddings are 12,288-dimensional.</span>
        </p>
      </div>
    </div>
  );
}

// ── Main Export ──────────────────────────────────────────────
export default function RawDataSection() {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Add fade effects to inner panels
      const panels = containerRef.current.querySelectorAll('.v-panel-content');
      panels.forEach((panel, i) => {
        if (i === 0) return; // First panel is already visible
        
        // Panels fade in as they approach center of screen
        gsap.fromTo(
          panel,
          { opacity: 0, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            ease: 'power2.out',
            duration: 1,
            scrollTrigger: {
              trigger: panel,
              start: 'top 75%',
            },
          }
        );
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section
      className="raw-data-section"
      ref={sectionRef}
      id="raw-data"
    >
      <DataTicker />

      <div
        ref={containerRef}
        className="vertical-scroll-container"
      >
        {/* Panel A — The Flood */}
        <div className="v-panel">
          <div className="v-panel-content" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CategorisedStreams />
            <div className="panel-text-overlay content-above">
              <p className="eyebrow" style={{ marginBottom: '1rem' }}>The Flood</p>
              <h2 className="headline-lg">
                Every second,{' '}
                <span className="glow-cyan">2.5 quintillion</span>
                <br />bytes of data are created.
              </h2>
            </div>
          </div>
        </div>

        {/* Panel B — Tokenisation */}
        <div className="v-panel">
          <div className="v-panel-content" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TokenisationPanel />
          </div>
        </div>

        {/* Panel C — Embedding Space */}
        <div className="v-panel">
          <div className="v-panel-content" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmbeddingPanel />
          </div>
        </div>
      </div>
    </section>
  );
}
