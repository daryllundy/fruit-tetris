# Implementation Plan

- [x] 1. Add starting level selector UI to main menu
  - Add HTML range input control with label and value display to index.html
  - Add CSS styling for the selector to match existing menu aesthetics
  - Position selector prominently in the main menu between title and buttons
  - _Requirements: 1.1, 3.1, 3.2, 3.5, 6.1, 6.5_

- [x] 2. Implement starting level persistence
  - Add logic to save selected starting level to localStorage when changed
  - Add logic to load saved starting level on game initialization
  - Set default value to 1 when no saved preference exists
  - Handle localStorage errors gracefully with fallback to default
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3. Modify TetrisGame class to accept starting level
  - Update `start()` method to accept optional `startingLevel` parameter with default value 1
  - Update `reset()` method to accept optional `startingLevel` parameter with default value 1
  - Add input validation to constrain starting level to range [1, 15]
  - Store starting level in game state for display purposes
  - Ensure lines counter always starts at 0 regardless of starting level
  - Call `updateDropSpeed()` after setting level to apply correct fall speed
  - _Requirements: 1.3, 1.4, 1.5, 3.3, 3.4, 5.1_

- [x] 4. Wire up UI events in TetrisApp
  - Add event listener for starting level selector input events
  - Update displayed value in real-time as selector changes
  - Save to localStorage when selector value changes
  - Load saved starting level on app initialization and set selector value
  - Pass selected starting level to `game.start()` when play button is clicked
  - _Requirements: 1.2, 6.2, 6.4_

- [x] 5. Write property-based tests for starting level feature
  - Set up fast-check testing library with minimum 100 iterations per property
  - Create custom arbitraries for level values (1-15) and invalid levels

- [x] 5.1 Write property test for game initialization
  - **Property 1: Game initialization respects starting level**
  - **Validates: Requirements 1.3, 1.4, 1.5**

- [x] 5.2 Write property test for selector display updates
  - **Property 2: Selector updates display**
  - **Validates: Requirements 1.2, 6.2**
  - Note: This requires DOM testing which may need a different approach or browser environment

- [x] 5.3 Write property test for persistence round-trip
  - **Property 3: Persistence round-trip**
  - **Validates: Requirements 2.1, 2.2, 2.4**

- [x] 5.4 Write property test for lines counter initialization
  - **Property 4: Lines counter initialization**
  - **Validates: Requirements 5.1**
  - Note: Covered by testStartingLevelInitialization

- [x] 5.5 Write property test for score multiplier scaling
  - **Property 5: Score multiplier scales with level**
  - **Validates: Requirements 4.2, 4.4**

- [x] 5.6 Write property test for level progression
  - **Property 6: Level progression from starting level**
  - **Validates: Requirements 5.2**

- [x] 5.7 Write property test for drop speed formula
  - **Property 7: Drop speed formula consistency**
  - **Validates: Requirements 4.1**
  - Note: Partially covered by testDropSpeedFormula

- [x] 6. Complete remaining property-based tests
  - Add property test for persistence round-trip (Property 3)
  - Add property test for score multiplier scaling (Property 5)
  - Improve drop speed formula test to verify exact formula
  - _Requirements: 2.1, 2.2, 2.4, 4.1, 4.2, 4.4_

- [x] 7. Write unit tests for edge cases and specific scenarios
  - Test default starting level is 1 when no preference saved
  - Test localStorage failure handling
  - Test selector min/max attributes are correct (DOM test)
  - Test starting at level 10 and clearing 10 lines advances to level 11
  - Test game over screen displays both starting and final level (DOM test)
  - _Requirements: 2.3, 2.5, 3.1, 3.2, 3.3, 3.4, 5.4, 5.5_

- [x] 8. Add starting level display to game over screen
  - Modify game over screen HTML to show starting level
  - Update TetrisApp to display starting level alongside final level
  - Style the display to clearly differentiate starting vs final level
  - _Requirements: 5.5_

- [x] 9. Checkpoint - Ensure all tests pass
  - Run all property-based tests and verify they pass
  - Run all unit tests and verify they pass
  - Ask the user if questions arise
