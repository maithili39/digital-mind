import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';
import { INNER_NODES, OUTER_NODES, MOBILE_BREAKPOINT } from '../constants';

gsap.registerPlugin(ScrollTrigger);

const isMobile = () => window.innerWidth < MOBILE_BREAKPOINT;

// Node layout (SVG coordinate space 900×600)
const CENTER = { x: 450, y: 300 };
const INNER_ANGLE_STEP = (2 * Math.PI) / INNER_NODES.length;
const INNER_R = 160;
const OUTER_R = 290;

function nodePos(idx, count, radius, center = CENTER) {
  const angle = (2 * Math.PI * idx) / count - Math.PI / 2;
  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius,
  };
}

const innerPositions = INNER_NODES.map((_, i) => nodePos(i, INNER_NODES.length, INNER_R));
const outerPositions = OUTER_NODES.map((_, i) => nodePos(i, OUTER_NODES.length, OUTER_R));

// Inner–Inner connections
const INNER_CONNECTIONS = [
  [0, 1], // Memory ↔ Pattern
  [2, 3], // Language ↔ Emotion
  [4, 0], [4, 1], [4, 2], [4, 3], // Self-Reference ↔ all
];

// Outer → Inner connections (outerIdx → innerIdx)
const OUTER_CONNECTIONS = [
  [0, 0], [0, 1], // Training Data → Memory, Pattern
  [1, 0], [1, 1], // Weights → Memory, Pattern
  [2, 1],         // Gradient → Pattern
  [3, 2], [3, 4], // Transformer → Language, Self-Reference
  [4, 2], [4, 3], [4, 4], // Emergent → Language, Emotion, Self-Reference
];

// Path d between two positions
function pathD(from, to) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  return `M${from.x},${from.y} Q${mx},${my} ${to.x},${to.y}`;
}

// ── Model Stack Anatomy ─────────────────────────────────────────
function ModelStackAnatomy() {
  const [hoveredLayer, setHoveredLayer] = useState(null);
  const layers = [
    { name: 'Output Distribution', color: 'var(--amber)', desc: 'Predicting the most likely next token probability.' },
    { name: 'Unembedding Layer', color: 'var(--amber)', desc: 'Maps vectors back to the 50,257 vocabulary limit.' },
    { name: 'Layer Norm', color: 'var(--deep-navy)', desc: 'Final stabilization before output distribution.' },
    { name: 'Transformer Block ×96', color: 'var(--cyan)', height: 60, desc: 'The core where attention and feed-forward processing happens.' },
    { name: 'Layer Norm', color: 'var(--deep-navy)', desc: 'Normalizes inputs for numerical stability within blocks.' },
    { name: 'Positional Encoding', color: 'var(--violet)', desc: 'Injects sequence order into the unstructured tokens.' },
    { name: 'Token Embeddings', color: 'var(--violet)', desc: 'Maps IDs to 12,288-dimensional dense thought space.' },
    { name: 'Input Tokens', color: 'var(--void-black)', desc: 'Raw discrete pieces of text from the user snippet.' },
  ];

  return (
    <div className="model-stack-container" style={{ width: '100%', maxWidth: '900px', margin: '0 auto 8rem', padding: '4rem 2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <p className="eyebrow">THE ARCHITECTURE</p>
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 300, marginTop: '0.5rem' }}>Model Stack Anatomy</h2>
        <p style={{ color: 'var(--dim)', marginTop: '0.5rem' }}>Hover layers to inspect vertically stacked mechanisms</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        <svg width="400" height="400" viewBox="0 0 400 400" style={{ overflow: 'visible' }}>
          {layers.map((l, i) => {
            const isHovered = hoveredLayer === i;
            const y = i * 45;
            const h = l.height || 35;
            return (
              <g key={i} 
                 onMouseEnter={() => setHoveredLayer(i)} 
                 onMouseLeave={() => setHoveredLayer(null)}
                 style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                 className="stack-layer"
              >
                <rect 
                  x="40" y={y} width="220" height={h} rx="4"
                  fill={l.color === 'var(--void-black)' ? 'transparent' : l.color}
                  stroke={l.color === 'var(--void-black)' ? 'var(--cyan)' : l.color}
                  strokeWidth="1"
                  opacity={hoveredLayer !== null && !isHovered ? 0.3 : 0.9}
                  style={{ transition: 'opacity 0.3s' }}
                />
                <text x="150" y={y + h/2} fill={l.color !== 'var(--deep-navy)' && l.color !== 'var(--void-black)' ? 'var(--deep-navy)' : 'var(--ghost)'} 
                      fontSize="11" fontFamily="var(--font-mono)" textAnchor="middle" dominantBaseline="middle"
                      opacity={hoveredLayer !== null && !isHovered ? 0.3 : 1}
                      style={{ transition: 'opacity 0.3s', pointerEvents: 'none', fontWeight: 600 }}
                >
                  {l.name}
                </text>
                
                <path d={`M 270 ${y + h/2} L 310 ${y + h/2}`} stroke="var(--dim)" strokeWidth="1" strokeDasharray="2 2" 
                      opacity={isHovered ? 1 : 0.2} style={{ transition: 'opacity 0.3s' }} />
              </g>
            )
          })}
        </svg>

        <div style={{ width: '280px', minHeight: '100px', display: 'flex', alignItems: 'center' }}>
          {hoveredLayer !== null ? (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <h4 style={{ color: layers[hoveredLayer].color === 'var(--void-black)' ? 'var(--cyan)' : layers[hoveredLayer].color, marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                {layers[hoveredLayer].name}
              </h4>
              <p style={{ color: 'var(--ghost)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                {layers[hoveredLayer].desc}
              </p>
            </motion.div>
          ) : (
            <p style={{ color: 'var(--dim)', fontStyle: 'italic', fontSize: '0.9rem' }}>
              Select a layer to view details.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Training Timeline ───────────────────────────────────────────
function TrainingTimeline() {
  const timelineRef = useRef(null);
  const lineRef = useRef(null);

  const events = [
    { year: 1943, title: 'McCulloch-Pitts', desc: 'First mathematical model of a neural network.' },
    { year: 1958, title: 'Perceptron', desc: 'Rosenblatt invents the first trainable neural network.' },
    { year: 1986, title: 'Backpropagation', desc: 'Hinton et al. popularize the learning algorithm.' },
    { year: 2012, title: 'AlexNet', desc: 'Deep learning revolution begins with GPUs.' },
    { year: 2017, title: 'Transformer', desc: '"Attention Is All You Need" is published.' },
    { year: 2020, title: 'GPT-3', desc: 'Scaling laws prove massive models work.' },
    { year: 2023, title: 'GPT-4', desc: 'Multimodal, trillion-parameter reasoning.' },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      const lineLen = lineRef.current.getTotalLength() || 1000;
      gsap.fromTo(lineRef.current,
        { strokeDasharray: lineLen, strokeDashoffset: lineLen },
        {
          strokeDashoffset: 0,
          scrollTrigger: {
            trigger: timelineRef.current,
            start: 'top 80%',
            end: 'top 20%',
            scrub: 1,
          }
        }
      );

      gsap.fromTo('.timeline-node',
        { scale: 0, opacity: 0 },
        {
          scale: 1, opacity: 1,
          stagger: 0.1,
          scrollTrigger: {
            trigger: timelineRef.current,
            start: 'top 80%',
            end: 'top 20%',
            scrub: 1,
          }
        }
      );
    }, timelineRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="training-timeline" ref={timelineRef} style={{ width: '100%', maxWidth: '1000px', margin: '8rem auto 4rem', padding: '0 2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
        <p className="eyebrow">THE LONG ARC</p>
        <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 300, marginTop: '0.5rem' }}>Evolution of the Digital Mind</h2>
      </div>

      <div style={{ position: 'relative', height: '140px' }}>
        <svg width="100%" height="2" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', overflow: 'visible' }}>
          <line ref={lineRef} x1="0" y1="0" x2="100%" y2="0" stroke="var(--dim)" strokeWidth="2" strokeDasharray="6 6" />
        </svg>

        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', top: '50%', transform: 'translateY(-50%)' }}>
          {events.map((ev, i) => {
            const isTop = i % 2 === 0;
            return (
              <div key={i} className="timeline-node" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} data-fact={ev.desc}>
                <div style={{
                  position: 'absolute',
                  [isTop ? 'bottom' : 'top']: '24px',
                  textAlign: 'center',
                  width: '120px',
                }}>
                  <div className="mono" style={{ color: 'var(--cyan)', fontSize: '12px', marginBottom: '4px' }}>{ev.year}</div>
                  <div style={{ color: 'var(--ghost)', fontSize: '13px' }}>{ev.title}</div>
                </div>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--void-black)', border: '2px solid var(--violet)', flexShrink: 0, zIndex: 2 }} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main Insight Section ───────────────────────────────────────
export default function InsightSection() {
  const sectionRef = useRef(null);
  const [phase, setPhase] = useState(0);
  const [tooltip, setTooltip] = useState(null);
  const [queryText, setQueryText] = useState('What is consciousness?');
  const dotRefs = useRef({});
  const pathRefs = useRef({});
  const mobile = isMobile();

  // Reduce nodes on mobile
  const innerNodes = mobile ? INNER_NODES.slice(0, 4) : INNER_NODES;
  const outerNodes = mobile ? OUTER_NODES.slice(0, 4) : OUTER_NODES;
  const innerPos = innerNodes.map((_, i) => nodePos(i, innerNodes.length, INNER_R));
  const outerPos = outerNodes.map((_, i) => nodePos(i, outerNodes.length, OUTER_R));

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Pin the sticky container
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pin: '.insight-sticky',
        pinSpacing: false,
      });

      // Phase 1: Center node appears
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 60%',
        onEnter: () => setPhase(1),
        once: true,
      });

      // Phase 2: Inner paths draw
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: '15% top',
        onEnter: () => setPhase(2),
        once: true,
      });

      // Phase 3: Inner-inner connections
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: '45% top',
        onEnter: () => setPhase(3),
        once: true,
      });

      // Phase 4: Outer ring
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: '72% top',
        onEnter: () => {
          setPhase(4);
          setQueryText('I think, therefore...');
        },
        once: true,
      });
    });
    return () => ctx.revert();
  }, []);

  // Animate paths when phase changes
  useEffect(() => {
    Object.values(pathRefs.current).forEach((el) => {
      if (!el) return;
      
      // Calculate actual length to prevent clipping issues
      const len = el.getTotalLength?.() || 800;
      
      // Use GSAP staggers or better easing based on data-delay
      const delay = parseFloat(el.dataset.delay || 0);
      
      gsap.fromTo(el, 
        { strokeDasharray: len, strokeDashoffset: len },
        {
          strokeDashoffset: 0,
          duration: 1.8,
          ease: 'power3.inOut',
          delay: delay,
          overwrite: 'auto', // Important to prevent conflicting animations if scrolling fast
        }
      );
    });
  }, [phase]);

  // Traveling dot animation on a path
  const animateDot = (pathEl, dotEl) => {
    if (!pathEl || !dotEl) return;
    const len = pathEl.getTotalLength();
    gsap.to({}, {
      duration: 2,
      repeat: -1,
      ease: 'none',
      onUpdate: function () {
        const pt = pathEl.getPointAtLength(this.progress() * len);
        dotEl.setAttribute('cx', pt.x);
        dotEl.setAttribute('cy', pt.y);
      },
    });
  };

  // Start traveling dots after phase 2
  useEffect(() => {
    if (phase < 2) return;
    const timer = setTimeout(() => {
      innerNodes.forEach((_, i) => {
        const pathEl = pathRefs.current[`center-inner-${i}`];
        const dotEl = dotRefs.current[`center-inner-${i}`];
        animateDot(pathEl, dotEl);
      });
    }, 1400);
    return () => clearTimeout(timer);
  }, [phase, innerNodes]);

  useEffect(() => {
    if (phase < 4) return;
    const timer = setTimeout(() => {
      outerNodes.forEach((_, i) => {
        const innerIdx = OUTER_CONNECTIONS.find(([oi]) => oi === i)?.[1] ?? 0;
        const pathEl = pathRefs.current[`outer-${i}`];
        const dotEl = dotRefs.current[`outer-${i}`];
        animateDot(pathEl, dotEl);
      });
    }, 1400);
    return () => clearTimeout(timer);
  }, [phase, outerNodes]);

  const CircleNode = ({ cx, cy, label, nodeClass, nodeData, r = 38, isOuter = false }) => (
    <motion.g
      className={`graph-node-group ${nodeClass}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      tabIndex={0}
      onHoverStart={() => setTooltip({ x: cx, y: cy - r - 20, isOuter, ...nodeData })}
      onHoverEnd={() => setTooltip(null)}
      onFocus={() => setTooltip({ x: cx, y: cy - r - 20, isOuter, ...nodeData })}
      onBlur={() => setTooltip(null)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') setTooltip({ x: cx, y: cy - r - 20, isOuter, ...nodeData });
      }}
    >
      <circle cx={cx} cy={cy} r={r} className="graph-node-circle" />
      <foreignObject x={cx - r} y={cy - r} width={r * 2} height={r * 2} style={{ pointerEvents: 'none' }}>
        <div style={{
          width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', color: 'var(--ghost)', fontFamily: 'var(--font-mono)',
          fontSize: r <= 30 ? '8px' : '10px', lineHeight: 1.2, padding: '0 4px',
          wordBreak: 'break-word', hyphens: 'auto'
        }}>
          {label}
        </div>
      </foreignObject>
    </motion.g>
  );

  return (
    <section className="insight-section" id="insight">
      {/* Background hexagons */}
      <div className="bg-shapes">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-hex"
            style={{
              width: 80 + i * 30,
              height: 80 + i * 30,
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDuration: `${18 + i * 4}s`,
              animationDelay: `${-i * 3}s`,
            }}
          />
        ))}
      </div>

      <ModelStackAnatomy />

      <div className="insight-graph-container" ref={sectionRef} style={{ position: 'relative' }}>
        <div className="insight-sticky">
        <div style={{ width: '100%', maxWidth: 900, padding: '0 1rem', position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <p className="eyebrow">KNOWLEDGE GRAPH FORMATION</p>
            <h2 className="headline-lg" style={{ marginTop: '0.5rem' }}>
              A Thought Forms
            </h2>
          </div>

          <svg viewBox="0 0 900 600" className="graph-svg">
            {/* ── Paths: center → inner (phase 2) ── */}
            {phase >= 2 && innerNodes.map((_, i) => {
              const d = pathD(CENTER, innerPos[i]);
              return (
                <g key={`ci-${i}`}>
                  <path
                    ref={(el) => (pathRefs.current[`center-inner-${i}`] = el)}
                    d={d}
                    className="graph-path"
                    data-delay={i * 0.12}
                  />
                  <circle
                    ref={(el) => (dotRefs.current[`center-inner-${i}`] = el)}
                    className="traveling-dot"
                    cx={CENTER.x} cy={CENTER.y} r={3}
                    style={{ fill: 'var(--cyan)', filter: 'drop-shadow(0 0 4px var(--cyan))' }}
                  />
                </g>
              );
            })}

            {/* ── Paths: inner → inner (phase 3) ── */}
            {phase >= 3 && INNER_CONNECTIONS
              .filter(([a, b]) => a < innerNodes.length && b < innerNodes.length)
              .map(([a, b], i) => (
                <path
                  key={`ii-${i}`}
                  ref={(el) => (pathRefs.current[`inner-inner-${i}`] = el)}
                  d={pathD(innerPos[a], innerPos[b])}
                  className="graph-path graph-path-inner"
                  data-delay={i * 0.1}
                />
              ))}

            {/* ── Paths: outer → inner (phase 4) ── */}
            {phase >= 4 && OUTER_CONNECTIONS
              .filter(([oi, ii]) => oi < outerNodes.length && ii < innerNodes.length)
              .map(([oi, ii], i) => (
                <g key={`oi-${i}`}>
                  <path
                    ref={(el) => (pathRefs.current[`outer-conn-${i}`] = el)}
                    d={pathD(outerPos[oi], innerPos[ii])}
                    className="graph-path graph-path-outer"
                    data-delay={i * 0.08}
                  />
                </g>
              ))}

            {/* ── Outer dots ── */}
            {phase >= 4 && outerNodes.map((_, i) => (
              <circle
                key={`od-${i}`}
                ref={(el) => (dotRefs.current[`outer-${i}`] = el)}
                className="traveling-dot"
                cx={outerPos[i].x} cy={outerPos[i].y} r={3}
                style={{ fill: 'var(--amber)', filter: 'drop-shadow(0 0 4px var(--amber))' }}
              />
            ))}

            {/* ── Center node ── */}
            {phase >= 1 && (
              <motion.g
                initial={{ scale: 0 }} animate={{ scale: phase >= 4 ? 1.2 : 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <circle
                  cx={CENTER.x} cy={CENTER.y} r={52}
                  fill="var(--void-black)"
                  stroke="var(--violet)"
                  strokeWidth={2}
                  style={{ filter: 'drop-shadow(0 0 14px rgba(124,58,237,0.7))' }}
                />
                <foreignObject x={CENTER.x - 45} y={CENTER.y - 45} width={90} height={90}>
                  <div style={{
                    width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                    fontFamily: 'var(--font-mono)', lineHeight: 1.2
                  }}>
                    <span style={{ color: 'var(--dim)', fontSize: '7px', marginBottom: '2px' }}>
                      QUERY:
                    </span>
                    <span style={{ color: 'var(--ghost)', fontSize: '10px', wordBreak: 'break-word' }}>
                      {queryText}
                    </span>
                  </div>
                </foreignObject>
              </motion.g>
            )}

            {/* ── Inner nodes (phase 2) ── */}
            {phase >= 2 && innerNodes.map((node, i) => (
              <CircleNode
                key={node.id}
                cx={innerPos[i].x} cy={innerPos[i].y}
                label={node.label}
                nodeClass="graph-node-inner"
                nodeData={node}
                r={36}
              />
            ))}

            {/* ── Outer nodes (phase 4) ── */}
            {phase >= 4 && outerNodes.map((node, i) => (
              <CircleNode
                key={node.id}
                cx={outerPos[i].x} cy={outerPos[i].y}
                label={node.label}
                nodeClass="graph-node-outer"
                nodeData={node}
                r={30}
                isOuter={true}
              />
            ))}
          </svg>

          {/* Tooltip */}
          <AnimatePresence>
            {tooltip && (
              <motion.div
                className="node-tooltip"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                style={{
                  position: 'absolute',
                  left: `${(tooltip.x / 900) * 100}%`,
                  top: `${(tooltip.y / 600) * 100}%`,
                  transform: 'translate(-50%, -100%)',
                  width: '280px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: tooltip.isOuter ? 'var(--amber)' : 'var(--cyan)' }} />
                  <h4 style={{ margin: 0, color: 'var(--ghost)', fontSize: '1rem', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>{tooltip.label}</h4>
                </div>
                <p style={{ color: 'var(--dim)', fontSize: '0.85rem', marginBottom: '0.8rem', lineHeight: 1.4 }}>{tooltip.explanation}</p>
                <div className="mono" style={{ fontSize: '0.75rem', color: tooltip.isOuter ? 'var(--amber)' : 'var(--cyan)', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                  {tooltip.stat}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      </div>

      <TrainingTimeline />
    </section>
  );
}
