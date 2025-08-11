import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, extend, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import SpiralStairs from "./SpiralStairs";
import { gsap } from "gsap";
import * as THREE from "three";

// Gravity lensing shader
class GravityLensingMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        mouse: { value: new THREE.Vector2(0.5, 0.5) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        uniform vec2 mouse;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv;
          vec2 dir = uv - mouse;
          float dist = length(dir);
          float lens = 0.03 / (dist + 0.01);
          uv += normalize(dir) * lens * sin(time * 2.0) * 0.5;
          gl_FragColor = vec4(uv, 0.5 + 0.5*sin(time), 1.0);
        }
      `
    });
  }
}

extend({ GravityLensingMaterial });

function SceneContent({ onStairClick }) {
  const groupRef = useRef();
  const starsRef = useRef();
  const rippleRef = useRef();
  const mousePos = useRef({ x: 0.5, y: 0.5 });
  const { camera } = useThree();

  const [isWarping, setIsWarping] = useState(false);
  const [time, setTime] = useState(0);

  // Track mouse position for effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current.x = e.clientX / window.innerWidth;
      mousePos.current.y = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Animate shader time
  useFrame((_, delta) => {
    setTime((t) => t + delta);
    if (rippleRef.current) {
      rippleRef.current.material.uniforms.time.value = time;
      rippleRef.current.material.uniforms.mouse.value.set(mousePos.current.x, mousePos.current.y);
    }
  });

  const handleStairClick = (id) => {
    bendEnvironment();
    warpStars();
    triggerRipple();
    triggerCameraShake();
    onStairClick(id);
  };

  const bendEnvironment = () => {
    if (!groupRef.current) return;
    gsap.to(groupRef.current.rotation, {
      x: Math.PI / 3,
      duration: 1.5,
      ease: "power2.inOut",
      yoyo: true,
      repeat: 1
    });
  };

  const warpStars = () => {
    if (!starsRef.current) return;
    setIsWarping(true);
    gsap.to(starsRef.current.material, {
      size: 4,
      duration: 0.8,
      ease: "power2.inOut",
      yoyo: true,
      repeat: 1,
      onComplete: () => setIsWarping(false)
    });
  };

  const triggerRipple = () => {
    if (!rippleRef.current) return;
    gsap.fromTo(
      rippleRef.current.scale,
      { x: 0, y: 0, z: 0 },
      { x: 5, y: 5, z: 5, duration: 0.8, ease: "power2.out" }
    );
  };

  const triggerCameraShake = () => {
    const { x, y } = mousePos.current;

    // Convert normalized mouse coords (0–1) into direction offsets (-1 to 1)
    const dirX = (x - 0.5) * 2;
    const dirY = (y - 0.5) * 2;

    const strength = 0.3;
    const rollStrength = 0.15; // ~8.6 degrees

    const offsetX = -dirX * strength;
    const offsetY = dirY * strength;
    const roll = -dirX * rollStrength;

    const tl = gsap.timeline();

    tl.to(camera.position, {
      x: camera.position.x + offsetX,
      y: camera.position.y + offsetY,
      duration: 0.08,
      ease: "power2.inOut"
    }, 0)
      .to(camera.rotation, {
        z: camera.rotation.z + roll,
        duration: 0.08,
        ease: "power2.inOut"
      }, 0)
      .to(camera.position, {
        x: camera.position.x - offsetX * 0.6,
        y: camera.position.y - offsetY * 0.6,
        duration: 0.12,
        ease: "power2.inOut"
      })
      .to(camera.rotation, {
        z: camera.rotation.z - roll * 0.6,
        duration: 0.12,
        ease: "power2.inOut"
      }, "<")
      .to(camera.position, {
        x: camera.position.x,
        y: camera.position.y,
        duration: 0.08,
        ease: "power2.inOut"
      })
      .to(camera.rotation, {
        z: camera.rotation.z,
        duration: 0.08,
        ease: "power2.inOut"
      }, "<");
  };

  return (
    <>
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

      {/* Spiral stairs */}
      <group ref={groupRef}>
        <SpiralStairs onStairClick={handleStairClick} />
      </group>

      {/* Ripple plane with gravity lensing shader */}
      <mesh ref={rippleRef} position={[0, 0, -5]}>
        <planeGeometry args={[10, 10]} />
        <gravityLensingMaterial time={time} mouse={[0.5, 0.5]} />
      </mesh>

      <OrbitControls enablePan={false} enableZoom={false} />
    </>
  );
}

export default function InceptionScene({ onStairClick }) {
  return (
    <Canvas camera={{ position: [0, 2, 10], fov: 60 }}>
      <SceneContent onStairClick={onStairClick} />
    </Canvas>
  );
}
