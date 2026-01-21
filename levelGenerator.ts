import { LevelConfig, PlanetConfig } from './types';

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomColor(): string {
  const colors = ['#4f86f7', '#e056fd', '#ff7979', '#f9ca24', '#badc58', '#6ab04c', '#e056fd', '#686de0'];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function generateRandomLevel(id: number, maxPlanets: number): LevelConfig {
  // Ship and target positions
  const shipStart: [number, number, number] = [0, 0, 0];
  const shipToTargetDistance = randomInRange(30, 60);
  const targetPosition: [number, number, number] = [0, 0, -shipToTargetDistance];

  // Calculate midpoint to place planets near the ship's path
  const midX = (shipStart[0] + targetPosition[0]) / 2;
  const midZ = (shipStart[2] + targetPosition[2]) / 2;

  // Generate 1-maxPlanets planets near the ship's path
  const numPlanets = Math.floor(randomInRange(1, maxPlanets + 1));
  const planets: PlanetConfig[] = [];

  for (let i = 0; i < numPlanets; i++) {
    const angle = (i / numPlanets) * Math.PI * 2;
    const distance = randomInRange(3, 20);
    const position: [number, number, number] = [
      midX + Math.cos(angle) * distance + randomInRange(-3, 3),
      randomInRange(-3, 3),
      midZ + Math.sin(angle) * distance + randomInRange(-3, 3)
    ];

    const planet_radius = randomInRange(1.5, 7);
    planets.push({
      position,
      radius: planet_radius,
      mass: planet_radius * 15,
      color: randomColor()
    });
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
