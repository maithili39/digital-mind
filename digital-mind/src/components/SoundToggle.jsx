import { useState, useRef } from 'react'

export default function SoundToggle() {
  const [on, setOn] = useState(false)
  const audioRef = useRef(null)

  const toggle = () => {
    if (!audioRef.current) {
      const ctx = new window.AudioContext()
      // Layer 1: deep drone (40Hz)
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.frequency.value = 40
      osc1.type = 'sine'
      gain1.gain.value = 0.04
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start()
      
      // Layer 2: higher harmonic (120Hz)
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.frequency.value = 120
      osc2.type = 'sine'
      gain2.gain.value = 0.015
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start()
      
      // Layer 3: subtle noise
      const bufferSize = ctx.sampleRate * 2
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.008
      }
      const noise = ctx.createBufferSource()
      noise.buffer = buffer
      noise.loop = true
      const noiseGain = ctx.createGain()
      noiseGain.gain.value = 0.3
      noise.connect(noiseGain)
      noiseGain.connect(ctx.destination)
      noise.start()
      
      audioRef.current = { ctx, gain1, gain2, noiseGain }
    }
    
    const { gain1, gain2, noiseGain, ctx } = audioRef.current
    const target = on ? 0 : 1
    
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
    
    gain1.gain.setTargetAtTime(target * 0.04, ctx.currentTime, 0.5)
    gain2.gain.setTargetAtTime(target * 0.015, ctx.currentTime, 0.5)
    noiseGain.gain.setTargetAtTime(target * 0.3, ctx.currentTime, 0.5)
    setOn(!on)
  }

  return (
    <button
      onClick={toggle}
      aria-label={on ? 'Mute ambient sound' : 'Enable ambient sound'}
      data-cursor
      style={{
        position: 'fixed', top: '1.5rem', right: '1.5rem',
        zIndex: 1000, background: 'transparent',
        border: `1px solid rgba(34,211,238,${on ? '0.6' : '0.3'})`,
        borderRadius: '50%', width: 40, height: 40,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'none', transition: 'border-color 0.3s',
        boxShadow: on ? '0 0 10px rgba(34,211,238,0.2)' : 'none'
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={on ? '#22d3ee' : '#64748b'} strokeWidth="1.5">
        {on
          ? <><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></>
          : <><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></>
        }
      </svg>
    </button>
  )
}
