# 🍎 Fruit Tetris 🍌

## Overview

A fully functional Tetris clone featuring fruit-themed tetromino blocks, built with HTML5 Canvas and vanilla JavaScript. The game runs directly in the browser without React, using a pure vanilla JavaScript implementation for optimal performance.

The game features all standard Tetris mechanics including gravity, rotation, line clearing, scoring, and level progression, with fruit emoji representing different tetromino shapes (🍌 for I-piece, 🍊 for O-piece, etc.).

## Recent Changes (August 9, 2025)

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