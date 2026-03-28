import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const BOOT_LINES = [
  { text: "ANTHROPIC NEURAL INTERFACE v4.0", delay: 0 },
  { text: "Initialising cortex architecture...", delay: 300 },
  { text: "Loading transformer blocks: [96/96] ████████████ 100%", delay: 700 },
  { text: "Mapping 1,760,000,000,000 parameters...", delay: 1100 },
  { text: "Calibrating attention heads: 9,216 active", delay: 1500 },
  { text: "Embedding space: 12,288 dimensions online", delay: 1800 },
  { text: "Context window: 128,000 tokens allocated", delay: 2100 },
  { text: "Synaptic pathways: 87B connections mapped", delay: 2400 },
  { text: "Running alignment checks... PASSED", delay: 2700 },
  { text: "█████████████████████ MIND ONLINE", delay: 3000 },
]

export default function Preloader({ onComplete }) {
  const [activeLines, setActiveLines] = useState([])
  const [done, setDone] = useState(false)
  const preloaderRef = useRef(null)

  useEffect(() => {
    BOOT_LINES.forEach((line, idx) => {
      setTimeout(() => {
        setActiveLines((prev) => {
          const next = [...prev]
          // Mark previous line as done
          if (next.length > 0) {
            next[next.length - 1].isDone = true
          }
          next.push({ ...line, currentText: '', isDone: false, isHighlight: idx === BOOT_LINES.length - 1 })
          return next
        })

        // Typewriter effect for the current line
        let charIdx = 0
        const intv = setInterval(() => {
          charIdx++
          setActiveLines((prev) => {
            const next = [...prev]
            if (next[idx]) {
              next[idx].currentText = line.text.slice(0, charIdx)
            }
            return next
          })
          if (charIdx >= line.text.length) {
            clearInterval(intv)
          }
        }, 15)
      }, line.delay)
    })

    setTimeout(() => {
      gsap.to(preloaderRef.current, {
        opacity: 0,
        duration: 0.8,
        onComplete: () => {
          setDone(true)
          if (onComplete) onComplete()
        }
      })
    }, 3400)
  }, [onComplete])

  if (done) return null

  return (
    <div className="preloader" ref={preloaderRef}>
      {activeLines.map((line, i) => (
        <div 
          key={i} 
          className={`boot-line active ${line.isDone ? 'done' : ''} ${line.isHighlight ? 'highlight' : ''}`}
        >
          {line.currentText}
          {!line.isDone && <span className="cursor-blink">▋</span>}
        </div>
      ))}
      <div className="progress-track">
        <div className="progress-fill" />
      </div>
    </div>
  )
}
