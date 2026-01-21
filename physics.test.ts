/**
 * Example test suite demonstrating the modular physics system
 *
 * This file shows how to use the physics module independently from the React game
 * for testing various aim angles and power levels.
 *
 * Run with: npx tsx physics.test.ts
 */

import { PhysicsSimulation, simulateShot, PhysicsSimulation as Sim } from './physics';
import { LEVELS, MAX_POWER } from './constants';

// Helper to format a vector for display
function fmt(v: number[]): string {
  return `[${v.map(n => n.toFixed(2)).join(', ')}]`;
}

// Helper to run a test simulation
function testShot(levelIndex: number, pitch: number, yaw: number, power: number) {
  const level = LEVELS[levelIndex];
  console.log(`\n--- Level ${levelIndex + 1}: ${level.name} ---`);
  console.log(`Aim: pitch=${pitch.toFixed(2)} (${(pitch * 180 / Math.PI).toFixed(1)}°), yaw=${yaw.toFixed(2)} (${(yaw * 180 / Math.PI).toFixed(1)}°), power=${power}`);

  const result = simulateShot(level, pitch, yaw, power);

  console.log(`Result: ${result.result}`);
  console.log(`Events: ${result.events.length}`);
  result.events.forEach(e => {
    switch (e.type) {
      case 'planet_collision':
        console.log(`  - Planet collision at ${fmt(e.position)} (planet ${e.planetIndex})`);
        break;
      case 'target_reached':
        console.log(`  - Target reached at ${fmt(e.position)}`);
        break;
      case 'out_of_bounds':
        console.log(`  - Out of bounds at ${fmt(e.position)}`);
        break;
    }
  });

  const finalPos = result.trajectory[result.trajectory.length - 1].position;
  console.log(`Final position: ${fmt(finalPos)}`);
  console.log(`Trajectory points: ${result.trajectory.length}`);

  return result;
}

// Test 1: Level 1 pass
console.log('='.repeat(60));
console.log('TEST 1: Level 1 - Direct shot (should hit target X)');
console.log('='.repeat(60));
testShot(0, -0.8000, 3.1416, 11.68); 

// Test 2: Off-target shot on Level 1
console.log('\n' + '='.repeat(60));
console.log('TEST 2: Level 1 - Off-center shot (should miss)');
console.log('='.repeat(60));
testShot(0, 0.2, 0, 15); // Slight pitch up

// Test 3: Gravity assist on Level 1
console.log('\n' + '='.repeat(60));
console.log('TEST 3: Level 1 - Slingshot around planet');
console.log('='.repeat(60));
testShot(0, 0.3, 1.5, 18); // Aim to swing around the planet

// Test 4: Various power levels
console.log('\n' + '='.repeat(60));
console.log('TEST 4: Testing various power levels');
console.log('='.repeat(60));
[5, 10, 15, 20, 25].forEach(power => {
  const result = simulateShot(LEVELS[0], 0, 0, power);
  console.log(`Power ${power}: ${result.result}`);
});

// Test 5: Level 2 - Binary gravity challenge
console.log('\n' + '='.repeat(60));
console.log('TEST 5: Level 2 - Binary gravity');
console.log('='.repeat(60));
testShot(1, -0.1, -0.3, 18);

// Test 6: Manual step-by-step simulation
console.log('\n' + '='.repeat(60));
console.log('TEST 6: Step-by-step simulation');
console.log('='.repeat(60));

const level = LEVELS[0];
const sim = new Sim(
  { position: level.shipStart, velocity: [0, 0, 15] },
  { level }
);

console.log('Step-by-step position:');
for (let i = 0; i < 10; i++) {
  const stepResult = sim.step(0.1); // 100ms steps
  const pos = stepResult.state.position;
  console.log(`  t=${(i * 0.1).toFixed(1)}s: pos=${fmt(pos)}`);
  if (stepResult.events.length > 0) {
    console.log(`    Events: ${stepResult.events.map(e => e.type).join(', ')}`);
    break;
  }
}

// Test 7: Using custom simulation config
console.log('\n' + '='.repeat(60));
console.log('TEST 7: Custom simulation config (low gravity)');
console.log('='.repeat(60));

const customResult = simulateShot(LEVELS[0], 0, 0, 15, { gravityConstant: 5 });
console.log(`With gravityConstant=5: ${customResult.result}`);

const normalResult = simulateShot(LEVELS[0], 0, 0, 15);
console.log(`With normal gravity: ${normalResult.result}`);

console.log('\n' + '='.repeat(60));
console.log('All tests completed!');
console.log('='.repeat(60));

// Export for use in other test files
export { testShot };
