import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import SpiralStairs from './SpiralStairs';
import { gsap } from 'gsap';

export default function InceptionScene({ onStairClick }) {
  const groupRef = useRef();
  const starsRef = useRef();
  const [isWarping, setIsWarping] = useState(false);

  const handleStairClick = (id) => {
    bendEnvironment();
    warpStars();
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
    gsap.to(starsRef.current.material, {
      size: 4,
      duration: 0.8,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: 1,
      onComplete: () => setIsWarping(false),
    });
  };

  return (
    <Canvas camera={{ position: [0, 2, 10], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />

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
