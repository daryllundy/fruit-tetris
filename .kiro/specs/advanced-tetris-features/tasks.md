# Implementation Plan

- [ ] 1. Enhance hold piece system with improved state tracking
  - Add visual feedback for hold availability status
  - Ensure hold piece display is properly integrated
  - Add sound effect for hold action
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]* 1.1 Write property test for hold swap consistency
  - **Property 1: Hold swap consistency**
  - **Validates: Requirements 1.1**

- [ ]* 1.2 Write property test for hold spawn consistency
  - **Property 2: Hold spawn consistency**
  - **Validates: Requirements 1.2**

- [ ]* 1.3 Write property test for hold lock prevention
  - **Property 3: Hold lock prevention**
  - **Validates: Requirements 1.3**

- [ ]* 1.4 Write property test for hold spawn position invariant
  - **Property 4: Hold spawn position invariant**
  - **Validates: Requirements 1.4**

- [ ] 2. Implement ghost piece rendering improvements
  - Verify ghost piece calculation is working correctly
  - Ensure ghost piece updates on all piece movements and rotations
  - Add proper opacity rendering for ghost piece
  - Handle edge case where ghost overlaps current piece
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]* 2.1 Write property test for ghost piece lowest position
  - **Property 5: Ghost piece lowest position**
  - **Validates: Requirements 2.1**

- [ ]* 2.2 Write property test for ghost piece update consistency
  - **Property 6: Ghost piece update consistency**
  - **Validates: Requirements 2.2**

- [ ]* 2.3 Write property test for ghost piece cleanup
  - **Property 7: Ghost piece cleanup**
  - **Validates: Requirements 2.5**

- [ ] 3. Implement T-Spin detection system
  - Add `lastMoveWasRotation` flag to track rotation actions
  - Implement corner detection algorithm for T-pieces
  - Create `checkTSpin()` method to detect T-Spin conditions
  - Distinguish between mini T-Spin and regular T-Spin
  - Integrate T-Spin detection into `lockPiece()` method
  - _Requirements: 3.1, 3.2, 3.3_

- [ ]* 3.1 Write property test for T-Spin rotation requirement
  - **Property 8: T-Spin rotation requirement**
  - **Validates: Requirements 3.1**

- [ ]* 3.2 Write property test for T-Spin corner requirement
  - **Property 9: T-Spin corner requirement**
  - **Validates: Requirements 3.3**

- [ ]* 3.3 Write property test for T-Spin scoring consistency
  - **Property 10: T-Spin scoring consistency**
  - **Validates: Requirements 3.2**

- [ ]* 3.4 Write unit tests for T-Spin edge cases
  - Test T-Spin at board edges
  - Test T-Spin with various corner configurations
  - Test mini vs regular T-Spin distinction
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 4. Implement T-Spin scoring and visual feedback
  - Add T-Spin bonus point calculations
  - Create T-Spin notification system
  - Add visual notification for T-Spin Single, Double, Triple
  - Integrate T-Spin scoring with existing score system
  - _Requirements: 3.4, 3.5, 3.6, 3.7_

- [ ] 5. Implement back-to-back bonus system
  - Add `backToBackActive` and `backToBackCount` state properties
  - Create `calculateDifficultClear()` method to classify clears
  - Implement back-to-back chain tracking logic
  - Add back-to-back multiplier to score calculations
  - Handle back-to-back chain reset on non-difficult clears
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 5.1 Write property test for difficult clear classification
  - **Property 11: Difficult clear classification**
  - **Validates: Requirements 4.1, 4.2**

- [ ]* 5.2 Write property test for back-to-back activation
  - **Property 12: Back-to-back activation**
  - **Validates: Requirements 4.3**

- [ ]* 5.3 Write property test for back-to-back multiplier value
  - **Property 13: Back-to-back multiplier value**
  - **Validates: Requirements 4.4**

- [ ]* 5.4 Write property test for back-to-back reset
  - **Property 14: Back-to-back reset**
  - **Validates: Requirements 4.5**

- [ ] 6. Add back-to-back visual feedback
  - Create back-to-back notification display
  - Add back-to-back status indicator in UI
  - Implement animation for back-to-back bonus
  - _Requirements: 4.6_

- [ ] 7. Implement perfect clear detection and scoring
  - Create `checkPerfectClear()` method to detect empty board
  - Add perfect clear bonus point calculations
  - Scale perfect clear bonus by level and lines cleared
  - Integrate perfect clear detection into line clear flow
  - _Requirements: 5.1, 5.2, 5.4_

- [ ]* 7.1 Write property test for perfect clear detection
  - **Property 15: Perfect clear detection**
  - **Validates: Requirements 5.1**

- [ ]* 7.2 Write property test for perfect clear scoring
  - **Property 16: Perfect clear scoring**
  - **Validates: Requirements 5.2, 5.4**

- [ ]* 7.3 Write unit tests for perfect clear edge cases
  - Test perfect clear with 1 line
  - Test perfect clear with 4 lines (Tetris)
  - Test near-perfect clear (should not trigger)
  - _Requirements: 5.1, 5.2, 5.4_

- [ ] 8. Add perfect clear visual and audio feedback
  - Create perfect clear notification with special effects
  - Add full-screen flash effect for perfect clear
  - Implement particle effects or animation
  - Add unique sound effect for perfect clear
  - _Requirements: 5.3, 5.5_

- [ ] 9. Integrate all bonus systems with existing mechanics
  - Ensure T-Spin, back-to-back, and perfect clear work with fruit combos
  - Update `updateScore()` to handle all bonus types simultaneously
  - Verify bonus stacking calculations are correct
  - Test that multiple bonuses can trigger on same clear
  - _Requirements: 6.1, 6.2_

- [ ]* 9.1 Write property test for bonus stacking
  - **Property 17: Bonus stacking**
  - **Validates: Requirements 6.1, 6.2**

- [ ]* 9.2 Write property test for score update synchronization
  - **Property 18: Score update synchronization**
  - **Validates: Requirements 6.3**

- [ ]* 9.3 Write integration tests for multiple bonus scenarios
  - Test T-Spin + Back-to-Back + Fruit Combo
  - Test Perfect Clear + Back-to-Back
  - Test various bonus combinations
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 10. Implement game state management for new features
  - Add all new state properties to game reset logic
  - Ensure held piece is cleared on reset
  - Clear all bonus states (T-Spin, back-to-back, perfect clear)
  - Clear all notification states on reset
  - Verify high score includes all bonuses on game over
  - _Requirements: 6.4, 6.5_

- [ ]* 10.1 Write property test for game reset cleanup
  - **Property 19: Game reset cleanup**
  - **Validates: Requirements 6.4**

- [ ]* 10.2 Write property test for high score persistence
  - **Property 20: High score persistence**
  - **Validates: Requirements 6.5**

- [ ] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Polish and refinement
  - Adjust notification timing and animations
  - Fine-tune visual effects for all bonuses
  - Verify sound effects play at appropriate times
  - Test on mobile devices for touch control compatibility
  - Ensure all features work seamlessly together
  - _Requirements: All_
