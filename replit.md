# 🍎 Fruit Tetris 🍌

## Overview

A fully functional Tetris clone featuring fruit-themed tetromino blocks with an innovative strategic combo system. Built with HTML5 Canvas and vanilla JavaScript for optimal performance.

The game combines all standard Tetris mechanics (gravity, rotation, line clearing, scoring, level progression) with a unique fruit combo bonus system that rewards strategic placement. Players create clusters of matching fruit types for bonus points, with different patterns (lines, squares, crosses) providing varying multipliers. The dynamic combo system encourages deeper strategic thinking beyond traditional line clearing.

## Recent Changes (August 10, 2025)

### Dynamic Music Tension System
- Implemented adaptive background music that speeds up as blocks stack higher
- Music playback rate increases from 1.0x (normal) to 1.5x (50% faster) based on danger level
- Danger levels calculated from stack height:
  - Safe zone: Bottom 30% of board (normal speed)
  - Danger zone: Top 80% of board (maximum speed)
  - Smooth exponential curve for gradual transitions
- Volume also increases slightly (up to 20%) when in danger for added intensity
- Music tension updates whenever pieces lock or lines are cleared
- Console logging for debugging when danger exceeds 50%

### Enhanced Mobile Touch Controls
- **Tap zones** for intuitive piece control:
  - Tap left third of screen: Move piece left
  - Tap right third of screen: Move piece right
  - Tap directly on piece: Rotate piece
- Haptic feedback (vibration) for mobile touch actions
- Swipe controls remain available (down for soft drop, left/right for movement)
- Double-tap for hard drop functionality preserved
- Updated instructions to clearly explain new tap controls

## Previous Updates (August 9, 2025)

### Major Feature: Fruit Combo Bonus System
- Implemented strategic fruit cluster detection system
- Rewards players for creating clusters of 3+ matching fruit types
- Pattern-based bonus system:
  - Line patterns: Horizontal/vertical fruit arrangements
  - Square patterns: Rectangular filled areas of same fruit
  - Cross patterns: T-shaped or + shaped clusters
  - Scattered patterns: Wide-spread fruit networks
- Dynamic multiplier system (1.0x to 3.0x) that builds with successful combos
- Visual combo notifications with floating score displays
- Audio feedback with special combo sound effects
- Real-time combo statistics in game UI (total combos, current multiplier, last combo size)
- Updated instructions explaining the strategic combo gameplay

### Visual Design Updates
- Removed grid lines from game board for cleaner appearance
- Removed bounding boxes around fruit pieces - now displays pure emojis
- Added 10 unique fruit-themed backgrounds that change with each level:
  - Level 1: Grape Garden (Purple)
  - Level 2: Kiwi Forest (Brown/Green)
  - Level 3: Orange Grove (Orange)
  - Level 4: Strawberry Fields (Red)
  - Level 5: Banana Beach (Yellow)
  - Level 6: Watermelon Wave (Light Green)
  - Level 7: Dragon Fruit Desert (Pink)
  - Level 8: Plum Paradise (Dark Purple)
  - Level 9: Apple Orchard (Green)
  - Level 10+: Blueberry Sky (Blue)
- Added gradient effects and subtle patterns for visual depth

### Bug Fixes
- Fixed overlay display issues - pause and game over screens now properly show one at a time
- Resolved pause/unpause functionality - P key now correctly toggles between paused and playing states
- Added proper CSS hidden class for overlay management
- Improved state management to prevent duplicate overlay displays

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Vanilla JavaScript Application**: Pure JavaScript implementation without frameworks for optimal performance
- **Express Server**: Simple Node.js server to serve the static HTML/JS/CSS files
- **HTML5 Canvas**: Direct canvas rendering for game graphics
- **CSS3**: Modern CSS with responsive design and mobile-first approach

### Game Engine Design
- **Vanilla JavaScript Core**: The core Tetris game logic is implemented in vanilla JavaScript for performance and simplicity
- **Canvas Rendering**: HTML5 Canvas API for game graphics and animations
- **Modular Game Components**: 
  - `tetris.js` - Main game state and logic
  - `tetromino.js` - Piece definitions and fruit emoji mappings
  - `controls.js` - Input handling for keyboard and touch
  - `sound.js` - Audio management system
  - `utils.js` - Utility functions and helpers

### State Management
- **Game State Machine**: Simple state management using JavaScript classes (menu, playing, paused, gameOver)
- **Local Storage**: High score persistence and user preference storage
- **State Isolation**: All game state managed within vanilla JS classes for clean separation of concerns

### Input System
- **Multi-Modal Controls**: Support for keyboard, touch, and enhanced on-screen buttons
- **Touch Gestures**: Comprehensive swipe detection (left/right movement, down for soft drop, up for rotate)
- **Mobile Button Controls**: Complete set of mobile buttons (move left/right, rotate, hold, hard drop, soft drop)
- **Vibration Feedback**: Haptic feedback for mobile button presses
- **Key Repeat Logic**: Proper key repeat handling for smooth piece movement
- **Mobile Optimizations**: Prevented zoom, improved touch targets, visual button feedback

### Audio Architecture
- **Web Audio Integration**: Sound effects for game events (rotate, line clear, drop, game over)
- **Mute Controls**: User-configurable audio with persistent mute state
- **Asset Management**: Audio files loaded from public directory with fallback handling

## External Dependencies

### Core Framework Dependencies
- **React 18** - Frontend framework with hooks and modern features
- **TypeScript** - Static typing and enhanced developer experience
- **Vite** - Build tool and development server

### UI and Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible, unstyled UI primitives for complex components
- **Lucide React** - Icon library for UI elements
- **class-variance-authority** - Utility for component variant management

### 3D Graphics (Currently Unused)
- **Three.js** via React Three Fiber - 3D graphics capabilities (installed but not actively used in Tetris game)
- **React Three Drei** - Three.js utilities and helpers

### Database and Backend
- **Drizzle ORM** - Type-safe database operations
- **PostgreSQL** - Database system (configured via Neon serverless)
- **Express.js** - Backend server framework

### State Management and Data Fetching
- **Zustand** - Lightweight state management
- **TanStack Query** - Server state synchronization and caching

### Development Tools
- **ESBuild** - Fast JavaScript bundler
- **PostCSS** - CSS processing with Tailwind integration
- **TSX** - TypeScript execution for development

The architecture separates concerns effectively, with the vanilla JavaScript game engine handling all Tetris-specific logic while React manages the application shell, UI components, and user interactions. This hybrid approach provides both performance for the game loop and modern development experience for the application framework.