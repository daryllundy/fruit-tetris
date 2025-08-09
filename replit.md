# 🍎 Fruit Tetris 🍌

## Overview

A playable Tetris clone featuring fruit-themed tetromino blocks, built with HTML5 Canvas and vanilla JavaScript for the core game mechanics, with a React/TypeScript frontend wrapper. The project uses a hybrid architecture where the main Tetris game logic is implemented in vanilla JavaScript files, while the UI components and application shell are built with modern React and Tailwind CSS.

The game features all standard Tetris mechanics including gravity, rotation, line clearing, scoring, and level progression, with fruit emoji representing different tetromino shapes (🍌 for I-piece, 🍊 for O-piece, etc.).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React/TypeScript Application**: Modern React application structure with TypeScript for type safety
- **Vite Build System**: Fast development server and build tool with hot module replacement
- **Tailwind CSS**: Utility-first CSS framework for responsive design and styling
- **Component Library**: Comprehensive UI component system using Radix UI primitives for accessibility

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
- **Zustand Stores**: Lightweight state management for game phase control and audio settings
- **Local Storage**: High score persistence and user preference storage
- **Game State Isolation**: Core game state managed within vanilla JS classes, UI state managed by React

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