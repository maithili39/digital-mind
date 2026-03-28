import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

import Cursor from './components/Cursor';
import Preloader from './components/Preloader';
import SideNav from './components/SideNav';
import SoundToggle from './components/SoundToggle';

import HeroSection from './components/HeroSection';
import RawDataSection from './components/RawDataSection';
import AttentionSection from './components/AttentionSection';
import InsightSection from './components/InsightSection';
import ConclusionSection from './components/ConclusionSection';
import NotFound from './pages/404';

import './styles/global.css';

gsap.registerPlugin(ScrollTrigger);

// Debounced ScrollTrigger refresh on resize
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    ScrollTrigger.refresh();
  }, 200);
});

function MainApp() {
  const [bootSequenceDone, setBootSequenceDone] = useState(false);

  useEffect(() => {
    if (!bootSequenceDone) return;

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Section Transition Scan Lines
    const sections = document.querySelectorAll('.section, .hero-section, .raw-data-section, .attention-section, .insight-section, .conclusion-section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const scanLine = document.createElement('div');
          scanLine.style.cssText = `
            position: absolute; top: 0; left: 0;
            width: 100%; height: 1px;
            background: linear-gradient(90deg, transparent, #22d3ee, transparent);
            z-index: 100; pointer-events: none;
            animation: scanDown 0.6s ease-out forwards;
          `;
          entry.target.style.position = 'relative';
          entry.target.appendChild(scanLine);
          setTimeout(() => scanLine?.remove(), 700);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    
    // Give react next tick to render sections
    setTimeout(() => {
      sections.forEach(s => observer.observe(s));
    }, 100);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
      observer.disconnect();
    };
  }, [bootSequenceDone]);

  return (
    <>
      <Preloader onComplete={() => setBootSequenceDone(true)} />
      <Cursor />
      
      {bootSequenceDone && (
        <>
          <SideNav />
          <SoundToggle />
          <main>
            <HeroSection />
            <div className="section-spacer" />
            <RawDataSection />
            <div className="section-spacer" />
            <AttentionSection />
            <div className="section-spacer" />
            <InsightSection />
            <div className="section-spacer" />
            <ConclusionSection />
          </main>
        </>
      )}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
