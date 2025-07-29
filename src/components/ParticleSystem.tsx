import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface ParticleSystemProps {
  className?: string;
  particleCount?: number;
  interactive?: boolean;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ 
  className = '', 
  particleCount = 200,
  interactive = true 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationIdRef = useRef<number>();

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    camera.position.z = 30;

    // Create engineering-themed particle system
    const createEngineeringParticles = () => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);
      const velocities = new Float32Array(particleCount * 3);

      // Engineering colors
      const engineeringColors = [
        new THREE.Color(0x00d4ff), // Electric blue
        new THREE.Color(0x39ff14), // Neon green
        new THREE.Color(0xff6b35), // Warm orange
        new THREE.Color(0xffffff), // White
        new THREE.Color(0x00ffff), // Cyan
      ];

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Random positions
        positions[i3] = (Math.random() - 0.5) * 100;
        positions[i3 + 1] = (Math.random() - 0.5) * 100;
        positions[i3 + 2] = (Math.random() - 0.5) * 50;

        // Random velocities
        velocities[i3] = (Math.random() - 0.5) * 0.02;
        velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;

        // Random colors
        const color = engineeringColors[Math.floor(Math.random() * engineeringColors.length)];
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;

        // Random sizes
        sizes[i] = Math.random() * 3 + 1;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      // Custom shader material for better particle rendering
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          mouse: { value: new THREE.Vector2() }
        },
        vertexShader: `
          attribute float size;
          attribute vec3 customColor;
        varying vec3 vColor;
          uniform float time;
          uniform vec2 mouse;
          
          void main() {
            vColor = customColor;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            
            // Add some wave motion
            mvPosition.x += sin(time * 2.0 + position.y * 0.01) * 2.0;
            mvPosition.y += cos(time * 1.5 + position.x * 0.01) * 1.5;
            
            // Mouse interaction
            vec2 mouseInfluence = (mouse - position.xy * 0.01) * 0.1;
            mvPosition.xy += mouseInfluence * 5.0;
            
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          
          void main() {
            // Create circular particles with glow
            vec2 center = gl_PointCoord - vec2(0.5);
            float dist = length(center);
            
            if (dist > 0.5) discard;
            
            float alpha = 1.0 - (dist * 2.0);
            alpha = pow(alpha, 2.0);
            
            // Add glow effect
            float glow = 1.0 - dist;
            glow = pow(glow, 3.0);
            
            gl_FragColor = vec4(vColor * (1.0 + glow), alpha * 0.8);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexColors: true
      });

      const particles = new THREE.Points(geometry, material);
      scene.add(particles);

      return { particles, material, positions, velocities };
    };

    const { particles, material, positions, velocities } = createEngineeringParticles();

    // Mouse interaction
    const handleMouseMove = (event: MouseEvent) => {
      if (!interactive) return;
      
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      material.uniforms.mouse.value.set(
        mouseRef.current.x * 50,
        mouseRef.current.y * 50
      );
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;
      material.uniforms.time.value = time;

      // Update particle positions
      const positionAttribute = particles.geometry.attributes.position;
      const positionArray = positionAttribute.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Apply velocities
        positionArray[i3] += velocities[i3];
        positionArray[i3 + 1] += velocities[i3 + 1];
        positionArray[i3 + 2] += velocities[i3 + 2];

        // Boundary wrapping
        if (positionArray[i3] > 50) positionArray[i3] = -50;
        if (positionArray[i3] < -50) positionArray[i3] = 50;
        if (positionArray[i3 + 1] > 50) positionArray[i3 + 1] = -50;
        if (positionArray[i3 + 1] < -50) positionArray[i3 + 1] = 50;
        if (positionArray[i3 + 2] > 25) positionArray[i3 + 2] = -25;
        if (positionArray[i3 + 2] < -25) positionArray[i3 + 2] = 25;
      }

      positionAttribute.needsUpdate = true;

      // Gentle camera movement
      camera.position.x = Math.sin(time * 0.1) * 2;
      camera.position.y = Math.cos(time * 0.08) * 1;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      particles.geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [particleCount, interactive]);

  return (
    <div 
      ref={mountRef} 
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ 
        background: 'transparent',
        overflow: 'hidden'
      }}
    />
  );
};

export default ParticleSystem;