import { LevelConfig, PlanetConfig } from './types';

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomColor(): string {
  const colors = ['#4f86f7', '#e056fd', '#ff7979', '#f9ca24', '#badc58', '#6ab04c', '#e056fd', '#686de0'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function distanceBetween(p1: [number, number, number], p2: [number, number, number]): number {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  const dz = p1[2] - p2[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

const MIN_PLANET_DISTANCE_BUFFER = 2; // Extra buffer beyond radii sum

export function generateRandomLevel(id: number, minPlanets: number, maxPlanets: number, maxTargetDistance: number = 80): LevelConfig {
  // Ship and target positions
  const shipStart: [number, number, number] = [0, 0, 0];
  const shipToTargetDistance = randomInRange(30, maxTargetDistance);
  const targetPosition: [number, number, number] = [0, 0, -shipToTargetDistance];

  // Define the full play area range (extend beyond ship and target)
  const zMin = -shipToTargetDistance - 20; // Extend beyond target
  const zMax = 20; // Extend behind ship
  const xyRange = shipToTargetDistance * 0.4; // Horizontal range scales with distance

  // Generate 1-maxPlanets planets distributed across the full range
  const numPlanets = Math.floor(randomInRange(minPlanets, maxPlanets + 1));
  const planets: PlanetConfig[] = [];
  const maxAttempts = 100; // Prevent infinite loops

  for (let i = 0; i < numPlanets; i++) {
    let attempts = 0;
    let validPosition = false;
    let newPosition: [number, number, number] = [0, 0, 0];
    const planetRadius = randomInRange(0.5, 5);

    while (!validPosition && attempts < maxAttempts) {
      attempts++;

      // Distribute planets along the Z axis (ship to target path)
      const zProgress = Math.random(); // 0 = ship area, 1 = target area
      const zPos = zMin + (zMax - zMin) * zProgress;

      // Perpendicular offset from the center line
      const perpDistance = randomInRange(2, xyRange);
      const angle = randomInRange(0, Math.PI * 2);

      newPosition = [
        Math.cos(angle) * perpDistance,
        randomInRange(-5, 5), // Vertical variation
        zPos
      ];

      // Check minimum distance from spaceship (ship has small radius, use buffer)
      const shipRadius = 0.5;
      const distToShip = distanceBetween(newPosition, shipStart);
      if (distToShip < planetRadius + shipRadius + MIN_PLANET_DISTANCE_BUFFER) {
        continue;
      }

      // Check minimum distance from target
      const targetRadius = 1.5;
      const distToTarget = distanceBetween(newPosition, targetPosition);
      if (distToTarget < planetRadius + targetRadius + MIN_PLANET_DISTANCE_BUFFER) {
        continue;
      }

      // Check minimum distance from existing planets (accounting for both radii)
      validPosition = true;
      for (const existing of planets) {
        const minDist = planetRadius + existing.radius + MIN_PLANET_DISTANCE_BUFFER;
        if (distanceBetween(newPosition, existing.position) < minDist) {
          validPosition = false;
          break;
        }
      }
    }

    if (validPosition) {
      planets.push({
        position: newPosition,
        radius: planetRadius,
        mass: planetRadius * 10,
        color: randomColor()
      });
    }
  }

  // Camera position
  const cameraStart: [number, number, number] = [20, 10, 20];

  return {
    id,
    name: `Generated Level ${id}`,
    shipStart,
    targetPosition,
    planets,
    cameraStart
  };
}
