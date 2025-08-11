import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import SpiralStairs from './SpiralStairs';
import { gsap } from 'gsap';

export default function InceptionScene({ onStairClick }) {
  const groupRef = useRef();
  const starsRef = useRef();
  const [isWarping, setIsWarping] = useState(false);
  const cameraRef = useRef();

  useEffect(() => {
    // Landing intro animation
    if (cameraRef.current && groupRef.current) {
      cameraRef.current.position.set(0, 15, 50);
      gsap.to(cameraRef.current.position, {
        y: 2,
        z: 10,
        duration: 3,
        ease: 'power2.inOut',
        onUpdate: () => cameraRef.current.updateProjectionMatrix(),
      });
      gsap.from(groupRef.current.rotation, {
        y: Math.PI * 2,
        duration: 3,
        ease: 'power2.inOut',
      });
    }
  }, []);

  const handleStairClick = (id) => {
    bendEnvironment();
    warpStars();
    pulseFOV();
    onStairClick(id);
  };

  const bendEnvironment = () => {
    if (!groupRef.current) return;
    gsap.to(groupRef.current.rotation, {
      x: Math.PI / 3,
      duration: 1.5,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: 1,
    });
  };

  const warpStars = () => {
    if (!starsRef.current) return;
    setIsWarping(true);

    // GSAP workaround for size animation
    const target = { size: 1 };
    gsap.to(target, {
      size: 4,
      duration: 0.8,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: 1,
      onUpdate: () => {
        if (starsRef.current.material) {
          starsRef.current.material.size = target.size;
        }
      },
      onComplete: () => setIsWarping(false),
    });
  };

  const pulseFOV = () => {
    const { camera } = cameraRef.current;
    gsap.to(camera, {
      fov: 50,
      duration: 0.3,
      yoyo: true,
      repeat: 1,
      onUpdate: () => camera.updateProjectionMatrix(),
    });
  };

  return (
    <Canvas
      camera={{ position: [0, 2, 10], fov: 60 }}
      ref={cameraRef}
      gl={{ antialias: true }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />

      <Environment preset="sunset" background />

      <Stars
        ref={starsRef}
        radius={100}
        depth={50}
        count={5000}
        factor={isWarping ? 6 : 4}
        fade
      />

      <group ref={groupRef}>
        <SpiralStairs onStairClick={handleStairClick} />
      </group>

      <OrbitControls enablePan={false} enableZoom={false} />
    </Canvas>
  );
}
