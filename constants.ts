import { LevelConfig } from './types';

export const GRAVITY_CONSTANT = 20;
export const MAX_POWER = 25;
export const POWER_CHARGE_RATE = 20; // Units per second
export const SHIP_RADIUS = 0.5;
export const TARGET_RADIUS = 1.5;

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: "The First Slingshot",
    shipStart: [0, 0, 15],
    targetPosition: [0, 0, -15],
    planets: [
      { position: [0, 0, 0], radius: 4, mass: 50, color: "#4f86f7" }
    ],
    cameraStart: [20, 10, 20]
  },
  {
    id: 2,
    name: "Binary Gravity",
    shipStart: [-15, 0, 15],
    targetPosition: [15, 0, -15],
    planets: [
      { position: [-5, 0, 0], radius: 3, mass: 40, color: "#e056fd" },
      { position: [5, 5, -5], radius: 2.5, mass: 30, color: "#ff7979" }
    ],
    cameraStart: [0, 30, 0]
  },
  {
    id: 3,
    name: "Asteroid Field",
    shipStart: [0, 15, 0],
    targetPosition: [0, -15, 0],
    planets: [
      { position: [0, 0, 0], radius: 3, mass: 80, color: "#f9ca24" },
      { position: [8, 0, 8], radius: 1.5, mass: 20, color: "#badc58" },
      { position: [-8, 0, -8], radius: 1.5, mass: 20, color: "#badc58" },
      { position: [8, 0, -8], radius: 1.5, mass: 20, color: "#badc58" },
      { position: [-8, 0, 8], radius: 1.5, mass: 20, color: "#badc58" },
    ],
    cameraStart: [30, 0, 0]
  }
];