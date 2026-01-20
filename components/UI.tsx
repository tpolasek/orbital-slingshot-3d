import React from 'react';
import { useGameStore } from '../store';
import { GameStatus, LevelConfig } from '../types';
import { MAX_POWER, LEVELS } from '../constants';
import { RotateCw, Play, SkipForward } from 'lucide-react';

export const UI = () => {
  const { currentLevelIndex, status, power, nextLevel, resetLevel } = useGameStore();
  const level = LEVELS[currentLevelIndex];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white drop-shadow-md">Orbital Slingshot</h1>
          <p className="text-blue-300 text-lg">{level.name} <span className="text-sm opacity-70">(Level {currentLevelIndex + 1}/{LEVELS.length})</span></p>
        </div>
        
        <div className="text-right text-white opacity-80 text-sm bg-black/50 p-4 rounded-lg backdrop-blur-sm">
          <p><span className="font-bold text-yellow-400">WASD</span> to Aim</p>
          <p><span className="font-bold text-yellow-400">HOLD SPACE</span> to Charge Power</p>
          <p><span className="font-bold text-yellow-400">RELEASE</span> to Shoot</p>
          <p><span className="font-bold text-yellow-400">MOUSE</span> to Look Around</p>
          <p><span className="font-bold text-yellow-400">SCROLL</span> to Zoom</p>
        </div>
      </div>

      {/* Center Messages */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {status === GameStatus.WON && (
          <div className="bg-green-900/90 p-8 rounded-xl backdrop-blur-md border border-green-500 text-center pointer-events-auto shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-4">Target Reached!</h2>
            <button 
              onClick={nextLevel}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold transition-all mx-auto"
            >
              <SkipForward size={24} />
              Next Level
            </button>
          </div>
        )}

        {status === GameStatus.LOST && (
          <div className="bg-red-900/90 p-8 rounded-xl backdrop-blur-md border border-red-500 text-center pointer-events-auto shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-4">Mission Failed</h2>
            <p className="text-red-200 mb-6">You crashed or drifted into the void.</p>
            <button 
              onClick={resetLevel}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold transition-all mx-auto"
            >
              <RotateCw size={24} />
              Retry Level
            </button>
          </div>
        )}
      </div>

      {/* Bottom Power Meter */}
      <div className="w-full max-w-2xl mx-auto pointer-events-auto">
         {status !== GameStatus.WON && status !== GameStatus.LOST && (
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 backdrop-blur-sm">
                <div className="flex justify-between text-white mb-2 font-mono text-sm uppercase tracking-wider">
                    <span>Thruster Power</span>
                    <span>{Math.round((power / MAX_POWER) * 100)}%</span>
                </div>
                <div className="w-full h-6 bg-slate-700 rounded-full overflow-hidden relative">
                    <div 
                        className={`h-full transition-all duration-75 ease-out ${
                            status === GameStatus.CHARGING ? 'bg-gradient-to-r from-yellow-400 to-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${(power / MAX_POWER) * 100}%` }}
                    />
                </div>
                {status === GameStatus.IDLE && (
                    <div className="mt-2 text-center text-xs text-slate-400 animate-pulse">
                        Hold SPACE to Charge
                    </div>
                )}
            </div>
         )}
         
         {status !== GameStatus.IDLE && status !== GameStatus.CHARGING && status !== GameStatus.WON && status !== GameStatus.LOST && (
            <div className="flex justify-center mt-4">
                 <button 
                    onClick={resetLevel}
                    className="bg-slate-700 hover:bg-slate-600 text-white text-xs px-4 py-2 rounded uppercase font-bold tracking-widest border border-slate-500"
                >
                    Abort / Retry
                </button>
            </div>
         )}
      </div>
    </div>
  );
};