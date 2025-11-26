# Implementation Plan

- [ ] 1. Create game mode system architecture
  - Create `js/game-modes.js` file with base `GameMode` class and mode implementations (SprintMode, MarathonMode, ZenMode)
  - Implement `GameModeFactory` for mode creation
  - Add mode lifecycle methods (initialize, update, onLineClear, onPieceLock, reset)
  - Add win/loss condition checking methods
  - Add statistics tracking and display methods
  - _Requirements: 1.1, 2.1, 3.1, 4.2_

- [ ] 1.1 Write property test for mode initialization
  - **Property 7: Mode initialization**
  - **Validates: Requirements 4.2**

- [ ] 2. Implement Sprint Mode logic
  - Implement SprintMode class with 40-line target
  - Add timer tracking (start, update, stop)
  - Implement completion detection on line clear
  - Add best time persistence to localStorage
  - Set fixed drop speed of 500ms
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.1_

- [ ] 2.1 Write property test for personal best persistence
  - **Property 1: Personal best time persistence**
  - **Validates: Requirements 1.5**

- [ ] 3. Implement Marathon Mode logic
  - Implement MarathonMode class with level 15 target
  - Add level progression (10 lines per level)
  - Implement speed increase formula
  - Add completion detection at level 15
  - Add highest level persistence to localStorage
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 6.2_

- [ ] 3.1 Write property test for level progression
  - **Property 2: Marathon level progression**
  - **Validates: Requirements 2.2, 2.3**

- [ ] 3.2 Write property test for spawn collision game over
  - **Property 3: Game over on spawn collision**
  - **Validates: Requirements 2.5**

- [ ] 4. Implement Zen Mode logic
  - Implement ZenMode class with no win/loss conditions
  - Add top row clearing mechanism when spawn fails
  - Set fixed drop speed of 800ms
  - Override game over behavior to trigger recovery
  - Ensure standard scoring applies
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 6.3_

- [ ] 4.1 Write property test for Zen mode recovery
  - **Property 4: Zen mode recovery**
  - **Validates: Requirements 3.2, 3.3**

- [ ] 4.2 Write property test for Zen mode scoring
  - **Property 5: Zen mode scoring consistency**
  - **Validates: Requirements 3.4**

- [ ] 4.3 Write property test for Zen mode state persistence
  - **Property 6: Zen mode state persistence**
  - **Validates: Requirements 3.5**

- [ ] 5. Integrate modes into TetrisGame class
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

- [ ] 5.1 Write property test for mode transition state reset
  - **Property 8: Mode transition state reset**
  - **Validates: Requirements 4.3, 4.5**

- [ ] 6. Create mode selection UI
  - Add mode selection screen HTML in `index.html`
  - Create mode selection cards for each mode (icon, name, description, best record)
  - Add click handlers to mode selection buttons
  - Style mode selection screen with CSS
  - _Requirements: 4.1, 4.2_

- [ ] 7. Update main menu and navigation
  - Modify main menu to show "Select Mode" instead of direct "Play"
  - Update TetrisApp to handle mode selection flow
  - Add "Change Mode" button to pause menu
  - Implement navigation from game end back to mode selection
  - _Requirements: 4.1, 4.3_

- [ ] 8. Implement mode-specific HUD elements
  - Add mode name display to game HUD
  - Create mode-specific stats panel component
  - Implement Sprint mode timer display (MM:SS.ms format)
  - Implement Marathon mode progress display (level X/15, lines until next)
  - Implement Zen mode stats display (total lines, score)
  - Update renderer to show mode-specific stats
  - _Requirements: 4.4, 5.1, 5.2, 5.3_

- [ ] 8.1 Write property test for active mode display
  - **Property 9: Active mode display**
  - **Validates: Requirements 4.4**

- [ ] 9. Create mode completion screen
  - Add completion screen HTML overlay
  - Implement completion screen display logic
  - Show final statistics (score, lines, mode-specific stats)
  - Display personal best indicator
  - Add "Play Again", "Change Mode", and "Quit" buttons
  - Style completion screen with celebratory design
  - _Requirements: 5.4, 5.5_

- [ ] 9.1 Write property test for completion summary
  - **Property 10: Mode completion summary**
  - **Validates: Requirements 5.4**

- [ ] 9.2 Write property test for completion feedback
  - **Property 11: Mode completion feedback**
  - **Validates: Requirements 6.4**

- [ ] 10. Add success sound effect
  - Add success sound file to `client/public/sounds/` (or use existing success.mp3)
  - Add `playSuccess()` method to SoundManager
  - Call success sound on mode completion
  - _Requirements: 6.4_

- [ ] 11. Update statistics display
  - Modify stats panel to show mode-specific information
  - Add personal best displays for Sprint and Marathon
  - Ensure stats update in real-time during gameplay
  - Format time display for Sprint mode (MM:SS.ms)
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [ ] 12. Add visual feedback for Zen mode recovery
  - Implement animation for top row clearing in Zen mode
  - Add gentle visual effect when recovery triggers
  - Ensure animation completes before piece placement
  - _Requirements: 3.2, 6.4_

- [ ] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Polish and refinement
  - Test all three modes end-to-end
  - Verify mobile controls work in all modes
  - Ensure smooth transitions between screens
  - Verify statistics persistence across sessions
  - Test edge cases (localStorage unavailable, rapid mode switching)
  - _Requirements: All_

- [ ] 14.1 Write unit tests for edge cases
  - Test invalid mode type defaults to Marathon
  - Test localStorage unavailable graceful degradation
  - Test Zen mode recovery with insufficient space
  - Test mode switching during active game
  - Test statistics with corrupted data

- [ ] 15. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
