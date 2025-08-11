import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, Sphere } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, ChromaticAberration } from '@react-three/postprocessing';
import { gsap } from 'gsap';
import SpiralStairs from './SpiralStairs';

export default function InceptionScene({ onStairClick }) {
  const groupRef = useRef();
  const starsRefNear = useRef();
  const starsRefFar = useRef();
  const cameraRef = useRef();
  const [isWarping, setIsWarping] = useState(false);

  useEffect(() => {
    // Landing cinematic animation
    if (cameraRef.current && groupRef.current) {
      cameraRef.current.position.set(0, 25, 80);
      gsap.to(cameraRef.current.position, {
        y: 2,
        z: 10,
        duration: 3.5,
        ease: 'power2.inOut',
        onUpdate: () => cameraRef.current.updateProjectionMatrix(),
      });
      gsap.from(groupRef.current.rotation, {
        y: Math.PI * 2,
        duration: 3.5,
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
    const target = { size: 1 };
    setIsWarping(true);
    gsap.to(target, {
      size: 4,
      duration: 0.8,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: 1,
      onUpdate: () => {
        if (starsRefNear.current?.material) starsRefNear.current.material.size = target.size;
        if (starsRefFar.current?.material) starsRefFar.current.material.size = target.size * 0.5;
      },
      onComplete: () => setIsWarping(false),
    });
  };

  const pulseFOV = () => {
    const cam = cameraRef.current;
    gsap.to(cam, {
      fov: 50,
      duration: 0.3,
      yoyo: true,
      repeat: 1,
      onUpdate: () => cam.updateProjectionMatrix(),
    });
  };

  return (
    <Canvas camera={{ position: [0, 2, 10], fov: 60 }} ref={cameraRef}>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} />

      {/* Space environment */}
      <Environment preset="night" background />

      {/* Cinematic planet */}
      <Sphere args={[30, 64, 64]} position={[0, -50, -150]}>
        <meshStandardMaterial
          color="#223355"
          emissive="#112244"
          emissiveIntensity={0.5}
          roughness={1}
          metalness={0.2}
        />
      </Sphere>

      {/* Parallax star layers */}
      <Stars ref={starsRefFar} radius={200} depth={100} count={3000} factor={2} fade />
      <Stars ref={starsRefNear} radius={100} depth={50} count={2000} factor={4} fade />

      {/* Main spiral */}
      <group ref={groupRef}>
        <SpiralStairs onStairClick={handleStairClick} />
      </group>

      {/* Camera controls */}
      <OrbitControls enablePan={false} enableZoom={false} />

      {/* Postprocessing effects */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.5} />
        <DepthOfField focusDistance={0.02} focalLength={0.02} bokehScale={3} height={480} />
        <ChromaticAberration offset={[0.001, 0.001]} />
      </EffectComposer>
    </Canvas>
  );
}
