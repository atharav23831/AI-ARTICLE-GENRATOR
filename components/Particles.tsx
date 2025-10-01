
import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  // other properties
}

// Example createParticle function
const createParticle = () => ({
  x: Math.random() * window.innerWidth,
  y: Math.random() * window.innerHeight,
  // add other properties
});

const Particles = () => {
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    // Initialize particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      const p = createParticle(); // ✅ use const instead of let
      newParticles.push(p);
    }
    particlesRef.current = newParticles;

    // Animation or update logic here

  }, []); // Optional: Add dependencies if needed, e.g., [particlesRef]

  return (
    <canvas id="particle-canvas" />
  );
};

export default Particles;
