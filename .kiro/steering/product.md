---
inclusion: always
---

# Product Overview

Fruit Tetris is a browser-based Tetris clone featuring fruit-themed emoji blocks (🍌🍊🍎🍓🥝🍇🍍). The game includes a unique fruit combo system that rewards players for creating clusters of matching fruit types.

## Core Features

- Classic 10×20 Tetris gameplay with all 7 tetromino shapes
- Fruit combo system: bonus points for 3+ connected matching fruits
- Dynamic music system that speeds up based on stack height
- SRS-style rotation with wall kicks
- Hold piece, ghost piece, and next-piece preview
- Mobile-responsive with touch controls
- Sound effects and background music with mute option
- High score persistence via localStorage

## Dual Implementation

The project contains two separate implementations:

1. **Vanilla JS Game** (`/js`, `index.html`, `style.css`) - Standalone HTML5 Canvas Tetris game
2. **React/Three.js Scaffold** (`/client`, `/server`) - Full-stack template with React, Three.js, Express (currently minimal/placeholder)

The vanilla JS implementation is the complete, playable game. The React scaffold appears to be a boilerplate for future development.
