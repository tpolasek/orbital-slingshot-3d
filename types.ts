export type Vector3Array = [number, number, number];

export interface PlanetConfig {
  position: Vector3Array;
  radius: number;
  mass: number;
  color: string;
}

export interface LevelConfig {
  id: number;
  name: string;
  shipStart: Vector3Array;
  targetPosition: Vector3Array;
  planets: PlanetConfig[];
  cameraStart?: Vector3Array;
}

export enum GameStatus {
  IDLE = 'IDLE',
  CHARGING = 'CHARGING',
  FLYING = 'FLYING',
  WON = 'WON',
  LOST = 'LOST'
}