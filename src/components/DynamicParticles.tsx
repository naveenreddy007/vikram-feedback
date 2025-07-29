import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface DynamicParticlesProps {
  intensity?: number;
  color?: string;
  trigger?: boolean;
  className?: string;
}

const DynamicParticles: React.FC<DynamicParticlesProps> = ({
  intensity = 1,
  color = '#00d4ff',
  trigger = false,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
  }>>([]);

  const createParticle = (x?: number, y?: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;

    return {
      id: Math.random(),
      x: x ?? Math.random() * rect.width,
      y: y ?? Math.random() * rect.height,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 0,
      maxLife: 60 + Math.random() * 60
    };
  };

  const updateParticles = () => {
    setParticles(prevParticles => {
      return prevParticles
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          life: particle.life + 1,
          vx: particle.vx * 0.99,
          vy: particle.vy * 0.99
        }))
        .filter(particle => particle.life < particle.maxLife);
    });
  };

  // Create particles on trigger
  useEffect(() => {
    if (trigger) {
      const newParticles = Array.from({ length: Math.floor(20 * intensity) }, () => 
        createParticle()
      ).filter((particle): particle is NonNullable<typeof particle> => particle !== null);
      
      setParticles(prev => [...prev, ...newParticles]);
    }
  }, [trigger, intensity]);

  // Animation loop
  useEffect(() => {
    const interval = setInterval(updateParticles, 16); // ~60fps
    return () => clearInterval(interval);
  }, []);

  // Continuous particle generation
  useEffect(() => {
    const interval = setInterval(() => {
      if (particles.length < 50 * intensity) {
        const newParticle = createParticle();
        if (newParticle) {
          setParticles(prev => [...prev, newParticle]);
        }
      }
    }, 200 / intensity);

    return () => clearInterval(interval);
  }, [particles.length, intensity]);

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
    >
      {particles.map(particle => {
        const opacity = 1 - (particle.life / particle.maxLife);
        const scale = 0.5 + (1 - particle.life / particle.maxLife) * 0.5;
        
        return (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: color,
              left: particle.x,
              top: particle.y,
              opacity: opacity,
              transform: `scale(${scale})`,
              boxShadow: `0 0 ${4 * scale}px ${color}`
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ 
              scale: scale,
              opacity: opacity
            }}
            transition={{ duration: 0.1 }}
          />
        );
      })}
    </div>
  );
};

export default DynamicParticles;