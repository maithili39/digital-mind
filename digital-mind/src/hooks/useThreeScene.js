import { useEffect, useRef } from 'react';

export function useThreeScene(containerRef, initScene) {
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let destroyed = false;
    let animId = null;
    let cleanup = null;

    const isVisible = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (sceneRef.current?.resume) sceneRef.current.resume();
      } else {
        if (sceneRef.current?.pause) sceneRef.current.pause();
      }
    }, { threshold: 0 });

    isVisible.observe(containerRef.current);

    (async () => {
      if (destroyed) return;
      const result = await initScene(containerRef.current);
      if (destroyed) {
        result?.dispose?.();
        return;
      }
      sceneRef.current = result;
    })();

    return () => {
      destroyed = true;
      if (animId) cancelAnimationFrame(animId);
      isVisible.disconnect();
      sceneRef.current?.dispose?.();
      sceneRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return sceneRef;
}
