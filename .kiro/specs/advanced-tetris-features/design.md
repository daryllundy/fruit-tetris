# Design Document

## Overview

This design document outlines the implementation of five advanced Tetris gameplay features for the Fruit Tetris game: Hold Piece, Ghost Piece Preview, T-Spin Detection, Back-to-Back Bonus, and Perfect Clear Bonus. These features are standard in modern Tetris implementations and significantly enhance gameplay depth while maintaining the existing fruit combo system.

The implementation will extend the existing `TetrisGame` class in `js/tetris.js` and integrate with the current rendering system in `js/main.js`. All features will be designed to work seamlessly with the existing fruit combo mechanics, scoring system, and visual feedback.

## Architecture

### System Components

The implementation follows the existing architecture pattern:

1. **Game Logic Layer** (`js/tetris.js`): Core game state and mechanics
   - Hold piece state management
   - Ghost piece calculation
   - T-Spin detection algorithm
   - Back-to-back tracking
   - Perfect clear detection
   - Enhanced scoring system

2. **Rendering Layer** (`js/main.js`): Visual presentation
   - Ghost piece rendering with transparency
   - T-Spin notification display
   - Back-to-back status indicator
   - Perfect clear visual effects
   - Hold piece display (already exists)

3. **Input Layer** (`js/controls.js`): User interaction
   - Hold piece key binding (already exists: 'C' key)
   - Mobile button support (already exists)

### Integration Points

- **Existing Hold System**: The game already has `heldPiece`, `canHold`, and `holdPiece()` method - we'll enhance the UI feedback
- **Existing Ghost System**: The game already has `ghostPiece` and `updateGhostPiece()` - we'll ensure proper rendering
- **Scoring System**: Extend `updateScore()` to handle new bonus types
- **Combo System**: Ensure T-Spin and other bonuses stack with fruit combos
- **Notification System**: Extend existing `comboNotification` pattern for new bonus types

## Components and Interfaces

### TetrisGame Extensions

```javascript
class TetrisGame {
  // New state properties
  lastMoveWasRotation: boolean;      // Track if last action was rotation
  tSpinDetected: boolean;            // Flag for current T-Spin
  tSpinType: string;                 // 'mini', 'single', 'double', 'triple'
  backToBackActive: boolean;         // B2B chain status
  backToBackCount: number;           // Number of consecutive difficult clears
  lastClearWasDifficult: boolean;    // Track previous clear type
  
  // New notification properties
  tSpinNotification: object;         // T-Spin visual notification data
  backToBackNotification: object;    // B2B visual notification data
  perfectClearNotification: object;  // Perfect clear notification data
  
  // Enhanced methods
  rotatePiece(clockwise): void       // Mark rotation flag
  movePiece(dx, dy): void            // Clear rotation flag on movement
  lockPiece(): void                  // Check T-Spin before locking
  checkTSpin(): object               // Detect T-Spin conditions
  checkPerfectClear(): boolean       // Detect empty board
  updateScore(lines, bonuses): void  // Handle all bonus types
  calculateDifficultClear(lines): object  // Determine if clear is difficult
}
```

### T-Spin Detection Interface

```javascript
interface TSpinResult {
  detected: boolean;
  type: 'none' | 'mini' | 'regular';
  corners: number;        // Number of filled corners (0-4)
  frontCorners: number;   // Number of filled front corners
  linesCleared: number;   // Lines cleared by this T-Spin
}
```

### Bonus Calculation Interface

```javascript
interface BonusCalculation {
  basePoints: number;
  tSpinBonus: number;
  backToBackBonus: number;
  perfectClearBonus: number;
  comboBonus: number;
  totalBonus: number;
  multiplier: number;
}
```

## Data Models

### T-Spin Corner Detection

The T-Spin detection algorithm checks the four diagonal corners around the T-piece's center block:

```
Corner positions relative to T-piece center (marked as X):
  NW  NE
    \ /
     X
    / \
  SW  SE
```

For a valid T-Spin:
- **Regular T-Spin**: At least 3 of 4 corners filled AND at least 2 front corners filled
- **Mini T-Spin**: At least 3 of 4 corners filled AND only 1 front corner filled
- Front corners are determined by the T-piece's current rotation

### Scoring Values

```javascript
const SCORING = {
  // T-Spin base points (multiplied by level)
  T_SPIN_MINI: 100,
  T_SPIN_SINGLE: 800,
  T_SPIN_DOUBLE: 1200,
  T_SPIN_TRIPLE: 1600,
  
  // Back-to-back multiplier
  BACK_TO_BACK_MULTIPLIER: 1.5,
  
  // Perfect clear bonuses (multiplied by level)
  PERFECT_CLEAR_SINGLE: 800,
  PERFECT_CLEAR_DOUBLE: 1200,
  PERFECT_CLEAR_TRIPLE: 1800,
  PERFECT_CLEAR_TETRIS: 2000,
  
  // Existing line clear values
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800
};
```

### State Tracking

```javascript
// Back-to-back state
{
  active: boolean,
  count: number,
  lastClearType: 'tetris' | 't-spin' | 'regular' | null
}

// T-Spin state
{
  detected: boolean,
  type: 'mini' | 'regular',
  linesCleared: number,
  timestamp: number
}

// Perfect clear state
{
  detected: boolean,
  linesCleared: number,
  timestamp: number
}
```

## 
Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Hold Piece Properties

**Property 1: Hold swap consistency**
*For any* game state with a current piece and a held piece, when the hold function is activated, the current piece type should become the held piece type and the held piece type should become the current piece type.
**Validates: Requirements 1.1**

**Property 2: Hold spawn consistency**
*For any* game state with a current piece and no held piece, when the hold function is activated, the current piece type should become the held piece and a new piece from the next queue should become the current piece.
**Validates: Requirements 1.2**

**Property 3: Hold lock prevention**
*For any* game state, after using the hold function, attempting to hold again before the piece locks should have no effect on the game state.
**Validates: Requirements 1.3**

**Property 4: Hold spawn position invariant**
*For any* piece type, when swapped from hold to current, the piece should spawn at position (3, 0) with rotation index 0.
**Validates: Requirements 1.4**

### Ghost Piece Properties

**Property 5: Ghost piece lowest position**
*For any* active tetromino and board state, the ghost piece Y position should equal the current piece Y position plus the maximum number of downward moves possible without collision.
**Validates: Requirements 2.1**

**Property 6: Ghost piece update consistency**
*For any* piece movement or rotation, the ghost piece position after the action should reflect the new lowest valid position for the updated piece state.
**Validates: Requirements 2.2**

**Property 7: Ghost piece cleanup**
*For any* game state where a piece locks, the ghost piece should be null or undefined immediately after the lock.
**Validates: Requirements 2.5**

### T-Spin Detection Properties

**Property 8: T-Spin rotation requirement**
*For any* T-piece lock event, a T-Spin should only be detected if the last action before locking was a rotation.
**Validates: Requirements 3.1**

**Property 9: T-Spin corner requirement**
*For any* T-piece position, a T-Spin should only be detected if at least 3 of the 4 diagonal corners adjacent to the T-piece center are occupied by blocks.
**Validates: Requirements 3.3**

**Property 10: T-Spin scoring consistency**
*For any* detected T-Spin, the bonus points awarded should be determined by the number of lines cleared (0 lines = mini bonus, 1 line = single bonus, 2 lines = double bonus, 3 lines = triple bonus).
**Validates: Requirements 3.2**

### Back-to-Back Properties

**Property 11: Difficult clear classification**
*For any* line clear, it should be classified as difficult if and only if it clears exactly 4 lines (Tetris) or is a T-Spin clear with at least 1 line.
**Validates: Requirements 4.1, 4.2**

**Property 12: Back-to-back activation**
*For any* sequence of two consecutive difficult clears with no non-difficult clears between them, the second clear should have the back-to-back multiplier applied.
**Validates: Requirements 4.3**

**Property 13: Back-to-back multiplier value**
*For any* clear with back-to-back bonus active, the final score should be 1.5 times the base score for that clear.
**Validates: Requirements 4.4**

**Property 14: Back-to-back reset**
*For any* back-to-back chain, when a non-difficult clear occurs, the back-to-back status should become inactive.
**Validates: Requirements 4.5**

### Perfect Clear Properties

**Property 15: Perfect clear detection**
*For any* line clear action, a perfect clear should be detected if and only if all cells in the grid contain zero (empty) after the lines are removed.
**Validates: Requirements 5.1**

**Property 16: Perfect clear scoring**
*For any* perfect clear, the bonus points should be calculated as (base value for lines cleared) × (current level).
**Validates: Requirements 5.2, 5.4**

### Integration Properties

**Property 17: Bonus stacking**
*For any* line clear that triggers multiple bonuses (T-Spin, back-to-back, perfect clear, fruit combo), the total score increase should equal the sum of all individual bonus values plus the base line clear value.
**Validates: Requirements 6.1, 6.2**

**Property 18: Score update synchronization**
*For any* bonus-triggering event, the score value should be updated before the next game state update.
**Validates: Requirements 6.3**

**Property 19: Game reset cleanup**
*For any* game reset action, the held piece should be null, back-to-back status should be false, and all bonus notification states should be cleared.
**Validates: Requirements 6.4**

**Property 20: High score persistence**
*For any* game over event, the saved high score should be greater than or equal to the final score including all bonuses if the final score exceeds the previous high score.
**Validates: Requirements 6.5**

## Error Handling

### Invalid State Handling

1. **Hold When Unavailable**: If `holdPiece()` is called when `canHold` is false, the function should return early without modifying state
2. **Ghost Calculation Errors**: If ghost piece calculation fails (e.g., no valid position), set `ghostPiece` to null rather than crashing
3. **T-Spin Detection Edge Cases**: Handle cases where T-piece is at board edges or top of playfield
4. **Score Overflow**: Ensure score calculations don't exceed JavaScript's safe integer limit (use appropriate checks)

### Boundary Conditions

1. **Top Spawn Collision**: When swapping hold piece, check if piece can spawn - if not, trigger game over
2. **Empty Board T-Spin**: T-Spin detection should handle empty boards gracefully (no corners filled = no T-Spin)
3. **Perfect Clear on First Piece**: Handle perfect clear detection even on the first piece placement
4. **Back-to-Back Chain Limits**: No upper limit on B2B chain count, but ensure counter doesn't overflow

### Validation

1. **Piece Type Validation**: Verify piece types are valid before hold operations
2. **Grid Bounds**: Ensure all corner checks for T-Spin stay within grid boundaries
3. **Score Calculation**: Validate all bonus multipliers are positive numbers
4. **State Consistency**: Ensure `lastMoveWasRotation` flag is properly cleared on non-rotation actions

## Testing Strategy

### Unit Testing

Unit tests will cover specific examples and edge cases:

1. **Hold Piece Tests**
   - Hold with empty slot
   - Hold with existing piece
   - Hold when unavailable (should fail)
   - Hold causing game over (piece can't spawn)

2. **Ghost Piece Tests**
   - Ghost at bottom of empty board
   - Ghost with obstacles
   - Ghost when piece is already at lowest position
   - Ghost update after rotation

3. **T-Spin Detection Tests**
   - Valid T-Spin with 3 corners filled
   - Invalid T-Spin with only 2 corners
   - T-Spin mini vs regular distinction
   - T-Spin at board edges
   - Non-rotation lock (should not detect T-Spin)

4. **Back-to-Back Tests**
   - Tetris → Tetris chain
   - T-Spin → T-Spin chain
   - T-Spin → Tetris chain
   - Chain break with single line clear
   - Chain break with no line clear

5. **Perfect Clear Tests**
   - Perfect clear with 1 line
   - Perfect clear with 4 lines (Tetris)
   - Near-perfect clear (1 block remaining)
   - Perfect clear on empty board (edge case)

6. **Integration Tests**
   - T-Spin + Back-to-Back + Fruit Combo
   - Perfect Clear + Back-to-Back
   - Multiple bonuses in sequence
   - Game reset clears all states
   - High score saves with bonuses

### Property-Based Testing

We will use **fast-check** (JavaScript property-based testing library) to verify universal properties across many randomly generated inputs.

**Configuration**: Each property test should run a minimum of 100 iterations to ensure thorough coverage of the input space.

**Test Tagging**: Each property-based test must include a comment tag in the format:
`// Feature: advanced-tetris-features, Property X: [property description]`

**Property Test Coverage**:

1. **Hold Properties** (Properties 1-4)
   - Generate random game states with various pieces
   - Test hold swap and spawn behaviors
   - Verify position and rotation invariants

2. **Ghost Properties** (Properties 5-7)
   - Generate random piece positions and board states
   - Verify ghost is always at lowest valid position
   - Test ghost updates after movements

3. **T-Spin Properties** (Properties 8-10)
   - Generate random board configurations
   - Place T-pieces in various positions and rotations
   - Verify corner detection algorithm
   - Test scoring calculations

4. **Back-to-Back Properties** (Properties 11-14)
   - Generate sequences of line clears
   - Verify difficult clear classification
   - Test B2B chain activation and breaking
   - Verify multiplier application

5. **Perfect Clear Properties** (Properties 15-16)
   - Generate board states near-empty
   - Test detection algorithm
   - Verify scoring calculations

6. **Integration Properties** (Properties 17-20)
   - Generate complex game scenarios
   - Test bonus stacking
   - Verify state cleanup
   - Test persistence

**Generator Strategies**:

- **Board State Generator**: Create partially filled boards with controlled density
- **Piece Position Generator**: Generate valid piece positions within board bounds
- **T-Piece Corner Generator**: Create board states with specific corner configurations
- **Clear Sequence Generator**: Generate sequences of line clears with varying types
- **Multi-Bonus Generator**: Create scenarios where multiple bonuses can trigger

### Testing Approach

- **Implementation-First**: Implement each feature before writing corresponding tests
- **Incremental Testing**: Test each feature independently before integration tests
- **Property Tests Priority**: Focus on property-based tests for core logic, use unit tests for specific edge cases
- **No Mocking**: Tests should validate real functionality without mocks or fake data

## Implementation Notes

### Performance Considerations

1. **Ghost Calculation**: Cache ghost position and only recalculate on piece movement/rotation
2. **T-Spin Detection**: Only check T-Spin conditions for T-pieces, skip for other types
3. **Corner Checks**: Optimize corner checking with early exit if fewer than 3 corners filled
4. **Notification Cleanup**: Use timeouts to clear notification objects and prevent memory leaks

### Visual Feedback

1. **T-Spin Notification**: Display "T-SPIN MINI/SINGLE/DOUBLE/TRIPLE" with animation similar to combo notification
2. **Back-to-Back Indicator**: Show "BACK-TO-BACK x2" badge in UI when active
3. **Perfect Clear Effect**: Full-screen flash effect with "PERFECT CLEAR!" text and particle effects
4. **Ghost Rendering**: Use 30% opacity for ghost piece, matching existing combo notification style

### Sound Effects

Leverage existing sound manager:
- T-Spin: Use existing `playCombo()` or add new `playTSpin()` sound
- Back-to-Back: Play pitch-shifted version of success sound
- Perfect Clear: Use existing `playTetris()` or add dramatic new sound
- Hold: Use existing `playMove()` sound

### Compatibility

- Maintain existing keyboard controls (C for hold already implemented)
- Ensure mobile touch controls work with hold button (already exists)
- Ghost piece should respect existing `settings.showGhost` flag
- All new features should work with existing fruit combo system without conflicts
