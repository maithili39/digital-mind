import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

export default function Cursor() {
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const tooltipRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [factText, setFactText] = useState(null);

  useEffect(() => {
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    // Detect touch device — hide cursor
    const isTouch = window.matchMedia('(hover: none)').matches;
    if (isTouch) {
      ring.style.display = 'none';
      dot.style.display = 'none';
      return;
    }

    const ringX = gsap.quickTo(ring, 'x', { duration: 0.4, ease: 'power3.out' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.4, ease: 'power3.out' });
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.05, ease: 'power3.out' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.05, ease: 'power3.out' });
    
    // Tooltip follows slightly below the cursor
    const ttX = gsap.quickTo(tooltipRef.current, 'x', { duration: 0.2, ease: 'power3.out' });
    const ttY = gsap.quickTo(tooltipRef.current, 'y', { duration: 0.2, ease: 'power3.out' });

    const onMove = (e) => {
      ringX(e.clientX);
      ringY(e.clientY);
      dotX(e.clientX);
      dotY(e.clientY);
      if (tooltipRef.current) {
        ttX(e.clientX);
        ttY(e.clientY + 30); // Offset below the cursor
      }
    };

    // Event delegation for hover states and tooltips
    const checkHover = (e) => {
      // Check if the target is interactive
      const isInteractive = e.target.closest(
        'a, button, input, textarea, [tabindex="0"], .word-pill, .sentence-chip, .graph-node-group'
      );
      setIsHovering(!!isInteractive);

      // Check for global data-fact tooltip
      const factEl = e.target.closest('[data-fact]');
      if (factEl) {
        setFactText(factEl.getAttribute('data-fact'));
      } else {
        setFactText(null);
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', checkHover);
    
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', checkHover);
    };
  }, []);

  return (
    <>
      <div className={`cursor-ring ${isHovering ? 'hovering' : ''}`} ref={ringRef} />
      <div className={`cursor-dot-center ${isHovering ? 'hovering' : ''}`} ref={dotRef} />
      
      <div 
        ref={tooltipRef}
        className="global-fact-tooltip"
        style={{ opacity: factText ? 1 : 0 }}
      >
        {factText}
      </div>
    </>
  );
}
