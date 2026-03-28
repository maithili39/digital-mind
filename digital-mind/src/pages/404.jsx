export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', background: '#030308',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'JetBrains Mono', monospace",
      textAlign: 'center', padding: '2rem'
    }}>
      <p className="eyebrow">ERROR 404</p>
      <h1 className="glitch" data-text="Neuron not found." style={{
        fontSize: 'clamp(3rem, 10vw, 8rem)',
        fontWeight: 300, color: '#f1f5f9',
        letterSpacing: '-0.03em', lineHeight: 1,
        marginBottom: '1.5rem'
      }}>
        Neuron<br/>not found.
      </h1>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '3rem' }}>
        This pathway doesn't exist in the network.
      </p>
      <a href="/" style={{
        color: '#22d3ee', fontSize: '13px',
        letterSpacing: '0.1em', textDecoration: 'none',
        borderBottom: '1px solid rgba(34,211,238,0.3)',
        paddingBottom: '2px', cursor: 'pointer'
      }}>
        ← RETURN TO CORTEX
      </a>

      {/* Glitching signal lines */}
      <div style={{
        position: 'absolute', inset: 0,
        pointerEvents: 'none', overflow: 'hidden'
      }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="glitch-line" style={{
            position: 'absolute',
            left: 0, right: 0,
            height: '1px',
            background: 'rgba(34,211,238,0.15)',
            top: `${20 + i * 18}%`,
            animation: `glitchLine ${1.5 + i * 0.3}s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`
          }} />
        ))}
      </div>
    </div>
  )
}
