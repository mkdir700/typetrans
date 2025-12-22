import React, { useState, useImperativeHandle, forwardRef, useCallback } from 'react';

export interface StarrySkyRef {
  explode: (x: number, y: number) => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  tx: string; // translate x
  ty: string; // translate y
  color: string;
  size: number;
}

export const StarrySky = forwardRef<StarrySkyRef, {}>((_, ref) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  const explode = useCallback((x: number, y: number) => {
    const newParticles: Particle[] = [];
    const count = 8 + Math.random() * 8; // 8-16 particles

    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 20 + Math.random() * 60; // distance to travel
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;
        
        // Starry colors: Gold, Blue, White, Purple
        const colors = ['#fbbf24', '#60a5fa', '#f8fafc', '#c084fc', '#ffffff']; 
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        newParticles.push({
            id: Date.now() + i + Math.random(),
            x,
            y,
            tx: `${tx}px`,
            ty: `${ty}px`,
            color,
            size: 2 + Math.random() * 2
        });
    }

    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  useImperativeHandle(ref, () => ({
    explode
  }));

  const removeParticle = useCallback((id: number) => {
    setParticles(prev => prev.filter(p => p.id !== id));
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-50">
        {particles.map(p => (
            <div
                key={p.id}
                className="star-particle"
                style={{
                    left: p.x,
                    top: p.y,
                    width: p.size,
                    height: p.size,
                    backgroundColor: p.color,
                    '--tx': p.tx,
                    '--ty': p.ty,
                    boxShadow: `0 0 ${p.size * 2}px ${p.color}`
                } as React.CSSProperties}
                onAnimationEnd={() => removeParticle(p.id)}
            />
        ))}
    </div>
  );
});

StarrySky.displayName = "StarrySky";
