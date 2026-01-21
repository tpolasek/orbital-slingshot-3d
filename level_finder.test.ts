/**
 * Level finder
 * Generates random level configurations and analyzes them to find
 * levels that match a target success rate (±0.2%).
 *
 * Run with: npx tsx level_finder.test.ts <targetPercent>
 * Example: npx tsx level_finder.test.ts 5.0
 */

import { simulateShot } from './physics';
import { LEVELS, MAX_POWER } from './constants';
import { LevelConfig } from './types';
import { generateRandomLevel } from './levelGenerator';

function findWinningShot(level: LevelConfig): number {
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
  return (wins / tests * 100.0);
}

function findLevelsForTargetPercent(targetPercent: number, maxPlanets: number, maxAttempts: number = 1000): LevelConfig[] {
  const matchingLevels: LevelConfig[] = [];
  const tolerance = 0.2;
  let attempt = 0;

  console.log(`Searching for levels with success rate: ${targetPercent}% ± ${tolerance}%\n`);

  while (matchingLevels.length < 3 && attempt < maxAttempts) {
    attempt++;
    const level = generateRandomLevel(attempt, maxPlanets);
    const successRate = findWinningShot(level);

    const isMatch = Math.abs(successRate - targetPercent) <= tolerance;

    if (isMatch) {
      console.log(`✓ Attempt ${attempt}: Found match! Success rate: ${successRate.toFixed(3)}%`);
      console.log(`  Planets: ${level.planets.length}`);
      console.log(`  Ship: [${level.shipStart.map(n => n.toFixed(1)).join(', ')}]`);
      console.log(`  Target: [${level.targetPosition.map(n => n.toFixed(1)).join(', ')}]`);
      console.log(`  Planets config:`);
      level.planets.forEach((p, i) => {
        console.log(`    P${i + 1}: pos=[${p.position.map(n => n.toFixed(1)).join(', ')}], r=${p.radius.toFixed(1)}, m=${p.mass.toFixed(1)}`);
      });
      console.log();

      matchingLevels.push(level);
    } else if (attempt % 1 === 0) {
      console.log(`Attempt ${attempt}: Success rate ${successRate.toFixed(3)}% (looking for ${targetPercent}%)`);
    }
  }

  if (matchingLevels.length === 0) {
    console.log(`No levels found matching ${targetPercent}% ± ${tolerance}% after ${maxAttempts} attempts.`);
  } else {
    console.log(`\nFound ${matchingLevels.length} level(s) matching target success rate.`);
  }

  return matchingLevels;
}

console.log(`Level 0: ${findWinningShot(LEVELS[0])}`)


let targetPercent = parseFloat(process.argv[2]);
if (isNaN(targetPercent)) {
  console.log('Usage: npx tsx level_finder.test.ts <targetPercent>');
  console.log('Example: npx tsx level_finder.test.ts 5.0');
  process.exit(1);
}

console.log(`Target test percent: ${targetPercent}%`);
console.log('='.repeat(50));
console.log();

const maxPlanets = 2;
const matchingLevels = findLevelsForTargetPercent(targetPercent, maxPlanets);

if (matchingLevels.length > 0) {
  console.log('\n' + '='.repeat(50));
  console.log('MATCHING LEVELS CONFIG (for constants.ts):');
  console.log('='.repeat(50));
  console.log('export const LEVELS: LevelConfig[] = [');
  matchingLevels.forEach((level, index) => {
    console.log(`  {`);
    console.log(`    id: ${level.id},`);
    console.log(`    name: "${level.name}",`);
    console.log(`    shipStart: [${level.shipStart.join(', ')}],`);
    console.log(`    targetPosition: [${level.targetPosition.join(', ')}],`);
    console.log(`    planets: [`);
    level.planets.forEach((planet, pIndex) => {
      console.log(`      { position: [${planet.position.join(', ')}], radius: ${planet.radius.toFixed(1)}, mass: ${planet.mass.toFixed(1)}, color: "${planet.color}" }${pIndex < level.planets.length - 1 ? ',' : ''}`);
    });
    console.log(`    ],`);
    console.log(`    cameraStart: [${level.cameraStart.join(', ')}]`);
    console.log(`  }${index < matchingLevels.length - 1 ? ',' : ''}`);
  });
  console.log('];');
}