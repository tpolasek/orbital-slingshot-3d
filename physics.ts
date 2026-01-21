import { Vector3, Euler } from 'three';
import { LevelConfig, Vector3Array } from './types';
import { GRAVITY_CONSTANT, SHIP_RADIUS, TARGET_RADIUS } from './constants';

/**
 * Pure physics state - serializable for testing and debugging
 */
export interface PhysicsState {
  position: Vector3Array;
  velocity: Vector3Array;
}

/**
 * Result of a physics step
 */
export interface StepResult {
  state: PhysicsState;
  events: PhysicsEvent[];
}

/**
 * Events that can occur during simulation
 */
export type PhysicsEvent =
  | { type: 'planet_collision'; planetIndex: number; position: Vector3Array }
  | { type: 'target_reached'; position: Vector3Array }
  | { type: 'out_of_bounds'; position: Vector3Array };

/**
 * Configuration for the simulation
 */
export interface SimulationConfig {
  level: LevelConfig;
  gravityConstant?: number;
  shipRadius?: number;
  targetRadius?: number;
  maxDistance?: number;
}

/**
 * Simulation class for running orbital physics
 * This can be used in the game loop or in tests
 */
export class PhysicsSimulation {
  private readonly config: Required<SimulationConfig>;
  private position: Vector3;
  private velocity: Vector3;
  private tempDir: Vector3;

  // Temporary vectors to avoid GC during simulation
  private readonly _tempPos = new Vector3();
  private readonly _tempVel = new Vector3();

  constructor(initialState: PhysicsState, config: SimulationConfig) {
    this.config = {
      gravityConstant: config.gravityConstant ?? GRAVITY_CONSTANT,
      shipRadius: config.shipRadius ?? SHIP_RADIUS,
      targetRadius: config.targetRadius ?? TARGET_RADIUS,
      maxDistance: config.maxDistance ?? 100,
      level: config.level,
    };

    this.position = new Vector3(...initialState.position);
    this.velocity = new Vector3(...initialState.velocity);
    this.tempDir = new Vector3();
  }

  /**
   * Get the current state (snapshot)
   */
  getState(): PhysicsState {
    return {
      position: [this.position.x, this.position.y, this.position.z],
      velocity: [this.velocity.x, this.velocity.y, this.velocity.z],
    };
  }

  /**
   * Set the current state
   */
  setState(state: PhysicsState): void {
    this.position.set(...state.position);
    this.velocity.set(...state.velocity);
  }

  /**
   * Get current position as Vector3
   */
  getPosition(): Vector3 {
    return this.position.clone();
  }

  /**
   * Get current velocity as Vector3
   */
  getVelocity(): Vector3 {
    return this.velocity.clone();
  }

  /**
   * Calculate the direction vector from aim angles (pitch, yaw)
   * Ship points towards +Z in its local space
   */
  static calculateLaunchDirection(pitch: number, yaw: number): Vector3Array {
    const direction = new Vector3(0, 0, 1);
    const euler = new Euler(pitch, yaw, 0, 'YXZ');
    direction.applyEuler(euler);
    return [direction.x, direction.y, direction.z];
  }

  /**
   * Calculate initial velocity from aim angles and power
   */
  static calculateInitialVelocity(pitch: number, yaw: number, power: number): Vector3Array {
    const direction = PhysicsSimulation.calculateLaunchDirection(pitch, yaw);
    const dir = new Vector3(...direction);
    const vel = dir.multiplyScalar(Math.max(power, 1));
    return [vel.x, vel.y, vel.z];
  }

  /**
   * Simulate a single time step using Semi-Implicit Euler integration
   * This is more stable for orbital mechanics than standard Euler
   *
   * Algorithm:
   * 1. Calculate forces (gravity from all planets)
   * 2. Update velocity: v = v + a * dt
   * 3. Update position: p = p + v * dt
   * 4. Check for collisions/events
   *
   * @param delta Time step in seconds
   * @returns StepResult with new state and any events that occurred
   */
  step(delta: number): StepResult {
    const events: PhysicsEvent[] = [];

    // 1. Calculate and Apply Gravity Forces
    // We update velocity BEFORE position (Semi-Implicit Euler)
    for (let i = 0; i < this.config.level.planets.length; i++) {
      const planet = this.config.level.planets[i];
      this._tempPos.set(...planet.position);

      const distSq = this.position.distanceToSquared(this._tempPos);
      const dist = Math.sqrt(distSq);

      // Check collision with planet
      if (dist <= planet.radius + this.config.shipRadius) {
        events.push({
          type: 'planet_collision',
          planetIndex: i,
          position: [this.position.x, this.position.y, this.position.z],
        });
        // Stop simulation on collision
        return { state: this.getState(), events };
      }

      // Apply gravity: F = G * M / r^2
      const forceMagnitude = (this.config.gravityConstant * planet.mass) / distSq;
      this.tempDir.copy(this._tempPos).sub(this.position).normalize();
      this.velocity.add(this.tempDir.multiplyScalar(forceMagnitude * delta));
    }

    // 2. Update Position: p = p + v * dt
    this._tempVel.copy(this.velocity).multiplyScalar(delta);
    this.position.add(this._tempVel);

    // 3. Check Win Condition (Target reached)
    this._tempPos.set(...this.config.level.targetPosition);
    if (this.position.distanceTo(this._tempPos) < this.config.targetRadius + this.config.shipRadius) {
      events.push({
        type: 'target_reached',
        position: [this.position.x, this.position.y, this.position.z],
      });
    }

    // 4. Check Lost Condition (Too far away)
    if (this.position.length() > this.config.maxDistance) {
      events.push({
        type: 'out_of_bounds',
        position: [this.position.x, this.position.y, this.position.z],
      });
    }

    return { state: this.getState(), events };
  }

  /**
   * Simulate multiple steps at once
   * Useful for predicting trajectories
   *
   * @param delta Time step per iteration
   * @param steps Number of steps to simulate
   * @returns Array of states and events at each step
   */
  simulateSteps(delta: number, steps: number): { states: PhysicsState[]; allEvents: PhysicsEvent[] } {
    const states: PhysicsState[] = [];
    const allEvents: PhysicsEvent[] = [];

    for (let i = 0; i < steps; i++) {
      const result = this.step(delta);
      states.push(result.state);
      allEvents.push(...result.events);

      // Stop simulation on terminal events
      if (result.events.some(e => e.type === 'planet_collision' || e.type === 'out_of_bounds')) {
        break;
      }
    }

    return { states, allEvents };
  }

  /**
   * Run a complete simulation until completion or max time
   *
   * @param deltaTime Time step per iteration (smaller = more accurate)
   * @param maxTime Maximum simulation time in seconds
   * @returns Final state and all events
   */
  runSimulation(deltaTime: number = 0.016, maxTime: number = 60): { finalState: PhysicsState; events: PhysicsEvent[]; trajectory: PhysicsState[] } {
    const trajectory: PhysicsState[] = [this.getState()];
    const allEvents: PhysicsEvent[] = [];
    let elapsed = 0;

    while (elapsed < maxTime) {
      const result = this.step(deltaTime);
      trajectory.push(result.state);
      allEvents.push(...result.events);
      elapsed += deltaTime;

      // Stop on terminal events
      if (result.events.some(e => e.type === 'planet_collision' || e.type === 'target_reached' || e.type === 'out_of_bounds')) {
        break;
      }
    }

    return { finalState: this.getState(), events: allEvents, trajectory };
  }
}

/**
 * Convenience function to create a simulation from aim parameters
 */
export function createSimulationFromAim(
  level: LevelConfig,
  pitch: number,
  yaw: number,
  power: number,
  config?: Partial<SimulationConfig>
): PhysicsSimulation {
  const initialState: PhysicsState = {
    position: level.shipStart,
    velocity: PhysicsSimulation.calculateInitialVelocity(pitch, yaw, power),
  };

  return new PhysicsSimulation(initialState, { level, ...config });
}

/**
 * Quick test function - simulate a shot and return the result
 */
export function simulateShot(
  level: LevelConfig,
  pitch: number,
  yaw: number,
  power: number,
  config?: Partial<SimulationConfig>
): { result: 'won' | 'lost' | 'flying'; trajectory: PhysicsState[]; events: PhysicsEvent[] } {
  const sim = createSimulationFromAim(level, pitch, yaw, power, config);
  const { events, trajectory } = sim.runSimulation();

  const lastEvent = events[events.length - 1];
  let result: 'won' | 'lost' | 'flying' = 'flying';

  if (lastEvent?.type === 'target_reached') result = 'won';
  else if (lastEvent?.type === 'planet_collision' || lastEvent?.type === 'out_of_bounds') result = 'lost';

  return { result, trajectory, events };
}
