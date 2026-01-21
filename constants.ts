import { LevelConfig } from './types';

export const GRAVITY_CONSTANT = 20;
export const MAX_POWER = 25;
export const POWER_CHARGE_RATE = 20; // Units per second
export const SHIP_RADIUS = 0.5;
export const TARGET_RADIUS = 1.5;

/*
✓ Attempt 20: Found match! Success rate: 8.612%
  Planets: 2
  Ship: [-4.5, -3.4, 12.3]
  Target: [4.4, 0.7, -11.3]
  Planets config:
    P1: pos=[8.4, -1.0, 1.2], r=2.1, m=55.7
    P2: pos=[-7.1, -1.6, -1.2], r=1.9, m=62.8
*/
export const LEVELS: LevelConfig[] = [
  
  {
    id: 1,
    name: "The Easy One",
    shipStart: [-4.5, -3.4, 12.3],
    targetPosition: [4.4, 0.7, -11.3],
    planets: [
      { position: [8.4, -1.0, 1.2], radius: 2.1, mass: 55.7, color: "#4f86f7" },
      { position: [-7.1, -1.6, -1.2], radius: 1.9, mass: 62.8, color: "#dd0000" }
    ],
    cameraStart: [20, 10, 20]
  },
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