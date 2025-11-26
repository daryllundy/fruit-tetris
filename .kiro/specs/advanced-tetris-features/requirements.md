# Requirements Document

## Introduction

This specification defines advanced gameplay features for the Fruit Tetris game to enhance competitive play and provide deeper strategic mechanics. These features include Hold Piece functionality, Ghost Piece Preview, T-Spin detection with bonus scoring, Back-to-Back bonus chains, and Perfect Clear rewards. These mechanics are standard in modern Tetris implementations and significantly increase the skill ceiling while maintaining accessibility for casual players.

## Glossary

- **Tetris Game**: The Fruit Tetris browser-based game system
- **Tetromino**: A game piece composed of four connected blocks in various shapes (I, O, T, S, Z, J, L)
- **T-Piece**: The T-shaped tetromino specifically
- **Hold Piece**: A reserved storage slot where players can save one tetromino for later use
- **Ghost Piece**: A transparent preview showing where the current piece will land
- **T-Spin**: An advanced move where a T-piece is rotated into a tight space, often using wall kicks
- **Back-to-Back**: Consecutive special moves (Tetrises or T-Spins) without regular line clears in between
- **Perfect Clear**: Completely clearing all blocks from the playfield
- **Playfield**: The 10×20 grid where tetrominoes are placed
- **Wall Kick**: The system that allows pieces to shift position during rotation when blocked
- **Line Clear**: The removal of one or more completed horizontal rows
- **Lock**: The moment when a falling piece becomes fixed to the playfield

## Requirements

### Requirement 1

**User Story:** As a player, I want to hold a piece for later use, so that I can save pieces strategically and optimize my placement options.

#### Acceptance Criteria

1. WHEN a player presses the hold key THEN the Tetris Game SHALL swap the current tetromino with the held tetromino
2. WHERE no piece is currently held, WHEN a player presses the hold key THEN the Tetris Game SHALL store the current tetromino and spawn the next piece
3. WHEN a player uses the hold function THEN the Tetris Game SHALL prevent holding again until the current piece locks
4. WHEN a held piece is swapped in THEN the Tetris Game SHALL spawn it at the standard starting position with default rotation
5. WHEN the hold function is used THEN the Tetris Game SHALL display the held piece in a dedicated UI area

### Requirement 2

**User Story:** As a player, I want to see a ghost piece showing where my current piece will land, so that I can make precise placements without trial and error.

#### Acceptance Criteria

1. WHEN a tetromino is active THEN the Tetris Game SHALL display a ghost piece at the lowest valid position
2. WHEN the current piece moves or rotates THEN the Tetris Game SHALL update the ghost piece position immediately
3. WHEN rendering the ghost piece THEN the Tetris Game SHALL display it with reduced opacity to distinguish it from the active piece
4. WHEN the ghost piece overlaps the current piece position THEN the Tetris Game SHALL hide the ghost piece
5. WHERE ghost piece display is enabled, WHEN a piece locks THEN the Tetris Game SHALL remove the ghost piece from display

### Requirement 3

**User Story:** As an advanced player, I want T-Spin moves to be detected and rewarded, so that I can execute advanced techniques for higher scores.

#### Acceptance Criteria

1. WHEN a T-piece locks after its last action was a rotation THEN the Tetris Game SHALL check for T-Spin conditions
2. WHEN a T-Spin is detected THEN the Tetris Game SHALL award bonus points based on lines cleared
3. WHEN checking T-Spin validity THEN the Tetris Game SHALL verify that at least three of the four diagonal corners adjacent to the T-piece center are occupied
4. WHEN a T-Spin clears one line THEN the Tetris Game SHALL award T-Spin Single bonus points
5. WHEN a T-Spin clears two lines THEN the Tetris Game SHALL award T-Spin Double bonus points
6. WHEN a T-Spin clears three lines THEN the Tetris Game SHALL award T-Spin Triple bonus points
7. WHEN a T-Spin is executed THEN the Tetris Game SHALL display a visual notification indicating the T-Spin type

### Requirement 4

**User Story:** As a competitive player, I want back-to-back bonuses for consecutive difficult clears, so that I am rewarded for maintaining high-level play.

#### Acceptance Criteria

1. WHEN a player clears four lines (Tetris) THEN the Tetris Game SHALL mark this as a difficult clear
2. WHEN a player executes any T-Spin clear THEN the Tetris Game SHALL mark this as a difficult clear
3. WHEN a difficult clear follows another difficult clear without any non-difficult clears between them THEN the Tetris Game SHALL apply a back-to-back multiplier
4. WHEN a back-to-back bonus is active THEN the Tetris Game SHALL increase the score by fifty percent
5. WHEN a non-difficult clear occurs THEN the Tetris Game SHALL reset the back-to-back status
6. WHEN a back-to-back bonus is active THEN the Tetris Game SHALL display the back-to-back status in the UI

### Requirement 5

**User Story:** As a skilled player, I want to receive a massive bonus for perfect clears, so that I am rewarded for the extremely difficult achievement of clearing the entire board.

#### Acceptance Criteria

1. WHEN a line clear results in zero blocks remaining on the playfield THEN the Tetris Game SHALL detect a perfect clear
2. WHEN a perfect clear is detected THEN the Tetris Game SHALL award bonus points scaled by the current level
3. WHEN a perfect clear occurs THEN the Tetris Game SHALL display a special visual effect and notification
4. WHEN calculating perfect clear bonus THEN the Tetris Game SHALL award points based on the number of lines cleared in the perfect clear action
5. WHEN a perfect clear is achieved THEN the Tetris Game SHALL play a unique sound effect

### Requirement 6

**User Story:** As a player, I want all advanced features to integrate seamlessly with existing game mechanics, so that the game remains balanced and enjoyable.

#### Acceptance Criteria

1. WHEN advanced features are active THEN the Tetris Game SHALL maintain compatibility with the existing fruit combo system
2. WHEN multiple bonuses apply simultaneously THEN the Tetris Game SHALL calculate and display the total score correctly
3. WHEN T-Spin or back-to-back bonuses are earned THEN the Tetris Game SHALL update the score display immediately
4. WHEN the game state is reset THEN the Tetris Game SHALL clear all bonus states and held pieces
5. WHEN a game over occurs THEN the Tetris Game SHALL save high scores including all bonus points
