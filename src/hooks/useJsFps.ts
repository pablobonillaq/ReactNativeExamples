import { useEffect, useState } from 'react';

/**
 * Measures JS thread FPS by counting requestAnimationFrame frames.
 * If the JS thread is blocked (e.g. mounting thousands of views), it drops sharply.
 */
export function useJsFps() {
  const [fps, setFps] = useState(60);

  useEffect(() => {
    let frames = 0;
    let last = Date.now();
    let rafId: number;

    const loop = () => {
      frames += 1;
      const now = Date.now();
      if (now - last >= 500) {
        setFps(Math.round((frames * 1000) / (now - last)));
        frames = 0;
        last = now;
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafId);
  }, []);

  return fps;
}
