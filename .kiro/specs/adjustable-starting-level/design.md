# Design Document

## Overview

The adjustable starting level feature allows players to configure their initial difficulty level before starting a game. This feature integrates with the existing level system in the TetrisGame class, modifying the initialization logic to respect a player-selected starting level while maintaining all existing level progression mechanics. The feature includes a UI selector in the main menu, persistent storage of the preference, and proper integration with the scoring and speed systems.

## Architecture

The feature follows the existing architecture pattern with three main layers:

1. **UI Layer** (index.html, style.css): Adds a level selector control to the main menu
2. **Game Logic Layer** (js/tetris.js): Modifies TetrisGame initialization to accept and use a starting level
3. **Storage Layer** (js/utils.js): Uses existing Storage utility to persist the starting level preference

The implementation maintains separation of concerns by keeping UI logic separate from game logic, with the TetrisApp class (js/main.js) acting as the coordinator between layers.

## Components and Interfaces

### StartingLevelSelector (UI Component)

A new UI control in the main menu that allows level selection:

```html
<div class="starting-level-selector">
  <label for="starting-level">Starting Level:</label>
  <input type="range" id="starting-level" min="1" max="15" value="1">
  <span id="starting-level-value">1</span>
</div>
```

**Interface:**
- Input: User interaction (slider movement)
- Output: Selected level value (1-15)
- Events: 'input' event for real-time updates, 'change' event for final value

### TetrisGame.start() Modification

The existing `start()` method will be modified to accept an optional starting level parameter:

```javascript
start(startingLevel = 1) {
  this.state = 'playing';
  this.reset(startingLevel);
  this.spawnNewPiece();
  window.soundManager.playBackgroundMusic();
  this.updateMusicTension();
}
```

### TetrisGame.reset() Modification

The existing `reset()` method will be modified to accept and apply a starting level:

```javascript
reset(startingLevel = 1) {
  // ... existing reset logic ...
  this.level = Math.max(1, Math.min(15, startingLevel)); // Constrain to valid range
  this.lines = 0; // Always start line count at 0
  this.updateDropSpeed(); // Apply speed for starting level
  // ... rest of reset logic ...
}
```

### Storage Interface

Uses existing Storage utility from js/utils.js:

```javascript
// Save starting level preference
Storage.set('tetris-starting-level', selectedLevel);

// Load starting level preference
const startingLevel = Storage.get('tetris-starting-level', 1);
```

## Data Models

### Starting Level Configuration

```javascript
{
  value: number,        // Selected level (1-15)
  min: 1,              // Minimum selectable level
  max: 15,             // Maximum selectable level
  default: 1           // Default when no preference saved
}
```

### Game State Extension

The existing TetrisGame state is extended with:

```javascript
{
  startingLevel: number,  // The level the game started at
  level: number,          // Current level (existing)
  lines: number           // Lines cleared (existing)
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Game initialization respects starting level

*For any* valid starting level (1-15), when a game is initialized with that starting level, the game's level property, drop speed, and displayed level should all correspond to the selected starting level.

**Validates: Requirements 1.3, 1.4, 1.5**

### Property 2: Selector updates display

*For any* valid level value (1-15), when the starting level selector is changed to that value, the displayed level value should immediately update to match.

**Validates: Requirements 1.2, 6.2**

### Property 3: Persistence round-trip

*For any* valid starting level (1-15), saving that level to persistent storage and then retrieving it should return the same value.

**Validates: Requirements 2.1, 2.2, 2.4**

### Property 4: Lines counter initialization

*For any* starting level (1-15), when a game begins at that starting level, the lines cleared counter should be initialized to zero.

**Validates: Requirements 5.1**

### Property 5: Score multiplier scales with level

*For any* two starting levels where level A > level B, performing identical line clears at level A should yield a higher score than at level B.

**Validates: Requirements 4.2, 4.4**

### Property 6: Level progression from starting level

*For any* starting level, when 10 lines are cleared, the current level should be exactly one higher than the starting level.

**Validates: Requirements 5.2**

### Property 7: Drop speed formula consistency

*For any* level value (1-15), the drop speed should match the formula: max(50, 1000 - (level - 1) * 50) milliseconds.

**Validates: Requirements 4.1**

## Error Handling

### Invalid Level Values

**Scenario:** User attempts to set a starting level outside the valid range (< 1 or > 15)

**Handling:**
- Input validation constrains values to [1, 15] range
- HTML range input enforces min/max attributes
- JavaScript validation in `reset()` method: `Math.max(1, Math.min(15, startingLevel))`
- No error messages needed as invalid values are prevented

### Storage Failures

**Scenario:** localStorage is unavailable or throws an error

**Handling:**
- Storage.get() returns default value (1) on error
- Storage.set() fails silently with console warning
- Game continues with default starting level
- No user-facing error messages

**Implementation:**
```javascript
const startingLevel = Storage.get('tetris-starting-level', 1);
// If storage fails, startingLevel = 1 (default)
```

### Missing UI Elements

**Scenario:** DOM elements for starting level selector are not found

**Handling:**
- Check for element existence before adding event listeners
- Use optional chaining: `element?.addEventListener(...)`
- Game functions normally with default starting level if UI is missing
- Console warning for debugging

## Testing Strategy

### Unit Testing

Unit tests will verify specific behaviors and edge cases:

1. **Initialization Tests:**
   - Game starts at level 1 by default
   - Game starts at selected level (test levels 1, 5, 10, 15)
   - Lines counter is 0 at game start regardless of starting level

2. **UI Tests:**
   - Selector has correct min/max attributes (1, 15)
   - Selector displays current value
   - Selector updates on user input

3. **Storage Tests:**
   - Starting level is saved to localStorage
   - Starting level is loaded from localStorage
   - Default value (1) is used when no saved value exists
   - Default value (1) is used when localStorage fails

4. **Boundary Tests:**
   - Level 0 is constrained to 1
   - Level 16 is constrained to 15
   - Negative levels are constrained to 1
   - Very large levels are constrained to 15

5. **Integration Tests:**
   - Starting at level 5, clearing 10 lines advances to level 6
   - Drop speed at level 10 is faster than level 1
   - Score multiplier at level 10 is higher than level 1

### Property-Based Testing

Property-based tests will verify universal properties across all valid inputs using the **fast-check** library for JavaScript. Each test will run a minimum of 100 iterations with randomly generated inputs.

1. **Property 1: Game initialization respects starting level**
   - Generate random starting levels (1-15)
   - Initialize game with each level
   - Assert: game.level === startingLevel
   - Assert: game.dropSpeed === expected speed for that level
   - Assert: displayed level === startingLevel

2. **Property 2: Selector updates display**
   - Generate random level values (1-15)
   - Set selector value
   - Assert: displayed value === selector value

3. **Property 3: Persistence round-trip**
   - Generate random starting levels (1-15)
   - Save to storage
   - Load from storage
   - Assert: loaded value === saved value

4. **Property 4: Lines counter initialization**
   - Generate random starting levels (1-15)
   - Initialize game
   - Assert: game.lines === 0

5. **Property 5: Score multiplier scales with level**
   - Generate two random levels where levelA > levelB
   - Perform identical line clears at each level
   - Assert: scoreA > scoreB

6. **Property 6: Level progression from starting level**
   - Generate random starting level (1-14, to allow room for progression)
   - Start game, clear 10 lines
   - Assert: game.level === startingLevel + 1

7. **Property 7: Drop speed formula consistency**
   - Generate random level (1-15)
   - Calculate expected speed: max(50, 1000 - (level - 1) * 50)
   - Assert: game.dropSpeed === expected speed

### Test Configuration

```javascript
// fast-check configuration
fc.configureGlobal({
  numRuns: 100,  // Minimum 100 iterations per property
  verbose: true
});

// Custom arbitraries for domain-specific values
const levelArbitrary = fc.integer({ min: 1, max: 15 });
const invalidLevelArbitrary = fc.oneof(
  fc.integer({ max: 0 }),
  fc.integer({ min: 16 })
);
```

## Implementation Notes

### Minimal Changes Principle

The implementation should make minimal changes to existing code:

1. **TetrisGame class:** Only modify `start()` and `reset()` methods to accept optional parameter
2. **HTML:** Add single UI control to main menu
3. **CSS:** Add minimal styling for the selector
4. **TetrisApp class:** Add event listener for selector and load/save logic

### Backward Compatibility

The feature maintains backward compatibility:

- `start()` and `reset()` default to level 1 if no parameter provided
- Existing code that calls these methods without parameters continues to work
- No breaking changes to public API

### Performance Considerations

- Storage operations are synchronous but fast (localStorage)
- No performance impact on game loop
- UI updates are event-driven, not polled
- No additional rendering overhead

### Accessibility

- Range input is keyboard accessible (arrow keys)
- Label properly associated with input (for attribute)
- Current value displayed visually
- Touch-friendly on mobile (native range input)

## Future Enhancements

Potential future improvements (out of scope for this spec):

1. **Level Preview:** Show expected drop speed in milliseconds
2. **Difficulty Presets:** Quick buttons for "Easy" (1), "Medium" (5), "Hard" (10)
3. **Custom Level Progression:** Allow players to configure lines-per-level
4. **Starting Level Achievements:** Unlock higher starting levels through gameplay
5. **Per-Mode Starting Levels:** Different starting levels for Sprint, Marathon, Zen modes
