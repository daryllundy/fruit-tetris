# Implementation Plan

- [ ] 1. Create effects system foundation
  - [ ] 1.1 Create js/effects.js file with base class structures
    - Create Particle class with position, velocity, lifecycle properties
    - Create ParticleSystem class with particle management methods
    - Create ScreenShake class with shake state management
    - Create CelebrationManager class skeleton
    - _Requirements: 1.1, 1.4, 2.1, 3.1_

  - [ ]* 1.2 Write property test for particle physics simulation
    - **Property 4: Particle physics simulation**
    - **Validates: Requirements 1.4**

  - [ ]* 1.3 Write property test for particle lifecycle management
    - **Property 5: Particle lifecycle management**
    - **Validates: Requirements 1.5**

- [ ] 2. Implement particle system core functionality
  - [ ] 2.1 Implement Particle class with update and render methods
    - Add physics simulation (velocity, gravity, position updates)
    - Add lifecycle tracking (age, maxLife, expiration check)
    - Add rendering logic for both juice and sparkle types
    - Implement rotation and fade effects
    - _Requirements: 1.1, 1.3, 1.4, 1.5_

  - [ ] 2.2 Implement ParticleSystem particle management
    - Add createJuiceSplatter method with fruit color mapping
    - Add createSparkles method with variety in size/opacity
    - Add update method to process all active particles
    - Add render method to draw all particles
    - Implement maximum particle limit enforcement
    - Add particle cleanup for expired particles
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 4.1, 4.5_

  - [ ]* 2.3 Write property test for fruit color mapping consistency
    - **Property 2: Fruit color mapping consistency**
    - **Validates: Requirements 1.2**

  - [ ]* 2.4 Write property test for sparkle particle variety
    - **Property 3: Sparkle particle variety**
    - **Validates: Requirements 1.3**

  - [ ]* 2.5 Write property test for maximum particle count invariant
    - **Property 13: Maximum particle count invariant**
    - **Validates: Requirements 4.1**

- [ ] 3. Implement screen shake system
  - [ ] 3.1 Implement ScreenShake class core functionality
    - Add shake state tracking (active shakes, intensities, durations)
    - Implement shake method to trigger new shake effects
    - Implement addShake method for combining multiple shakes
    - Add update method to process shake decay over time
    - Implement getOffset method to calculate current viewport displacement
    - Add intensity bounds enforcement
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 3.2 Write property test for shake intensity bounds
    - **Property 8: Screen shake intensity bounds**
    - **Validates: Requirements 2.4**

  - [ ]* 3.3 Write property test for screen shake reset
    - **Property 9: Screen shake reset**
    - **Validates: Requirements 2.5**

  - [ ]* 3.4 Write property test for collision detection independence
    - **Property 14: Collision detection independence from visual effects**
    - **Validates: Requirements 4.3**

- [ ] 4. Implement celebration system
  - [ ] 4.1 Implement CelebrationManager class
    - Add triggerTetrisCelebration method for 4-line clears
    - Add triggerComboCelebration method with intensity scaling
    - Implement spawnFullScreenParticles for wide distribution
    - Add createColorBurst for multi-color effects
    - Integrate with ParticleSystem and ScreenShake
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 4.2 Write property test for combo celebration intensity scaling
    - **Property 10: Combo celebration intensity scaling**
    - **Validates: Requirements 3.2**

  - [ ]* 4.3 Write property test for celebration spatial distribution
    - **Property 11: Celebration spatial distribution**
    - **Validates: Requirements 3.3**

  - [ ]* 4.4 Write property test for high combo color variety
    - **Property 12: High combo color variety**
    - **Validates: Requirements 3.5**

- [ ] 5. Integrate effects system with renderer
  - [ ] 5.1 Modify TetrisRenderer to include effects systems
    - Add particleSystem property initialization in constructor
    - Add screenShake property initialization in constructor
    - Add celebrationManager property initialization in constructor
    - Update render method to include particle rendering
    - Apply screen shake offset to canvas context before rendering game elements
    - Ensure proper rendering order (particles behind pieces, shake applied to all)
    - _Requirements: 1.1, 2.1, 2.3, 4.4_

  - [ ] 5.2 Update renderer's update loop to process effects
    - Call particleSystem.update(deltaTime) in render method
    - Call screenShake.update(deltaTime) in render method
    - Ensure effects update before rendering
    - _Requirements: 1.4, 2.3_

- [ ] 6. Integrate effects triggers with game logic
  - [ ] 6.1 Add effect triggers to TetrisGame
    - Trigger juice splatter particles in startLineClear for each cleared line block
    - Trigger screen shake in startLineClear with intensity based on line count
    - Trigger Tetris celebration when 4 lines are cleared
    - Trigger screen shake in hardDrop method
    - _Requirements: 1.1, 2.1, 2.2, 3.1_

  - [ ] 6.2 Add combo celebration triggers
    - Track consecutive line clears in TetrisGame
    - Trigger combo celebration when combo count >= 3
    - Pass combo count and size to celebration manager
    - Reset combo counter when piece is placed without clearing lines
    - _Requirements: 3.2_

  - [ ]* 6.3 Write property test for line clear shake intensity scaling
    - **Property 6: Line clear shake intensity scaling**
    - **Validates: Requirements 2.2**

- [ ] 7. Add configuration and settings
  - [ ] 7.1 Add effects configuration to game settings
    - Add enableParticles boolean setting
    - Add enableScreenShake boolean setting
    - Add effectsIntensity multiplier (0.0 to 2.0)
    - Add maxParticles setting (default 500)
    - Update settings UI to include effects toggles
    - _Requirements: 4.1_

  - [ ] 7.2 Apply settings to effects systems
    - Check enableParticles before creating particles
    - Check enableScreenShake before triggering shakes
    - Apply effectsIntensity multiplier to all effect intensities
    - Pass maxParticles to ParticleSystem constructor
    - _Requirements: 4.1_

- [ ] 8. Performance optimization and polish
  - [ ] 8.1 Implement performance optimizations
    - Add object pooling for particle reuse
    - Implement viewport culling for off-screen particles
    - Add batch rendering for particles of same type
    - Optimize particle update loop
    - _Requirements: 4.1, 4.5_

  - [ ] 8.2 Add error handling and edge cases
    - Handle invalid fruit emoji colors with fallback
    - Clamp shake intensity and duration to valid ranges
    - Handle canvas context loss gracefully
    - Add development mode logging for debugging
    - _Requirements: 1.2, 2.1_

  - [ ]* 8.3 Write property test for particle memory cleanup
    - **Property 15: Particle memory cleanup**
    - **Validates: Requirements 4.5**

- [ ] 9. Testing and validation
  - [ ]* 9.1 Write unit tests for particle creation
    - Test particle spawning with various parameters
    - Test initial particle properties
    - Test edge cases (zero particles, maximum particles)
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ]* 9.2 Write unit tests for screen shake mechanics
    - Test shake triggering with different intensities
    - Test shake combination logic
    - Test shake expiration and reset
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 9.3 Write unit tests for celebration triggers
    - Test Tetris celebration activation
    - Test combo celebration thresholds
    - Test particle density calculations
    - _Requirements: 3.1, 3.2, 3.3_

- [ ] 10. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.
