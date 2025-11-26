# Requirements Document

## Introduction

This feature adds three distinct game modes to the Fruit Tetris game: Sprint Mode (speed-focused line clearing), Marathon Mode (endurance with progressive difficulty), and Zen Mode (relaxed practice without game over). These modes provide players with varied gameplay experiences catering to different skill levels and play styles, enhancing replayability and player engagement.

## Glossary

- **Game Mode**: A distinct ruleset and win/loss condition that defines how the Tetris game is played
- **Sprint Mode**: A time-trial game mode where the player races to clear a fixed number of lines
- **Marathon Mode**: An endurance game mode where the player progresses through increasing difficulty levels until reaching a target level or failing
- **Zen Mode**: A practice game mode with no failure condition, allowing unlimited play
- **Line Clear**: The removal of a complete horizontal row of blocks from the game board
- **Level**: A difficulty tier that affects piece fall speed and scoring multipliers
- **Game Over**: The failure state when a newly spawned piece cannot be placed on the board
- **Tetris Game**: The core game system managing board state, piece placement, and game rules
- **Game State**: The current status of a game session (playing, paused, completed, failed)

## Requirements

### Requirement 1

**User Story:** As a competitive player, I want to play Sprint Mode, so that I can challenge myself to clear lines as quickly as possible and improve my speed.

#### Acceptance Criteria

1. WHEN a user selects Sprint Mode THEN the Tetris Game SHALL initialize with a line clear goal of 40 lines
2. WHEN Sprint Mode starts THEN the Tetris Game SHALL start a timer that counts upward from zero
3. WHEN the player clears the 40th line THEN the Tetris Game SHALL stop the timer and display the completion time
4. WHEN the player clears the 40th line THEN the Tetris Game SHALL mark the game state as completed
5. WHEN the player achieves a new personal best time THEN the Tetris Game SHALL save the completion time to persistent storage

### Requirement 2

**User Story:** As a player seeking progression, I want to play Marathon Mode, so that I can experience increasing difficulty and test my endurance skills.

#### Acceptance Criteria

1. WHEN a user selects Marathon Mode THEN the Tetris Game SHALL initialize at level 1 with a target level of 15
2. WHEN the player clears 10 lines THEN the Tetris Game SHALL increment the current level by 1
3. WHEN the level increases THEN the Tetris Game SHALL increase the piece fall speed according to the level progression formula
4. WHEN the player reaches level 15 THEN the Tetris Game SHALL mark the game state as completed
5. WHEN a newly spawned piece cannot be placed on the board THEN the Tetris Game SHALL trigger game over

### Requirement 3

**User Story:** As a casual player or beginner, I want to play Zen Mode, so that I can practice without pressure and enjoy the game at my own pace.

#### Acceptance Criteria

1. WHEN a user selects Zen Mode THEN the Tetris Game SHALL initialize with no win or loss conditions
2. WHEN a newly spawned piece cannot be placed on the board in Zen Mode THEN the Tetris Game SHALL clear the top rows to make space
3. WHEN the board is cleared in Zen Mode THEN the Tetris Game SHALL allow the current piece to be placed
4. WHEN the player clears lines in Zen Mode THEN the Tetris Game SHALL award points using the standard scoring system
5. WHEN the player pauses or exits Zen Mode THEN the Tetris Game SHALL allow resuming from the same state

### Requirement 4

**User Story:** As a player, I want to select my preferred game mode before starting, so that I can choose the experience that matches my current mood and skill level.

#### Acceptance Criteria

1. WHEN the game loads THEN the Tetris Game SHALL display a mode selection interface with all available game modes
2. WHEN a user selects a game mode THEN the Tetris Game SHALL initialize the game session with the selected mode's ruleset
3. WHEN a game session ends THEN the Tetris Game SHALL return the player to the mode selection interface
4. WHERE the player is in an active game session THEN the Tetris Game SHALL display the current mode name in the user interface
5. WHEN the player selects a different mode THEN the Tetris Game SHALL reset all game state before initializing the new mode

### Requirement 5

**User Story:** As a player, I want to see mode-specific statistics and progress, so that I can track my performance in each game mode.

#### Acceptance Criteria

1. WHEN playing Sprint Mode THEN the Tetris Game SHALL display the current elapsed time and remaining lines
2. WHEN playing Marathon Mode THEN the Tetris Game SHALL display the current level, target level, and lines until next level
3. WHEN playing Zen Mode THEN the Tetris Game SHALL display the total lines cleared and current score
4. WHEN a game mode session completes THEN the Tetris Game SHALL display a summary screen with final statistics
5. WHEN the player views their statistics THEN the Tetris Game SHALL show personal best records for Sprint Mode and highest level reached in Marathon Mode

### Requirement 6

**User Story:** As a player, I want each game mode to feel distinct, so that I have varied and engaging gameplay experiences.

#### Acceptance Criteria

1. WHEN playing Sprint Mode THEN the Tetris Game SHALL use a fixed fall speed optimized for fast play
2. WHEN playing Marathon Mode THEN the Tetris Game SHALL progressively increase difficulty with each level advancement
3. WHEN playing Zen Mode THEN the Tetris Game SHALL use a comfortable fall speed that does not increase
4. WHEN the player completes a mode-specific objective THEN the Tetris Game SHALL play a unique completion sound or visual effect
5. WHERE a game mode has unique mechanics THEN the Tetris Game SHALL display mode-specific instructions or tooltips
