import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Quaternion, Euler, Group } from 'three';
import { useGameStore } from '../store';
import { GameStatus } from '../types';
import { GRAVITY_CONSTANT, MAX_POWER, POWER_CHARGE_RATE, LEVELS, SHIP_RADIUS, TARGET_RADIUS } from '../constants';

const TEMP_VEC3 = new Vector3();
const TEMP_DIR = new Vector3();

export const Spaceship = () => {
  const { currentLevelIndex, status, setStatus, power, setPower, lastAttempt, setLastAttempt } = useGameStore();
  const level = LEVELS[currentLevelIndex];

  const shipRef = useRef<Group>(null);
  
  // Physics State
  const position = useRef(new Vector3(...level.shipStart));
  const velocity = useRef(new Vector3(0, 0, 0));
  
  // Aiming State (Euler angles in radians)
  const aimYaw = useRef(0);
  const aimPitch = useRef(0);
  
  // Input State
  const keys = useRef<{ [key: string]: boolean }>({});

  // Helper to point ship at target initially
  const lookAtTarget = () => {
    const start = new Vector3(...level.shipStart);
    const target = new Vector3(...level.targetPosition);
    const dir = target.sub(start).normalize();
    
    // Calculate Yaw (Rotation around Y)
    // atan2(x, z) gives angle from +Z axis.
    aimYaw.current = Math.atan2(dir.x, dir.z);
    
    // Calculate Pitch (Rotation around X)
    // We use -dir.y because positive Pitch (Rot X) points nose down (Z -> -Y) in our +Z forward setup
    const xzLen = Math.sqrt(dir.x * dir.x + dir.z * dir.z);
    aimPitch.current = Math.atan2(-dir.y, xzLen);
  };

  useEffect(() => {
    // Reset ship when level or status changes to IDLE
    if (status === GameStatus.IDLE) {
      position.current.set(...level.shipStart);
      velocity.current.set(0, 0, 0);
      
      if (lastAttempt) {
        aimYaw.current = lastAttempt.yaw;
        aimPitch.current = lastAttempt.pitch;
      } else {
        lookAtTarget();
      }
      
      if (shipRef.current) {
        shipRef.current.position.copy(position.current);
        shipRef.current.rotation.set(aimPitch.current, aimYaw.current, 0, 'YXZ');
      }
    }
  }, [status, currentLevelIndex, level, lastAttempt]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      
      if (e.code === 'Space' && status === GameStatus.IDLE) {
        setStatus(GameStatus.CHARGING);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;

      if (e.code === 'Space' && status === GameStatus.CHARGING) {
        // LAUNCH!
        setStatus(GameStatus.FLYING);
        
        // Save attempt
        setLastAttempt(power, aimPitch.current, aimYaw.current);

        // Calculate launch vector based on current rotation
        const rotation = new Euler(aimPitch.current, aimYaw.current, 0, 'YXZ');
        // Ship is visually aligned to +Z. Launch along +Z.
        const direction = new Vector3(0, 0, 1).applyEuler(rotation);
        
        // Apply velocity magnitude based on accumulated power
        velocity.current.copy(direction.multiplyScalar(Math.max(power, 1))); // Minimum power 1 to move
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [status, power, setStatus, setLastAttempt]);

  useFrame((state, delta) => {
    if (!shipRef.current) return;

    // --- AIMING LOGIC (Only when Idle or Charging) ---
    if (status === GameStatus.IDLE || status === GameStatus.CHARGING) {
      const rotSpeed = 2.0 * delta;
      
      // Pitch (W/S)
      if (keys.current['KeyW']) aimPitch.current += rotSpeed;
      if (keys.current['KeyS']) aimPitch.current -= rotSpeed;
      
      // Yaw (A/D)
      if (keys.current['KeyA']) aimYaw.current += rotSpeed;
      if (keys.current['KeyD']) aimYaw.current -= rotSpeed;

      // Clamp Pitch to avoid gimbal lock/weirdness
      aimPitch.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, aimPitch.current));

      shipRef.current.rotation.set(aimPitch.current, aimYaw.current, 0, 'YXZ');
      shipRef.current.position.copy(position.current);
    }

    // --- CHARGING LOGIC ---
    if (status === GameStatus.CHARGING) {
      const newPower = Math.min(power + (POWER_CHARGE_RATE * delta), MAX_POWER);
      setPower(newPower);
    }

    // --- PHYSICS & MOVEMENT (When Flying) ---
    if (status === GameStatus.FLYING) {
      
      // 1. Calculate and Apply Forces (Gravity)
      // We do this BEFORE updating position for Semi-Implicit Euler integration, 
      // which is more stable for orbits than Standard Euler.
      level.planets.forEach(planet => {
        const pPos = new Vector3(...planet.position);
        const distSq = pPos.distanceToSquared(position.current);
        const dist = Math.sqrt(distSq);
        
        if (dist > planet.radius + SHIP_RADIUS) { 
           const forceMagnitude = (GRAVITY_CONSTANT * planet.mass) / distSq;
           TEMP_DIR.copy(pPos).sub(position.current).normalize();
           // v = v + a * dt
           velocity.current.add(TEMP_DIR.multiplyScalar(forceMagnitude * delta));
        } else {
            // Collision with Planet
            setStatus(GameStatus.LOST);
        }
      });

      // 2. Apply Velocity to Position
      // p = p + v * dt
      const moveStep = velocity.current.clone().multiplyScalar(delta);
      position.current.add(moveStep);
      
      // 3. Update Visuals
      shipRef.current.position.copy(position.current);
      
      // Rotate ship to face velocity vector
      if (velocity.current.lengthSq() > 0.1) {
          const target = position.current.clone().add(velocity.current);
          shipRef.current.lookAt(target);
      }
      
      // 4. Check Win Condition
      const targetPos = new Vector3(...level.targetPosition);
      if (position.current.distanceTo(targetPos) < (TARGET_RADIUS + SHIP_RADIUS)) {
          setStatus(GameStatus.WON);
      }
      
      // 5. Check Lost Condition (Too far away)
      if (position.current.length() > 100) {
          setStatus(GameStatus.LOST);
      }
    }
  });

  return (
    <group>
      {/* Ship Container Group */}
      <group ref={shipRef}>
        {/* Visual Ship Model */}
        {/* Cone Geometry points to +Y by default. 
            Rotate X by 90deg (PI/2) to point it towards +Z.
            This matches our launch vector of (0,0,1). */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.5, 2, 8]} />
          <meshStandardMaterial color={status === GameStatus.LOST ? "red" : "#2ecc71"} />
        </mesh>
        
        {/* Engine Glow */}
        {status === GameStatus.FLYING && (
          <pointLight position={[0, 0, -1]} distance={3} color="#00ff00" intensity={2} />
        )}

        <axesHelper args={[2]} scale={[1, 1, 3]} /> 
      </group>
      
      {/* Trajectory Guide (Only when aiming) */}
      {(status === GameStatus.CHARGING) && (
         <group 
            position={new Vector3(...level.shipStart)} 
            rotation={[aimPitch.current, aimYaw.current, 0, 'YXZ']}
         >
             {/* Guide Line sticking out along +Z */}
             <mesh position={[0, 0, power / 2]}>
                <boxGeometry args={[0.05, 0.05, power]} />
                <meshBasicMaterial color="rgba(100, 255, 100, 0.5)" transparent opacity={0.6} />
             </mesh>
         </group>
      )}

      {/* Last Attempt Ghost Marker (Only when Aiming) */}
      {(status === GameStatus.IDLE || status === GameStatus.CHARGING) && lastAttempt && (
          <group 
            position={new Vector3(...level.shipStart)} 
            rotation={[lastAttempt.pitch, lastAttempt.yaw, 0, 'YXZ']}
         >
             {/* Ghost Line */}
             <mesh position={[0, 0, lastAttempt.power / 2]}>
                <boxGeometry args={[0.02, 0.02, lastAttempt.power]} />
                <meshBasicMaterial color="rgba(255, 100, 100, 0.3)" transparent opacity={0.4} />
             </mesh>
         </group>
      )}
    </group>
  );
};