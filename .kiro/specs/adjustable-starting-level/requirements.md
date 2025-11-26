# Requirements Document

## Introduction

This specification defines an adjustable starting level feature for the Fruit Tetris game, allowing experienced players to begin gameplay at higher difficulty levels. This feature enables players to skip the slower early levels and immediately engage with more challenging gameplay that matches their skill level, improving the game experience for advanced players while maintaining accessibility for beginners.

## Glossary

- **Tetris Game**: The Fruit Tetris browser-based game system
- **Level**: A difficulty tier that determines the fall speed of tetrominoes and affects scoring multipliers
- **Starting Level**: The initial level value when a new game session begins
- **Fall Speed**: The rate at which a tetromino descends automatically, measured in cells per second or frames per drop
- **Level Progression**: The system that increases level based on lines cleared during gameplay
- **Game Session**: A single playthrough from start to game over or completion
- **UI Control**: An interactive interface element that accepts user input
- **Persistent Storage**: Browser localStorage used to save user preferences across sessions

## Requirements

### Requirement 1

**User Story:** As an experienced player, I want to select my starting level before beginning a game, so that I can immediately play at a difficulty that matches my skill level.

#### Acceptance Criteria

1. WHEN the game loads THEN the Tetris Game SHALL display a starting level selector in the user interface
2. WHEN a player adjusts the starting level selector THEN the Tetris Game SHALL update the displayed starting level value
3. WHEN a player starts a new game THEN the Tetris Game SHALL initialize the game at the selected starting level
4. WHEN the game initializes at a starting level THEN the Tetris Game SHALL set the fall speed according to that level's difficulty curve
5. WHERE a starting level is selected, WHEN the game begins THEN the Tetris Game SHALL display the current level matching the selected starting level

### Requirement 2

**User Story:** As a player, I want my starting level preference to be remembered, so that I don't have to reconfigure it every time I play.

#### Acceptance Criteria

1. WHEN a player changes the starting level THEN the Tetris Game SHALL save the selected value to persistent storage
2. WHEN the game loads THEN the Tetris Game SHALL retrieve the previously saved starting level from persistent storage
3. WHERE no saved starting level exists THEN the Tetris Game SHALL default to level 1
4. WHEN the saved starting level is retrieved THEN the Tetris Game SHALL set the starting level selector to the saved value
5. WHEN persistent storage is unavailable THEN the Tetris Game SHALL default to level 1 without errors

### Requirement 3

**User Story:** As a player, I want the starting level selector to have reasonable bounds, so that I can choose from appropriate difficulty options without breaking the game.

#### Acceptance Criteria

1. WHEN displaying the starting level selector THEN the Tetris Game SHALL set the minimum selectable level to 1
2. WHEN displaying the starting level selector THEN the Tetris Game SHALL set the maximum selectable level to 15
3. WHEN a player attempts to select a level below the minimum THEN the Tetris Game SHALL constrain the value to the minimum level
4. WHEN a player attempts to select a level above the maximum THEN the Tetris Game SHALL constrain the value to the maximum level
5. WHEN the starting level selector is displayed THEN the Tetris Game SHALL show the valid range to the player

### Requirement 4

**User Story:** As a player, I want the starting level to affect scoring appropriately, so that higher starting levels provide proportionally greater score rewards.

#### Acceptance Criteria

1. WHEN calculating line clear scores THEN the Tetris Game SHALL apply the level multiplier based on the current level
2. WHEN a game starts at a level higher than 1 THEN the Tetris Game SHALL use that level for initial score calculations
3. WHEN the level increases during gameplay THEN the Tetris Game SHALL update the score multiplier accordingly
4. WHEN comparing scores from different starting levels THEN the Tetris Game SHALL ensure higher starting levels can achieve higher scores for equivalent performance
5. WHEN displaying the score THEN the Tetris Game SHALL show the current level alongside the score value

### Requirement 5

**User Story:** As a player, I want the starting level to integrate seamlessly with level progression, so that the game continues to increase in difficulty as I clear lines.

#### Acceptance Criteria

1. WHEN a game starts at a selected starting level THEN the Tetris Game SHALL track lines cleared from zero
2. WHEN the player clears 10 lines THEN the Tetris Game SHALL increment the level by 1 from the current level
3. WHEN the level increases through progression THEN the Tetris Game SHALL apply the same fall speed increases as normal gameplay
4. WHERE a player starts at level 10 and clears 10 lines THEN the Tetris Game SHALL advance to level 11
5. WHEN the game ends THEN the Tetris Game SHALL display both the starting level and the final level reached

### Requirement 6

**User Story:** As a player, I want the starting level selector to be intuitive and accessible, so that I can easily adjust it without confusion.

#### Acceptance Criteria

1. WHEN the starting level selector is displayed THEN the Tetris Game SHALL use a clear, labeled UI control
2. WHEN a player interacts with the selector THEN the Tetris Game SHALL provide immediate visual feedback of the selected value
3. WHERE the game supports touch controls THEN the Tetris Game SHALL make the starting level selector touch-friendly
4. WHEN the starting level changes THEN the Tetris Game SHALL display a preview of the expected fall speed or difficulty
5. WHEN the selector is rendered THEN the Tetris Game SHALL position it prominently in the pre-game or settings interface
