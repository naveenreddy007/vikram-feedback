import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface ThreeBackgroundProps {
  className?: string;
}

const ThreeBackground: React.FC<ThreeBackgroundProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const animationIdRef = useRef<number>();

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Geometric shapes array
    const shapes: THREE.Mesh[] = [];

    // Create floating geometric shapes
    const createGeometricShapes = () => {
      const geometries = [
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        new THREE.SphereGeometry(0.3, 16, 16),
        new THREE.ConeGeometry(0.3, 0.8, 8),
        new THREE.OctahedronGeometry(0.4),
        new THREE.TetrahedronGeometry(0.4),
      ];

      const materials = [
        new THREE.MeshBasicMaterial({ 
          color: 0x00d4ff, 
          wireframe: true, 
          transparent: true, 
          opacity: 0.6 
        }),
        new THREE.MeshBasicMaterial({ 
          color: 0x39ff14, 
          wireframe: true, 
          transparent: true, 
          opacity: 0.4 
        }),
        new THREE.MeshBasicMaterial({ 
          color: 0xff6b35, 
          wireframe: true, 
          transparent: true, 
          opacity: 0.5 
        }),
      ];

      // Create 15 random shapes
      for (let i = 0; i < 15; i++) {
        const geometry = geometries[Math.floor(Math.random() * geometries.length)];
        const material = materials[Math.floor(Math.random() * materials.length)];
        const mesh = new THREE.Mesh(geometry, material);

        // Random positioning
        mesh.position.x = (Math.random() - 0.5) * 20;
        mesh.position.y = (Math.random() - 0.5) * 20;
        mesh.position.z = (Math.random() - 0.5) * 10;

        // Random rotation
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;

        // Store initial position for floating animation
        (mesh as any).initialY = mesh.position.y;
        (mesh as any).floatSpeed = 0.5 + Math.random() * 1.5;
        (mesh as any).floatRange = 1 + Math.random() * 2;

        shapes.push(mesh);
        scene.add(mesh);
      }
    };

    // Create mathematical equations as text sprites
    const createMathEquations = () => {
      const equations = [
        'E = mc²',
        'F = ma',
        'V = IR',
        'P = VI',
        '∫ f(x)dx',
        'Σ(x²)',
        'π = 3.14159',
        'e^(iπ) + 1 = 0',
        '∇ × B = μ₀J',
        'ΔH = ΔU + PΔV'
      ];

      equations.forEach((equation, index) => {
        // Create canvas for text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.width = 256;
        canvas.height = 64;

        // Style the text
        context.fillStyle = 'rgba(0, 212, 255, 0.8)';
        context.font = '24px "Orbitron", monospace';
        context.textAlign = 'center';
        context.fillText(equation, 128, 40);

        // Create texture and material
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ 
          map: texture, 
          transparent: true,
          opacity: 0.7
        });
        const sprite = new THREE.Sprite(material);

        // Position randomly
        sprite.position.x = (Math.random() - 0.5) * 25;
        sprite.position.y = (Math.random() - 0.5) * 25;
        sprite.position.z = (Math.random() - 0.5) * 15;
        sprite.scale.set(2, 0.5, 1);

        // Store animation properties
        (sprite as any).initialY = sprite.position.y;
        (sprite as any).floatSpeed = 0.3 + Math.random() * 0.8;
        (sprite as any).floatRange = 0.5 + Math.random() * 1;

        shapes.push(sprite as any);
        scene.add(sprite);
      });
    };

    // Create particle system
    const createParticles = () => {
      const particleCount = 100;
      const particles = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 50;     // x
        positions[i + 1] = (Math.random() - 0.5) * 50; // y
        positions[i + 2] = (Math.random() - 0.5) * 30; // z
      }

      particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const particleMaterial = new THREE.PointsMaterial({
        color: 0x00d4ff,
        size: 0.1,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      });

      const particleSystem = new THREE.Points(particles, particleMaterial);
      scene.add(particleSystem);
      shapes.push(particleSystem as any);
    };

    // Initialize all elements
    createGeometricShapes();
    createMathEquations();
    createParticles();

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      // Animate shapes
      shapes.forEach((shape, index) => {
        if (shape instanceof THREE.Points) {
          // Rotate particle system
          shape.rotation.y += 0.002;
          shape.rotation.x += 0.001;
        } else {
          // Rotate geometric shapes
          shape.rotation.x += 0.005 + index * 0.001;
          shape.rotation.y += 0.003 + index * 0.0005;

          // Floating animation
          if ((shape as any).initialY !== undefined) {
            shape.position.y = (shape as any).initialY + 
              Math.sin(time * (shape as any).floatSpeed) * (shape as any).floatRange;
          }

          // Gentle drift
          shape.position.x += Math.sin(time * 0.5 + index) * 0.002;
        }
      });

      // Camera gentle movement
      camera.position.x = Math.sin(time * 0.2) * 0.5;
      camera.position.y = Math.cos(time * 0.15) * 0.3;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!camera || !renderer) return;
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose of Three.js objects
      shapes.forEach(shape => {
        if (shape.geometry) shape.geometry.dispose();
        if (shape.material) {
          if (Array.isArray(shape.material)) {
            shape.material.forEach(mat => mat.dispose());
          } else {
            shape.material.dispose();
          }
        }
      });
      
      renderer.dispose();
    };
  }, []);

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

export default ThreeBackground;