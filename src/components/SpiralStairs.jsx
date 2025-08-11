import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { gsap } from 'gsap';
import * as THREE from 'three';

export default function SpiralStairs({ onStairClick }) {
  const stairsRef = useRef([]);
  const timeRef = useRef(0);

  const stairs = useMemo(() => {
    return new Array(12).fill().map((_, i) => ({
      id: i,
      angle: i * 0.4,
      y: i * 0.3,
    }));
  }, []);

  useFrame((state, delta) => {
    timeRef.current += delta;

    stairsRef.current.forEach((mesh, i) => {
      if (!mesh) return;

      // Rotation drift
      mesh.rotation.y += 0.002;

      // Breathing wave motion
      const wave = Math.sin(timeRef.current * 1.5 + i * 0.5) * 0.15;
      mesh.position.y = stairs[i].y + wave;

      // Pulsing glow (emissive intensity)
      const pulse = (Math.sin(timeRef.current * 2 + i) + 1) / 2;
      mesh.material.emissive = new THREE.Color(`hsl(${180 + pulse * 60}, 100%, 60%)`);
    });
  });

  const handleClick = (id, mesh) => {
    gsap.to(mesh.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.5, yoyo: true, repeat: 1 });
    onStairClick(id);
  };

  return (
    <>
      {stairs.map((stair, i) => (
        <mesh
          key={stair.id}
          ref={(el) => (stairsRef.current[i] = el)}
          position={[
            Math.cos(stair.angle) * 4,
            stair.y,
            Math.sin(stair.angle) * 4,
          ]}
          rotation={[0, stair.angle, 0]}
          onClick={() => handleClick(stair.id, stairsRef.current[i])}
        >
          <boxGeometry args={[1, 0.2, 2]} />
          <meshStandardMaterial
            color={'#00ffff'}
            emissive={'#00ffff'}
            emissiveIntensity={0.5}
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
      ))}
    </>
  );
}
