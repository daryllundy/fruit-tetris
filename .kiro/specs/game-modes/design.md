# Design Document

## Overview

This design extends the existing Fruit Tetris game to support three distinct game modes: Sprint Mode (time-trial), Marathon Mode (progressive difficulty), and Zen Mode (relaxed practice). The implementation will introduce a mode selection system, mode-specific game logic, statistics tracking, and UI enhancements while maintaining the existing fruit combo system and core gameplay mechanics.

The design follows an object-oriented approach, extending the existing `TetrisGame` class with mode-specific behavior through composition and strategy patterns. Each mode will have its own configuration, win/loss conditions, and UI elements.

## Architecture

### High-Level Structure

```
┌─────────────────────────────────────────┐
│         TetrisApp (main.js)             │
│  - Manages screens and UI flow          │
│  - Handles mode selection                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      TetrisGame (tetris.js)             │
│  - Core game logic                       │
│  - Mode management                       │
│  - Delegates to GameMode instances       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         GameMode (new)                   │
│  - Abstract base for modes               │
│  - Sprint, Marathon, Zen implementations │
└──────────────────────────────────────────┘
```

### Component Interactions

1. **Mode Selection Flow**: User selects mode → TetrisApp creates game with mode → Game initializes mode-specific state
2. **Game Loop**: TetrisApp.update() → TetrisGame.update() → GameMode.update() → Mode-specific logic
3. **Win/Loss Conditions**: TetrisGame checks → GameMode.checkWinCondition() / checkLoseCondition()
4. **Statistics**: GameMode tracks stats → TetrisGame displays → TetrisApp renders

## Components and Interfaces

### GameMode Base Class

```javascript
class GameMode {
  constructor(game) {
    this.game = game;
    this.name = '';
    this.description = '';
  }
  
  // Lifecycle methods
  initialize() {}
  update(deltaTime) {}
  onLineClear(linesCleared) {}
  onPieceLock() {}
  reset() {}
  
  // Condition checks
  checkWinCondition() { return false; }
  checkLoseCondition() { return false; }
  
  // Statistics
  getStats() { return {}; }
  getDisplayStats() { return []; }
  
  // Configuration
  getDropSpeed() { return null; } // null = use default
  shouldIncreaseSpeed() { return true; }
  handleGameOver() {} // Custom game over behavior
}
```

### Sprint Mode Implementation

```javascript
class SprintMode extends GameMode {
  constructor(game) {
    super(game);
    this.name = 'Sprint';
    this.description = 'Clear 40 lines as fast as possible';
    this.targetLines = 40;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.isComplete = false;
  }
  
  initialize() {
    this.startTime = Date.now();
    this.elapsedTime = 0;
    this.isComplete = false;
  }
  
  update(deltaTime) {
    if (!this.isComplete) {
      this.elapsedTime = Date.now() - this.startTime;
    }
  }
  
  onLineClear(linesCleared) {
    // Check if target reached
    if (this.game.lines >= this.targetLines && !this.isComplete) {
      this.isComplete = true;
      this.elapsedTime = Date.now() - this.startTime;
      this.saveBestTime();
    }
  }
  
  checkWinCondition() {
    return this.isComplete;
  }
  
  getDropSpeed() {
    return 500; // Fixed speed for sprint mode
  }
  
  shouldIncreaseSpeed() {
    return false; // No speed increase in sprint
  }
  
  getStats() {
    return {
      elapsedTime: this.elapsedTime,
      remainingLines: Math.max(0, this.targetLines - this.game.lines),
      bestTime: this.getBestTime()
    };
  }
  
  getDisplayStats() {
    return [
      { label: 'Time', value: this.formatTime(this.elapsedTime) },
      { label: 'Lines', value: `${this.game.lines}/${this.targetLines}` },
      { label: 'Best', value: this.formatTime(this.getBestTime()) }
    ];
  }
  
  formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  }
  
  saveBestTime() {
    const bestTime = this.getBestTime();
    if (bestTime === 0 || this.elapsedTime < bestTime) {
      Storage.set('tetris-sprint-best', this.elapsedTime);
    }
  }
  
  getBestTime() {
    return Storage.get('tetris-sprint-best', 0);
  }
}
```

### Marathon Mode Implementation

```javascript
class MarathonMode extends GameMode {
  constructor(game) {
    super(game);
    this.name = 'Marathon';
    this.description = 'Reach level 15 with increasing difficulty';
    this.targetLevel = 15;
    this.linesPerLevel = 10;
  }
  
  initialize() {
    // Marathon starts at level 1
    this.game.level = 1;
  }
  
  onLineClear(linesCleared) {
    // Level up every 10 lines
    const newLevel = Math.floor(this.game.lines / this.linesPerLevel) + 1;
    if (newLevel > this.game.level && newLevel <= this.targetLevel) {
      this.game.level = newLevel;
      this.game.updateDropSpeed();
      window.soundManager.playLevelUp();
    }
  }
  
  checkWinCondition() {
    return this.game.level >= this.targetLevel;
  }
  
  checkLoseCondition() {
    return this.game.state === 'gameOver';
  }
  
  shouldIncreaseSpeed() {
    return true; // Speed increases with level
  }
  
  getStats() {
    const linesUntilNext = this.linesPerLevel - (this.game.lines % this.linesPerLevel);
    return {
      currentLevel: this.game.level,
      targetLevel: this.targetLevel,
      linesUntilNext: linesUntilNext,
      highestLevel: this.getHighestLevel()
    };
  }
  
  getDisplayStats() {
    const stats = this.getStats();
    return [
      { label: 'Level', value: `${stats.currentLevel}/${stats.targetLevel}` },
      { label: 'Next', value: `${stats.linesUntilNext} lines` },
      { label: 'Best', value: `Level ${stats.highestLevel}` }
    ];
  }
  
  handleGameOver() {
    // Save highest level reached
    const highestLevel = this.getHighestLevel();
    if (this.game.level > highestLevel) {
      Storage.set('tetris-marathon-best', this.game.level);
    }
  }
  
  getHighestLevel() {
    return Storage.get('tetris-marathon-best', 0);
  }
}
```

### Zen Mode Implementation

```javascript
class ZenMode extends GameMode {
  constructor(game) {
    super(game);
    this.name = 'Zen';
    this.description = 'Relaxed play with no game over';
    this.totalLinesCleared = 0;
  }
  
  initialize() {
    this.totalLinesCleared = 0;
  }
  
  onLineClear(linesCleared) {
    this.totalLinesCleared += linesCleared;
  }
  
  checkLoseCondition() {
    return false; // Never lose in Zen mode
  }
  
  handleGameOver() {
    // Instead of game over, clear top rows
    this.clearTopRows();
    this.game.state = 'playing'; // Continue playing
    this.game.spawnNewPiece();
  }
  
  clearTopRows() {
    // Clear the top 4 rows to make space
    const rowsToClear = 4;
    for (let i = 0; i < rowsToClear; i++) {
      this.game.grid.shift();
      this.game.grid.push(Array(this.game.BOARD_WIDTH).fill(0));
    }
    
    // Play a gentle sound effect
    window.soundManager.playLineClear();
  }
  
  getDropSpeed() {
    return 800; // Comfortable, fixed speed
  }
  
  shouldIncreaseSpeed() {
    return false; // No speed increase in Zen mode
  }
  
  getStats() {
    return {
      totalLines: this.totalLinesCleared,
      score: this.game.score
    };
  }
  
  getDisplayStats() {
    return [
      { label: 'Lines', value: this.totalLinesCleared },
      { label: 'Score', value: formatScore(this.game.score) }
    ];
  }
}
```

### Mode Factory

```javascript
class GameModeFactory {
  static createMode(modeType, game) {
    switch (modeType) {
      case 'sprint':
        return new SprintMode(game);
      case 'marathon':
        return new MarathonMode(game);
      case 'zen':
        return new ZenMode(game);
      default:
        return new MarathonMode(game); // Default mode
    }
  }
  
  static getAvailableModes() {
    return [
      { id: 'sprint', name: 'Sprint', description: 'Clear 40 lines as fast as possible', icon: '⚡' },
      { id: 'marathon', name: 'Marathon', description: 'Reach level 15 with increasing difficulty', icon: '🏃' },
      { id: 'zen', name: 'Zen', description: 'Relaxed play with no game over', icon: '🧘' }
    ];
  }
}
```

## Data Models

### Game State Extensions

The existing `TetrisGame` class will be extended with:

```javascript
class TetrisGame {
  constructor() {
    // ... existing properties ...
    
    // New mode-related properties
    this.currentMode = null;
    this.modeType = 'marathon'; // 'sprint', 'marathon', 'zen'
  }
  
  // New method to set game mode
  setMode(modeType) {
    this.modeType = modeType;
    this.currentMode = GameModeFactory.createMode(modeType, this);
  }
  
  // Modified start method
  start(modeType = 'marathon') {
    this.setMode(modeType);
    this.state = 'playing';
    this.reset();
    this.currentMode.initialize();
    this.spawnNewPiece();
    window.soundManager.playBackgroundMusic();
    this.updateMusicTension();
  }
  
  // Modified update method
  update(deltaTime) {
    if (this.state !== 'playing') return;
    
    // Update current mode
    if (this.currentMode) {
      this.currentMode.update(deltaTime);
      
      // Check win condition
      if (this.currentMode.checkWinCondition()) {
        this.handleModeComplete();
        return;
      }
    }
    
    // ... existing update logic ...
  }
  
  // Modified completeLinesClearing
  completeLinesClearing() {
    const linesCleared = this.clearingLines.length;
    
    // ... existing line clearing logic ...
    
    // Notify mode
    if (this.currentMode) {
      this.currentMode.onLineClear(linesCleared);
    }
    
    // ... rest of existing logic ...
  }
  
  // Modified lockPiece
  lockPiece() {
    // ... existing lock logic ...
    
    // Notify mode
    if (this.currentMode) {
      this.currentMode.onPieceLock();
    }
    
    // ... rest of existing logic ...
  }
  
  // Modified gameOver
  gameOver() {
    // Check if mode handles game over differently
    if (this.currentMode && this.currentMode.checkLoseCondition() === false) {
      this.currentMode.handleGameOver();
      return;
    }
    
    // Standard game over
    this.state = 'gameOver';
    window.soundManager.stopBackgroundMusic();
    window.soundManager.playGameOver();
    
    // Notify mode
    if (this.currentMode) {
      this.currentMode.handleGameOver();
    }
    
    // Save high score
    const highScore = Storage.get('tetris-high-score', 0);
    if (this.score > highScore) {
      Storage.set('tetris-high-score', this.score);
    }
  }
  
  // New method for mode completion
  handleModeComplete() {
    this.state = 'modeComplete';
    window.soundManager.stopBackgroundMusic();
    window.soundManager.playSuccess(); // New success sound
  }
  
  // Modified updateDropSpeed
  updateDropSpeed() {
    // Check if mode overrides drop speed
    if (this.currentMode) {
      const modeSpeed = this.currentMode.getDropSpeed();
      if (modeSpeed !== null) {
        this.dropSpeed = modeSpeed;
        return;
      }
      
      // Check if mode allows speed increase
      if (!this.currentMode.shouldIncreaseSpeed()) {
        return;
      }
    }
    
    // Default speed calculation
    const baseSpeed = 1000;
    this.dropSpeed = Math.max(50, baseSpeed - (this.level - 1) * 50);
  }
}
```

### Statistics Data Structure

```javascript
// Mode statistics stored in localStorage
{
  'tetris-sprint-best': 45230,  // milliseconds
  'tetris-marathon-best': 12,   // highest level reached
  'tetris-high-score': 125000   // existing high score
}
```

## 
Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

Before defining the correctness properties, I've analyzed the acceptance criteria to eliminate redundancy:

- **Property 2.2 and 2.3** can be combined: Level progression and speed increase are coupled behaviors that should be tested together
- **Property 3.2 and 3.3** are related: Clearing top rows and allowing piece placement are part of the same recovery mechanism
- **Property 4.3 and 4.5** both test state management during mode transitions and can be combined
- **Property 6.2** is already covered by **Property 2.3** (both test difficulty progression in Marathon mode)

After reflection, the following properties provide unique validation value:

### Property 1: Personal best time persistence
*For any* sprint mode completion time that is less than the stored best time (or when no best time exists), saving should update the stored value to the new completion time
**Validates: Requirements 1.5**

### Property 2: Marathon level progression
*For any* marathon mode game state, when the total lines cleared reaches a multiple of 10, the level should increment by 1 and the fall speed should decrease according to the formula: max(50, 1000 - (level - 1) * 50)
**Validates: Requirements 2.2, 2.3**

### Property 3: Game over on spawn collision
*For any* game board state in non-Zen modes where the spawn position is occupied, attempting to spawn a new piece should trigger game over
**Validates: Requirements 2.5**

### Property 4: Zen mode recovery
*For any* game board state in Zen mode where a piece cannot spawn, the game should clear the top 4 rows, shift remaining rows down, and allow the piece to be placed
**Validates: Requirements 3.2, 3.3**

### Property 5: Zen mode scoring consistency
*For any* number of lines cleared in Zen mode, the scoring calculation should match the standard scoring formula: basePoints[linesCleared] * level + softDropBonus + comboBonus
**Validates: Requirements 3.4**

### Property 6: Zen mode state persistence
*For any* game state in Zen mode, pausing and then resuming should preserve all game state values (score, lines, level, board, current piece, next pieces, held piece)
**Validates: Requirements 3.5**

### Property 7: Mode initialization
*For any* mode selection, initializing the game should set the mode-specific configuration (target lines/level, speed settings, win/loss conditions)
**Validates: Requirements 4.2**

### Property 8: Mode transition state reset
*For any* active game session, switching to a different mode should reset all game state (grid, score, lines, level, pieces) before initializing the new mode
**Validates: Requirements 4.3, 4.5**

### Property 9: Active mode display
*For any* active game session, the UI should display the current mode name throughout gameplay
**Validates: Requirements 4.4**

### Property 10: Mode completion summary
*For any* mode that reaches its completion condition, the game should display a summary screen containing at minimum: final score, total lines cleared, and mode-specific statistics
**Validates: Requirements 5.4**

### Property 11: Mode completion feedback
*For any* mode completion event, the game should trigger both a success sound effect and visual feedback (state change to 'modeComplete')
**Validates: Requirements 6.4**

## Error Handling

### Mode Selection Errors

- **Invalid mode type**: If an unrecognized mode type is provided, default to Marathon mode and log a warning
- **Mode initialization failure**: If mode initialization fails, display error message and return to mode selection screen

### Zen Mode Recovery Errors

- **Insufficient space after clearing**: If clearing top 4 rows still doesn't allow piece placement, clear additional rows (up to 8 total)
- **Empty board edge case**: If board is completely empty but piece still can't spawn, log error and reset game

### Storage Errors

- **localStorage unavailable**: Gracefully degrade to in-memory storage for statistics
- **Corrupted statistics data**: Reset statistics to default values and log warning
- **Storage quota exceeded**: Clear old statistics data and retry save

### State Transition Errors

- **Invalid state transition**: Log error and maintain current state
- **Mode completion without mode**: Default to standard game over behavior

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples and edge cases:

**Sprint Mode Tests:**
- Sprint mode initializes with 40 line target
- Timer starts at 0 when sprint mode begins
- Timer stops when 40 lines are cleared
- Game state changes to 'modeComplete' at 40 lines
- Fixed drop speed of 500ms is used

**Marathon Mode Tests:**
- Marathon mode initializes at level 1 with target 15
- Game state changes to 'modeComplete' at level 15
- Level 1 has drop speed of 1000ms
- Level 15 has drop speed of 300ms

**Zen Mode Tests:**
- Zen mode initializes with no win/loss conditions
- Drop speed is fixed at 800ms
- Speed does not increase with level
- Top 4 rows are cleared when spawn fails

**Mode Selection Tests:**
- Mode selection screen displays all 3 modes
- Each mode has correct name, description, and icon
- Selecting a mode initializes correct mode instance

**Statistics Tests:**
- Sprint best time is saved to localStorage
- Marathon best level is saved to localStorage
- Statistics display shows correct values

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using **fast-check** (JavaScript property testing library).

**Configuration:**
- Each property test will run a minimum of 100 iterations
- Tests will use custom generators for game states, board configurations, and mode types
- Each test will be tagged with the format: `**Feature: game-modes, Property {number}: {property_text}**`

**Test Generators:**

```javascript
// Generator for game board states
const boardStateGen = fc.array(
  fc.array(fc.oneof(fc.constant(0), fc.record({
    type: fc.constantFrom('I', 'O', 'T', 'S', 'Z', 'J', 'L'),
    emoji: fc.constantFrom('🍌', '🍊', '🍎', '🍓', '🥝', '🍇', '🍍')
  })), { minLength: 10, maxLength: 10 }),
  { minLength: 20, maxLength: 20 }
);

// Generator for mode types
const modeTypeGen = fc.constantFrom('sprint', 'marathon', 'zen');

// Generator for line counts
const lineCountGen = fc.integer({ min: 0, max: 200 });

// Generator for completion times
const timeGen = fc.integer({ min: 10000, max: 600000 }); // 10s to 10min

// Generator for game state snapshots
const gameStateGen = fc.record({
  grid: boardStateGen,
  score: fc.integer({ min: 0, max: 1000000 }),
  lines: lineCountGen,
  level: fc.integer({ min: 1, max: 20 }),
  currentPiece: fc.option(tetrominoGen),
  nextPieces: fc.array(tetrominoGen, { minLength: 3, maxLength: 3 }),
  heldPiece: fc.option(tetrominoGen)
});
```

**Property Test Implementations:**

Each correctness property will be implemented as a single property-based test with appropriate generators and assertions.

### Integration Testing

Integration tests will verify end-to-end workflows:

- Complete sprint mode game (start → clear 40 lines → completion)
- Complete marathon mode game (start → reach level 15 → completion)
- Zen mode recovery cycle (fill board → trigger recovery → continue playing)
- Mode switching workflow (play mode A → quit → select mode B → verify clean state)
- Statistics persistence (complete game → quit → restart → verify stats loaded)

### Manual Testing Checklist

- [ ] All three modes are selectable from menu
- [ ] Sprint mode timer displays correctly
- [ ] Marathon mode level progression feels smooth
- [ ] Zen mode recovery is visually clear
- [ ] Mode-specific UI elements display correctly
- [ ] Sound effects play at appropriate times
- [ ] Statistics persist across sessions
- [ ] Mobile controls work in all modes
- [ ] Game is playable on different screen sizes

## UI/UX Considerations

### Mode Selection Screen

- Display all three modes in a grid or list layout
- Each mode shows: icon, name, description, and personal best
- Highlight recommended mode for new players (Zen)
- Include "How to Play" button for each mode

### In-Game HUD Updates

- Mode name displayed prominently at top
- Mode-specific stats panel (replaces or augments existing stats)
- Progress indicator for goal-based modes (Sprint, Marathon)
- Visual distinction between modes (color theme or icon)

### Completion Screen

- Large "Mode Complete!" message
- Final statistics display
- Personal best indicator (new record or current best)
- Options: Play Again (same mode), Change Mode, Quit

### Zen Mode Visual Feedback

- Gentle animation when top rows are cleared
- Calming color palette
- No "danger" indicators or urgent visual cues
- Optional: Display encouraging messages

## Performance Considerations

- Mode switching should be instant (< 100ms)
- Statistics loading should not block game start
- Timer updates should use requestAnimationFrame for accuracy
- Board clearing in Zen mode should be animated smoothly (< 500ms)

## Future Enhancements

- Additional modes: Ultra (2-minute time limit), Cheese (clear pre-filled board)
- Leaderboards for each mode
- Daily challenges with specific mode configurations
- Custom mode creator with adjustable parameters
- Achievements system across all modes
