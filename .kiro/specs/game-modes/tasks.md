# Implementation Plan

- [x] 1. Create game mode system architecture
  - Create `js/game-modes.js` file with base `GameMode` class and mode implementations (SprintMode, MarathonMode, ZenMode)
  - Implement `GameModeFactory` for mode creation
  - Add mode lifecycle methods (initialize, update, onLineClear, onPieceLock, reset)
  - Add win/loss condition checking methods
  - Add statistics tracking and display methods
  - _Requirements: 1.1, 2.1, 3.1, 4.2_

- [x] 1.1 Write property test for mode initialization
  - **Property 7: Mode initialization**
  - **Validates: Requirements 4.2**

- [x] 2. Implement Sprint Mode logic
  - Implement SprintMode class with 40-line target
  - Add timer tracking (start, update, stop)
  - Implement completion detection on line clear
  - Add best time persistence to localStorage
  - Set fixed drop speed of 500ms
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.1_

- [x] 2.1 Write property test for personal best persistence
  - **Property 1: Personal best time persistence**
  - **Validates: Requirements 1.5**

- [x] 3. Implement Marathon Mode logic
  - Implement MarathonMode class with level 15 target
  - Add level progression (10 lines per level)
  - Implement speed increase formula
  - Add completion detection at level 15
  - Add highest level persistence to localStorage
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 6.2_

- [x] 3.1 Write property test for level progression
  - **Property 2: Marathon level progression**
  - **Validates: Requirements 2.2, 2.3**

- [x] 3.2 Write property test for spawn collision game over
  - **Property 3: Game over on spawn collision**
  - **Validates: Requirements 2.5**

- [x] 4. Implement Zen Mode logic
  - Implement ZenMode class with no win/loss conditions
  - Add top row clearing mechanism when spawn fails
  - Set fixed drop speed of 800ms
  - Override game over behavior to trigger recovery
  - Ensure standard scoring applies
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 6.3_

- [x] 4.1 Write property test for Zen mode recovery
  - **Property 4: Zen mode recovery**
  - **Validates: Requirements 3.2, 3.3**

- [x] 4.2 Write property test for Zen mode scoring
  - **Property 5: Zen mode scoring consistency**
  - **Validates: Requirements 3.4**

- [x] 4.3 Write property test for Zen mode state persistence
  - **Property 6: Zen mode state persistence**
  - **Validates: Requirements 3.5**

- [x] 5. Integrate modes into TetrisGame class
  - Add `currentMode` and `modeType` properties to TetrisGame
  - Implement `setMode()` method
  - Modify `start()` to accept mode parameter and initialize mode
  - Update `update()` to call mode update and check win conditions
  - Modify `completeLinesClearing()` to notify mode of line clears
  - Modify `lockPiece()` to notify mode of piece locks
  - Update `gameOver()` to handle mode-specific behavior
  - Add `handleModeComplete()` method for mode completion
  - Modify `updateDropSpeed()` to respect mode speed settings
  - _Requirements: 1.1, 1.2, 1.3, 2.2, 2.3, 3.2, 4.2_

- [x] 5.1 Write property test for mode transition state reset
  - **Property 8: Mode transition state reset**
  - **Validates: Requirements 4.3, 4.5**

- [x] 6. Add missing TetrisGame methods
  - Add `handleModeComplete()` method to handle mode completion
  - Update `gameOver()` to check for Zen mode recovery via `triggerRecovery()`
  - Ensure `update()` checks win conditions via `currentMode.checkWinCondition()`
  - _Requirements: 1.3, 1.4, 2.4, 3.2_

- [x] 7. Create mode selection UI and navigation
  - Add click handlers for mode selection cards in `index.html`
  - Update main menu "Play" button to show mode selection screen
  - Implement `loadBestScores()` method in TetrisApp to display best records
  - Add "Back" button handler for mode selection screen
  - Add "Change Mode" button handler in game over screen
  - Update `startGame(mode)` to accept mode parameter
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 8. Implement mode-specific HUD updates
  - Update `updateHUDLayout(mode)` to show/hide mode-specific UI elements
  - Implement Sprint timer display updates in `updateUI()`
  - Implement Marathon progress display (level X/15, lines until next)
  - Add mode name display update
  - Format time display for Sprint mode (MM:SS.ms format)
  - _Requirements: 4.4, 5.1, 5.2, 5.3_

- [x] 8.1 Write property test for active mode display
  - **Property 9: Active mode display**
  - **Validates: Requirements 4.4**

- [x] 9. Update game over screen for mode completion
  - Modify `showGameOver()` to handle 'completed' state differently
  - Display mode-specific completion stats (time for Sprint, level for Marathon)
  - Show personal best indicator when new record is achieved
  - Update game over title to show "COMPLETED!" for wins
  - _Requirements: 5.4, 5.5_

- [x] 9.1 Write property test for completion summary
  - **Property 10: Mode completion summary**
  - **Validates: Requirements 5.4**

- [x] 9.2 Write property test for completion feedback
  - **Property 11: Mode completion feedback**
  - **Validates: Requirements 6.4**

- [x] 10. Add success sound effect
  - Verify `playSuccess()` method exists in SoundManager
  - Call success sound in `handleModeComplete()` method
  - _Requirements: 6.4_

- [x] 11. Add visual feedback for Zen mode recovery
  - Add visual effect in renderer when Zen mode recovery triggers
  - Play gentle sound effect during recovery
  - _Requirements: 3.2, 6.4_

- [x] 12. Write remaining property tests
  - Write property test for level progression (Property 2)
  - Write property test for spawn collision game over (Property 3)
  - Write property test for Zen mode scoring (Property 5)
  - Write property test for Zen mode state persistence (Property 6)

- [x] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
