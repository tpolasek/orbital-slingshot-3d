import { create } from 'zustand';
import { GameStatus, LevelConfig } from './types';
import { LEVELS } from './constants';

interface GameState {
  currentLevelIndex: number;
  status: GameStatus;
  power: number;
  
  // Actions
  setLevel: (index: number) => void;
  nextLevel: () => void;
  setStatus: (status: GameStatus) => void;
  setPower: (power: number) => void;
  resetLevel: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentLevelIndex: 0,
  status: GameStatus.IDLE,
  power: 0,

  setLevel: (index) => set({ 
    currentLevelIndex: index, 
    status: GameStatus.IDLE, 
    power: 0 
  }),

  nextLevel: () => {
    const { currentLevelIndex } = get();
    if (currentLevelIndex < LEVELS.length - 1) {
      set({ 
        currentLevelIndex: currentLevelIndex + 1, 
        status: GameStatus.IDLE, 
        power: 0 
      });
    } else {
      // Loop back or stay (handled in UI)
       set({ 
        currentLevelIndex: 0, 
        status: GameStatus.IDLE, 
        power: 0 
      });
    }
  },

  setStatus: (status) => set({ status }),
  setPower: (power) => set({ power }),
  resetLevel: () => set({ status: GameStatus.IDLE, power: 0 }),
}));