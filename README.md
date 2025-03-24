# Match3 Game

A modern implementation of the classic Match-3 puzzle game, originally created in 2013 and now refactored to TypeScript.

[Play the game online](https://sanyabeast.github.io/match3/dist/index.html)

## Features

- 10x10 grid gameplay with colorful gems
- Smooth animations for matching, falling, and cascading effects
- Progressive difficulty with increasing levels
- Score tracking and time-based gameplay
- Touch and mouse controls for gem swapping
- Sound effects and background music
- Responsive design that works on desktop and mobile devices

## Recent Improvements

- Refactored codebase from JavaScript to TypeScript
- Fixed grid size to 10x10 for consistent gameplay
- Added animated background effects
- Enhanced gem animations with smooth falling and matching effects
- Optimized performance with faster animations and better timing
- Simplified visual effects for cleaner gameplay
- Improved cascade matching animations

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/sanyabeast/match3.git
   cd match3
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run development server:
   ```
   npm run dev
   ```

4. Build for production:
   ```
   npm run build
   ```

### Project Structure

- `/ts` - TypeScript source files
- `/css` - CSS styles
- `/dist` - Production build output
- `/misc` - Additional resources and older versions

## How to Play

1. Swap adjacent gems to create matches of 3 or more identical gems in a row or column
2. Matched gems will disappear, and new gems will fall from the top
3. Complete the level by reaching the target score before time runs out
4. Each level increases in difficulty with more gem colors and higher target scores

## License

ISC

## Author

[sanyabeast](https://github.com/sanyabeast)
