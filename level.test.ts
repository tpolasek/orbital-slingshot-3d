/**
 * Level difficulty test
 *
 * Analyzes a level to find how many winning shot combinations exist.
 *
 * Run with: npx tsx level.test.ts <levelNumber>
 * Example: npx tsx level.test.ts 0
 */

import { simulateShot } from './physics';
import { LEVELS, MAX_POWER } from './constants';

function findWinningShot(levelIndex: number) {
  const level = LEVELS[levelIndex-1];
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

  console.log(`Level ${levelIndex}: ${level.name}`);
  console.log(`Success_Rate=${success_rate.toFixed(1)}%`);
}

let levelNum = parseInt(process.argv[2], 10);
if (isNaN(levelNum)) {
  console.log('Usage: npx tsx level.test.ts <levelNumber>');
  console.log(`Available levels: 0-${LEVELS.length - 1}`);
  process.exit(1);
}

if (levelNum <= 0 || levelNum > LEVELS.length) {
  console.log(`Invalid level number. Must be between 1 and ${LEVELS.length}`);
  process.exit(1);
}

findWinningShot(levelNum);