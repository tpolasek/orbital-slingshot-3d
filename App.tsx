import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { UI } from './components/UI';
import { Planet, Target, StarField } from './components/GameObjects';
import { Spaceship } from './components/Spaceship';
import { useGameStore } from './store';
import { LEVELS } from './constants';

function GameScene() {
  const { currentLevelIndex } = useGameStore();
  const level = LEVELS[currentLevelIndex];

  return (
    <>
      <color attach="background" args={['#050510']} />
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      <StarField />
      
      <Spaceship />
      
      {level.planets.map((planet, idx) => (
        <Planet key={idx} config={planet} />
      ))}
      
      <Target position={level.targetPosition} />
      
      <OrbitControls 
        makeDefault 
        minDistance={5} 
        maxDistance={150}
      />
    </>
  );
}

export default function App() {
  return (
    <div className="relative w-full h-screen bg-black">
      <Canvas 
        camera={{ position: [20, 20, 20], fov: 60 }}
        shadows
        dpr={[1, 2]} // Optimize pixel ratio for performance
      >
        <Suspense fallback={null}>
          <GameScene />
        </Suspense>
      </Canvas>
      <UI />
    </div>
  );
}