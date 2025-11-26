# Requirements Document

## Introduction

This feature adds visual polish and juice to the Fruit Tetris game through particle effects, screen shake, and celebration animations. These enhancements will provide immediate visual feedback for player actions and achievements, making the game feel more responsive and satisfying to play.

## Glossary

- **Game Canvas**: The HTML5 Canvas element where the Tetris game is rendered
- **Particle System**: A collection of small graphical elements that simulate effects like explosions or sparkles
- **Screen Shake**: A brief camera/viewport displacement effect that creates impact
- **Hard Drop**: When a player instantly drops a tetromino to the bottom of the playfield
- **Line Clear**: When a player completes one or more horizontal rows
- **Tetris**: A special line clear where exactly 4 lines are cleared simultaneously
- **Combo**: Multiple consecutive line clears without placing a piece that doesn't clear lines
- **Juice Splatter**: Particle effect simulating liquid fruit juice spreading outward
- **Sparkle**: Small bright particle that twinkles or glows

## Requirements

### Requirement 1

**User Story:** As a player, I want to see fruit explosion animations when I clear lines, so that I get satisfying visual feedback for my achievements.

#### Acceptance Criteria

1. WHEN a line is cleared THEN the Game Canvas SHALL render juice splatter particles emanating from each fruit block in the cleared line
2. WHEN juice splatter particles are created THEN the Particle System SHALL assign colors matching the fruit emoji type being cleared
3. WHEN sparkle particles are generated THEN the Particle System SHALL render them with varying sizes and opacity values
4. WHEN particles are active THEN the Particle System SHALL update their positions based on velocity and gravity over time
5. WHEN particles exceed their lifespan THEN the Particle System SHALL remove them from the active particle collection

### Requirement 2

**User Story:** As a player, I want the screen to shake when I perform impactful actions, so that the game feels more responsive and dynamic.

#### Acceptance Criteria

1. WHEN a player executes a hard drop THEN the Game Canvas SHALL apply a screen shake effect with subtle intensity
2. WHEN a line clear occurs THEN the Game Canvas SHALL apply a screen shake effect with intensity proportional to the number of lines cleared
3. WHEN a screen shake is triggered THEN the Game Canvas SHALL displace the viewport in random directions for the duration of the effect
4. WHEN multiple screen shake effects are triggered simultaneously THEN the Game Canvas SHALL combine their intensities without exceeding maximum displacement bounds
5. WHEN a screen shake effect completes THEN the Game Canvas SHALL return the viewport to its original position

### Requirement 3

**User Story:** As a player, I want to see special celebration animations for exceptional achievements, so that my accomplishments feel rewarding and memorable.

#### Acceptance Criteria

1. WHEN a player clears exactly 4 lines simultaneously THEN the Particle System SHALL trigger a Tetris celebration animation with enhanced particle density
2. WHEN a player achieves a combo of 3 or more consecutive line clears THEN the Particle System SHALL trigger a combo celebration animation with intensity scaling to combo count
3. WHEN a celebration animation is active THEN the Particle System SHALL render particles across the entire playfield rather than just cleared lines
4. WHEN a Tetris celebration occurs THEN the Particle System SHALL include both juice splatter and sparkle particles with increased velocity
5. WHEN a high combo celebration occurs THEN the Particle System SHALL render particles with colors representing multiple fruit types

### Requirement 4

**User Story:** As a player, I want visual effects to perform smoothly without impacting gameplay, so that the game remains responsive and playable.

#### Acceptance Criteria

1. WHEN particle effects are rendering THEN the Particle System SHALL limit the maximum number of active particles to prevent performance degradation
2. WHEN the frame rate drops below 30 FPS THEN the Particle System SHALL reduce particle spawn rates to maintain performance
3. WHEN screen shake is active THEN the Game Canvas SHALL maintain accurate collision detection and input handling at the original viewport position
4. WHEN multiple effects are active simultaneously THEN the Game Canvas SHALL render all game elements in the correct layering order
5. WHEN effects complete THEN the Particle System SHALL release allocated resources to prevent memory leaks
