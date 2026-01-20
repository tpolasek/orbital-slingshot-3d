import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { PlanetConfig, Vector3Array } from '../types';
import { TARGET_RADIUS } from '../constants';
import { Stars } from '@react-three/drei';

export const StarField = () => {
  return (
    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
  );
};

export const Planet: React.FC<{ config: PlanetConfig }> = ({ config }) => {
  return (
    <mesh position={config.position}>
      <sphereGeometry args={[config.radius, 32, 32]} />
      <meshStandardMaterial 
        color={config.color} 
        roughness={0.7}
        emissive={config.color}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
};

export const Target: React.FC<{ position: Vector3Array }> = ({ position }) => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group position={position}>
      {/* Outer Rings */}
      <mesh ref={meshRef}>
        <torusGeometry args={[TARGET_RADIUS, 0.2, 16, 100]} />
        <meshStandardMaterial color="#a55eea" emissive="#a55eea" emissiveIntensity={2} />
      </mesh>
      
      {/* Inner Core */}
      <mesh>
        <sphereGeometry args={[TARGET_RADIUS * 0.4, 32, 32]} />
        <meshStandardMaterial color="#d1d8e0" emissive="#ffffff" emissiveIntensity={1} />
      </mesh>
      
      {/* Glow Effect (Simulated with Point Light) */}
      <pointLight distance={10} intensity={2} color="#a55eea" />
    </group>
  );
};