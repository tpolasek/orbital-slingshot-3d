import { create } from 'zustand';
import { GameStatus, LevelConfig } from './types';
import { LEVELS } from './constants';

interface GameState {
  currentLevelIndex: number;
  status: GameStatus;
  power: number;
  lastAttempt: { power: number; pitch: number; yaw: number } | null;
  
  // Actions
  setLevel: (index: number) => void;
  nextLevel: () => void;
  setStatus: (status: GameStatus) => void;
  setPower: (power: number) => void;
  setLastAttempt: (power: number, pitch: number, yaw: number) => void;
  resetLevel: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentLevelIndex: 0,
  status: GameStatus.IDLE,
  power: 0,
  lastAttempt: null,

  setLevel: (index) => set({ 
    currentLevelIndex: index, 
    status: GameStatus.IDLE, 
    power: 0,
    lastAttempt: null
  }),

  nextLevel: () => {
    const { currentLevelIndex } = get();
    if (currentLevelIndex < LEVELS.length - 1) {
      set({ 
        currentLevelIndex: currentLevelIndex + 1, 
        status: GameStatus.IDLE, 
        power: 0,
        lastAttempt: null
      });
    } else {
      // Loop back or stay (handled in UI)
       set({ 
        currentLevelIndex: 0, 
        status: GameStatus.IDLE, 
        power: 0,
        lastAttempt: null
      });
    }
  },

  setStatus: (status) => set({ status }),
  setPower: (power) => set({ power }),
  setLastAttempt: (power, pitch, yaw) => set({ lastAttempt: { power, pitch, yaw } }),
  resetLevel: () => set({ status: GameStatus.IDLE, power: 0 }),
}));