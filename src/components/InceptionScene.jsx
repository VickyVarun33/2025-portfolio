// InceptionScene.jsx
import React, { useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import SpiralStairs from './SpiralStairs';
import * as THREE from 'three';
import { gsap } from 'gsap';

// Ensure GSAP plugins are registered
gsap.registerPlugin();

function CinematicScene({ onStairClick }) {
  const groupRef = useRef();
  const starsRef = useRef();
  const planetRef = useRef();
  const [isWarping, setIsWarping] = useState(false);
  const { camera } = useThree();

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
    gsap.to(starsRef.current.material, {
      size: 4,
      duration: 0.8,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: 1,
      onComplete: () => setIsWarping(false),
    });
  };

  const pulseFOV = () => {
    gsap.to(camera, {
      fov: 50,
      duration: 0.3,
      yoyo: true,
      repeat: 1,
      onUpdate: () => camera.updateProjectionMatrix(),
    });
  };

  return (
    <>
      {/* Space Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />

      {/* Cinematic Stars */}
      <Stars
        ref={starsRef}
        radius={300}
        depth={100}
        count={8000}
        factor={isWarping ? 6 : 4}
        fade
        speed={1}
      />

      {/* Interstellar-Style Planet */}
      <mesh ref={planetRef} position={[-8, 2, -20]}>
        <sphereGeometry args={[5, 64, 64]} />
        <meshStandardMaterial
          map={new THREE.TextureLoader().load('/textures/planet_diffuse.jpg')}
          normalMap={new THREE.TextureLoader().load('/textures/planet_normal.jpg')}
          emissiveMap={new THREE.TextureLoader().load('/textures/planet_emissive.jpg')}
          emissive={new THREE.Color(0x222244)}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Spiral Stairs */}
      <group ref={groupRef} position={[0, -1, 0]}>
        <SpiralStairs onStairClick={handleStairClick} />
      </group>

      {/* Camera Controls */}
      <OrbitControls enablePan={false} enableZoom={false} />
    </>
  );
}

export default function InceptionScene({ onStairClick }) {
  return (
    <Canvas camera={{ position: [0, 2, 10], fov: 60 }}>
      <CinematicScene onStairClick={onStairClick} />
    </Canvas>
  );
}
