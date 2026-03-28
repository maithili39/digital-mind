import { useState, useEffect } from 'react'
import gsap from 'gsap'

const SECTIONS = [
  { id: 'hero', label: 'Wake Up' },
  { id: 'raw-data', label: 'Raw Data' },
  { id: 'attention', label: 'Attention' },
  { id: 'insight', label: 'Thought Forms' },
  { id: 'conclusion', label: 'Speak to It' },
]

export default function SideNav() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const centerY = window.innerHeight / 2
      for (let i = 0; i < SECTIONS.length; i++) {
        const el = document.getElementById(SECTIONS[i].id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= centerY && rect.bottom >= centerY) {
            setActive(i)
            break
          }
        }
      }
    }

    // Call once to set initial state
    handleScroll()
    
    // Listen to native scroll (which Lenis triggers)
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className="side-nav" style={{
      position: 'fixed', right: '2rem', top: '50%',
      transform: 'translateY(-50%)', zIndex: 1000,
      display: 'flex', flexDirection: 'column', gap: '16px',
      alignItems: 'center'
    }}>
      {SECTIONS.map((s, i) => (
        <button
          key={s.id}
          onClick={() => scrollTo(s.id)}
          aria-label={`Navigate to ${s.label}`}
          title={s.label}
          data-cursor
          style={{
            width: i === active ? 10 : 6,
            height: i === active ? 10 : 6,
            borderRadius: '50%',
            background: i === active ? '#22d3ee' : '#64748b',
            border: i === active ? '0 solid transparent' : '1px solid #64748b',
            cursor: 'none',
            transition: 'all 0.3s ease',
            padding: 0,
            boxShadow: i === active ? '0 0 10px #22d3ee' : 'none'
          }}
        />
      ))}
    </nav>
  )
}
