/**
 * Level finder
 * Create a level and then
 * Analyzes the level to find how many winning shot combinations exist.
 * It targets a specified success %
 * Run with: npx tsx level.test.ts <levelNumber>
 * Example: npx tsx level.test.ts 0
 */

import { simulateShot } from './physics';
import { LEVELS, MAX_POWER } from './constants';
import { LevelConfig } from './types';

function findWinningShot(level: LevelConfig) {
  const pMin = -Math.PI / 2;
  const pMax = Math.PI / 2;
  const yMin = -Math.PI;
  const yMax = Math.PI;

  let wins = 0;
  let tests = 0;

  // Don't bother with little power.
  for (let power = 5; power <= MAX_POWER; power++) {
    for (let p = pMin; p <= pMax; p += 0.2) {
      for (let y = yMin; y <= yMax; y += 0.2) {
        tests++;
        const result = simulateShot(level, p, y, power);
        if (result.result === 'won') {
          wins++;
        }
      }
    }
  }
  const success_rate = (wins / tests * 100.0);

  console.log(`Level: ${level.name}`);
  console.log(`Success_Rate=${success_rate.toFixed(1)}%`);
}

//findWinningShot(LEVELS[levelNum-1]);


let targetPercent = parseFloat(process.argv[2]);
if (isNaN(targetPercent)) {
  console.log('Usage: npx tsx level.test.ts <targetPercent>');
  process.exit(1);
}
console.log(`Target test percent ${targetPercent}`);



findWinningShot(LEVELS[0]);