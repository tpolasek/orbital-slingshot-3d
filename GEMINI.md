# Orbital Slingshot

## Project Origin Prompt

This project was created based on the following prompt:

> Create a 3D trajectory game where you aim a spaceship, hold spacebar to pick the initial power and let go of space shoot the ship. The goal of the game is to aim the spaceship so that it flies around planets (gravity pulls the ship) into a "Purple Warp" target. There should be multiple levels of increasing difficulty, harder levels should have more planets/moon/asteroids, large planets pulling the spaceship in various directions. There should be stars (think white point dots) in the background that provides space ambiance.
>
> The player should be able to move the camera with the mouse + scroll wheel (zoom) to look around, the ship should be aimed with “WASD”.
>
> **Gameplay example level 1:**
>
> There is a single planet and the “Purple” Warp target” is on the other side.
> The player moves the camera with mouse to look a direction, scrolls the mouse wheel to move towards the location there are looking.
> Then the player press W to move the spaceship up, “D” to move the spaceship right.
> Then the player holds Space, the amount of power increases until they let go of space. The ship shoots out, curves around the planet and hits the “Warp Target”. Level 1 complete.

## Project Overview

**Orbital Slingshot** is a web-based 3D physics puzzle game where players launch a spaceship, utilizing planetary gravity to navigate obstacles and reach a target destination.

The application is built using **React** and **TypeScript**, leveraging **React Three Fiber** for declarative 3D scene rendering and **Zustand** for state management.

## Tech Stack

*   **Runtime:** Node.js
*   **Framework:** React 19
*   **Build Tool:** Vite
*   **Language:** TypeScript
*   **3D Graphics:** Three.js, @react-three/fiber, @react-three/drei
*   **State Management:** Zustand
*   **Styling:** Tailwind CSS classes (inferred from usage in App.tsx `className="relative..."`) / Standard CSS
*   **Icons:** Lucide React

## Project Structure

*   `src/` (Root)
    *   `App.tsx`: Main entry point. Sets up the 3D Canvas, lighting, and renders the active level.
    *   `store.ts`: Global game state management (current level, game status, launch power).
    *   `constants.ts`: Configuration for game levels (planets, start positions, targets).
    *   `types.ts`: TypeScript definitions for game entities (Vector3Array, PlanetConfig, LevelConfig, GameStatus).
    *   `components/`:
        *   `GameObjects.tsx`: Contains static or simple entities like `Planet`, `Target`, and `StarField`.
        *   `Spaceship.tsx`: The main player-controlled entity. Likely contains the physics update loop.
        *   `UI.tsx`: 2D Overlay for game status, controls, and level selection.

## Key Concepts

### Game State
Managed via `zustand` in `store.ts`. Key states (`GameStatus`):
*   `IDLE`: Waiting for user input.
*   `CHARGING`: User is setting launch power.
*   `FLYING`: Physics simulation is active.
*   `WON` / `LOST`: End states for the current level.

### 3D Scene
*   The scene is rendered within a `<Canvas>` component in `App.tsx`.
*   Lighting includes ambient and point lights.
*   `OrbitControls` allows the user to inspect the level.

### Levels
Levels are defined in `constants.ts` and loaded by index from the global store. Each level defines:
*   Ship start position.
*   Target position.
*   Planets (position, mass, radius, color).

## Building and Running

**Prerequisites:** Node.js

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Start Development Server:**
    ```bash
    npm run dev
    ```

3.  **Build for Production:**
    ```bash
    npm run build
    ```

4.  **Preview Production Build:**
    ```bash
    npm run preview
    ```
