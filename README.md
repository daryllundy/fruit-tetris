# 🍎 Fruit Tetris 🍌

A playable Tetris clone featuring fruit-themed tetromino blocks, built with HTML5 Canvas and vanilla JavaScript.

## Features

### Core Gameplay
- **Standard 10×20 Tetris playfield** with visible grid
- **All 7 classic tetromino shapes** (I, J, L, O, S, T, Z)
- **Fruit-themed blocks** using emoji: 🍌🍊🍎🍓🥝🍇🍍
- **Complete game mechanics**: gravity, rotation, line clearing, scoring, level progression
- **SRS-style rotation system** with wall kicks
- **Next-piece preview** showing upcoming 3 pieces
- **Hold slot** for storing one tetromino
- **Ghost piece** showing drop location
- **Game over detection** and handling

### Controls
**Keyboard:**
- `←` / `→` - Move left/right
- `↓` - Soft drop
- `Space` - Hard drop
- `Z` / `X` - Rotate left/right (or `↑` for rotate right)
- `C` - Hold piece
- `P` - Pause game

**Touch/Mobile:**
- Swipe left/right for movement
- Swipe down for soft drop
- Tap to rotate
- Double-tap for hard drop
- On-screen buttons for rotate, hold, and drop

### UI Features
- **Score tracking** with level progression
- **Lines cleared counter**
- **Pause and restart** functionality
- **Simple main menu** with Play and Instructions
- **Mobile-responsive design**
- **Sound effects** for game events (with mute option)
- **High score persistence** using localStorage

## How to Run

### Option 1: Replit (Recommended)
1. Click the "Run" button in Replit
2. The game will open in the browser preview
3. Start playing immediately!

### Option 2: Local Development
1. Clone or download this repository
2. Open `index.html` in any modern web browser
3. No build step or server required!

### Option 3: Local Server (Optional)
For development with live reload:
```bash
# Using Python
python -m http.server 5000

# Using Node.js
npx serve -s . -l 5000
