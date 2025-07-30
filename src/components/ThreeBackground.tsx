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
    camera.position.set(0, 0, 8);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Storage for all objects
    const objects: THREE.Object3D[] = [];

    // Create geometric network
    const createGeometricNetwork = () => {
      // Create nodes
      const nodeGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
      const nodeMaterials = [
        new THREE.MeshBasicMaterial({ 
          color: 0x00d4ff, 
          transparent: true, 
          opacity: 0.8,
          wireframe: false
        }),
        new THREE.MeshBasicMaterial({ 
          color: 0x39ff14, 
          transparent: true, 
          opacity: 0.7,
          wireframe: false
        }),
        new THREE.MeshBasicMaterial({ 
          color: 0xff6b35, 
          transparent: true, 
          opacity: 0.6,
          wireframe: false
        }),
        new THREE.MeshBasicMaterial({ 
          color: 0x8b5cf6, 
          transparent: true, 
          opacity: 0.7,
          wireframe: false
        })
      ];

      const nodes: THREE.Mesh[] = [];
      
      // Create network nodes
      for (let i = 0; i < 12; i++) {
        const material = nodeMaterials[Math.floor(Math.random() * nodeMaterials.length)];
        const node = new THREE.Mesh(nodeGeometry, material);

        // Position nodes in a loose grid pattern
        const angle = (i / 12) * Math.PI * 2;
        const radius = 4 + Math.random() * 3;
        node.position.x = Math.cos(angle) * radius + (Math.random() - 0.5) * 2;
        node.position.y = Math.sin(angle) * radius + (Math.random() - 0.5) * 2;
        node.position.z = (Math.random() - 0.5) * 6;

        // Animation properties
        (node as any).initialPosition = node.position.clone();
        (node as any).rotationSpeed = {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.01
        };
        (node as any).floatSpeed = 0.5 + Math.random() * 1;
        (node as any).floatRange = 0.3 + Math.random() * 0.7;

        nodes.push(node);
        objects.push(node);
        scene.add(node);
      }

      // Create connections between nodes
      const lineMaterial = new THREE.LineBasicMaterial({ 
        color: 0x00d4ff, 
        transparent: true, 
        opacity: 0.3 
      });

      nodes.forEach((node, i) => {
        nodes.forEach((otherNode, j) => {
          if (i < j && node.position.distanceTo(otherNode.position) < 6) {
            const geometry = new THREE.BufferGeometry().setFromPoints([
              node.position,
              otherNode.position
            ]);
            const line = new THREE.Line(geometry, lineMaterial);
            (line as any).nodeA = node;
            (line as any).nodeB = otherNode;
            objects.push(line);
            scene.add(line);
          }
        });
      });
    };

    // Create floating code elements
    const createCodeElements = () => {
      const codeSnippets = [
        'function()',
        '{ }',
        'const x =',
        'return',
        'if (true)',
        'await',
        'async',
        '=>',
        'import',
        'export',
        'class',
        'extends',
        'useState',
        'useEffect',
        '</>',
        'API',
        'JSON',
        'HTTP'
      ];

      codeSnippets.forEach((code, index) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.width = 256;
        canvas.height = 64;

        // Style the text with better typography
        context.fillStyle = `rgba(${
          index % 3 === 0 ? '0, 212, 255' : 
          index % 3 === 1 ? '57, 255, 20' : 
          '139, 92, 246'
        }, 0.8)`;
        context.font = 'bold 20px "JetBrains Mono", "Fira Code", monospace';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(code, 128, 32);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        const material = new THREE.SpriteMaterial({ 
          map: texture, 
          transparent: true,
          opacity: 0.6,
          alphaTest: 0.001
        });
        const sprite = new THREE.Sprite(material);

        // Better positioning for visual balance
        const angle = (index / codeSnippets.length) * Math.PI * 2;
        const radius = 8 + Math.random() * 4;
        sprite.position.x = Math.cos(angle) * radius + (Math.random() - 0.5) * 3;
        sprite.position.y = Math.sin(angle) * radius + (Math.random() - 0.5) * 3;
        sprite.position.z = (Math.random() - 0.5) * 10;
        sprite.scale.set(1.5, 0.4, 1);

        // Animation properties
        (sprite as any).initialPosition = sprite.position.clone();
        (sprite as any).floatSpeed = 0.3 + Math.random() * 0.6;
        (sprite as any).floatRange = 0.4 + Math.random() * 0.8;
        (sprite as any).driftSpeed = 0.001 + Math.random() * 0.002;

        objects.push(sprite as any);
        scene.add(sprite);
      });
    };

    // Create enhanced particle system
    const createEnhancedParticles = () => {
      const particleCount = 150;
      const particles = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);

      const colorPalette = [
        new THREE.Color(0x00d4ff),
        new THREE.Color(0x39ff14),
        new THREE.Color(0xff6b35),
        new THREE.Color(0x8b5cf6),
        new THREE.Color(0xf59e0b)
      ];

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Position
        positions[i3] = (Math.random() - 0.5) * 40;
        positions[i3 + 1] = (Math.random() - 0.5) * 40;
        positions[i3 + 2] = (Math.random() - 0.5) * 20;

        // Color
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;

        // Size variation
        sizes[i] = Math.random() * 0.8 + 0.2;
      }

      particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const particleMaterial = new THREE.PointsMaterial({
        size: 0.05,
        transparent: true,
        opacity: 0.6,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
      });

      const particleSystem = new THREE.Points(particles, particleMaterial);
      objects.push(particleSystem as any);
      scene.add(particleSystem);

      // Store reference for animation
      (particleSystem as any).originalPositions = positions.slice();
    };

    // Create floating geometric wireframes
    const createWireframeShapes = () => {
      const geometries = [
        new THREE.BoxGeometry(0.8, 0.8, 0.8),
        new THREE.ConeGeometry(0.5, 1.2, 6),
        new THREE.OctahedronGeometry(0.6),
        new THREE.TetrahedronGeometry(0.7),
        new THREE.TorusGeometry(0.5, 0.2, 8, 16)
      ];

      const colors = [0x00d4ff, 0x39ff14, 0xff6b35, 0x8b5cf6, 0xf59e0b];

      for (let i = 0; i < 8; i++) {
        const geometry = geometries[Math.floor(Math.random() * geometries.length)];
        const material = new THREE.MeshBasicMaterial({
          color: colors[Math.floor(Math.random() * colors.length)],
          wireframe: true,
          transparent: true,
          opacity: 0.4
        });

        const mesh = new THREE.Mesh(geometry, material);
        
        // Position in a more organized way
        const angle = (i / 8) * Math.PI * 2;
        const radius = 6 + Math.random() * 2;
        mesh.position.x = Math.cos(angle) * radius;
        mesh.position.y = Math.sin(angle) * radius;
        mesh.position.z = (Math.random() - 0.5) * 8;

        // Animation properties
        (mesh as any).initialPosition = mesh.position.clone();
        (mesh as any).rotationSpeed = {
          x: (Math.random() - 0.5) * 0.01,
          y: (Math.random() - 0.5) * 0.01,
          z: (Math.random() - 0.5) * 0.008
        };
        (mesh as any).floatSpeed = 0.4 + Math.random() * 0.8;
        (mesh as any).floatRange = 0.5 + Math.random() * 1;

        objects.push(mesh);
        scene.add(mesh);
      }
    };

    // Initialize all elements
    createGeometricNetwork();
    createCodeElements();
    createEnhancedParticles();
    createWireframeShapes();

    // Smooth animation loop
    let time = 0;
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      time += 0.016; // ~60fps

      // Animate objects
      objects.forEach((obj, index) => {
        if (obj instanceof THREE.Points) {
          // Animate particle system
          obj.rotation.y += 0.001;
          obj.rotation.x += 0.0005;
          
          const positions = obj.geometry.attributes.position.array as Float32Array;
          const originalPositions = (obj as any).originalPositions;
          
          for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] = originalPositions[i + 1] + Math.sin(time * 0.5 + i * 0.01) * 0.2;
          }
          obj.geometry.attributes.position.needsUpdate = true;
          
        } else if (obj instanceof THREE.Line) {
          // Update line connections
          const nodeA = (obj as any).nodeA;
          const nodeB = (obj as any).nodeB;
          if (nodeA && nodeB) {
            const geometry = obj.geometry as THREE.BufferGeometry;
            const positions = geometry.attributes.position.array as Float32Array;
            positions[0] = nodeA.position.x;
            positions[1] = nodeA.position.y;
            positions[2] = nodeA.position.z;
            positions[3] = nodeB.position.x;
            positions[4] = nodeB.position.y;
            positions[5] = nodeB.position.z;
            geometry.attributes.position.needsUpdate = true;
          }
          
        } else if (obj instanceof THREE.Sprite) {
          // Animate code sprites
          const initialPos = (obj as any).initialPosition;
          const floatSpeed = (obj as any).floatSpeed;
          const floatRange = (obj as any).floatRange;
          const driftSpeed = (obj as any).driftSpeed;
          
          if (initialPos) {
            obj.position.y = initialPos.y + Math.sin(time * floatSpeed) * floatRange;
            obj.position.x = initialPos.x + Math.sin(time * driftSpeed) * 0.5;
          }
          
          // Subtle scale animation
          obj.scale.setScalar(1.5 + Math.sin(time * 2 + index) * 0.1);
          
        } else if (obj instanceof THREE.Mesh) {
          // Animate geometric shapes
          const rotSpeed = (obj as any).rotationSpeed;
          const initialPos = (obj as any).initialPosition;
          const floatSpeed = (obj as any).floatSpeed;
          const floatRange = (obj as any).floatRange;
          
          if (rotSpeed) {
            obj.rotation.x += rotSpeed.x;
            obj.rotation.y += rotSpeed.y;
            obj.rotation.z += rotSpeed.z;
          }
          
          if (initialPos && floatSpeed) {
            obj.position.y = initialPos.y + Math.sin(time * floatSpeed) * floatRange;
            obj.position.x = initialPos.x + Math.cos(time * floatSpeed * 0.5) * 0.3;
          }
        }
      });

      // Smooth camera movement
      camera.position.x = Math.sin(time * 0.1) * 0.8;
      camera.position.y = Math.cos(time * 0.08) * 0.5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Optimized resize handler
    const handleResize = () => {
      if (!camera || !renderer) return;
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Proper disposal of Three.js objects
      objects.forEach(obj => {
        if (obj instanceof THREE.Mesh) {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach(mat => mat.dispose());
            } else {
              obj.material.dispose();
            }
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