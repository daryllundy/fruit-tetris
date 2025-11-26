# Requirements Document

## Introduction

This feature ensures that the Fruit Tetris game maintains proper viewport centering and layout behavior across all devices and screen sizes. The Select Mode screen and Main Game viewport (board plus UI) must be centered both horizontally and vertically within the browser viewport, with responsive behavior that preserves aspect ratios and prevents scrolling under normal conditions.

## Glossary

- **App Container**: The root `.app` element that uses flexbox to center all game screens
- **Select Mode Screen**: The game mode selection interface showing Marathon, Sprint, and Zen options
- **Main Game Viewport**: The complete game interface including the board, hold/next panels, and score displays
- **Game Board**: The 10×20 Tetris playfield canvas element
- **Background Artwork**: The gradient background that uses cover behavior
- **Aspect Ratio**: The proportional relationship between width and height that must be preserved
- **Device Pixel Ratio**: The ratio between physical pixels and CSS pixels for crisp rendering
- **Breakpoint**: A screen width threshold that triggers different responsive layouts

## Requirements

### Requirement 1

**User Story:** As a player, I want the game screens to be centered in my browser viewport, so that the interface is visually balanced and easy to focus on regardless of my screen size.

#### Acceptance Criteria

1. WHEN the Select Mode screen is displayed THEN the App Container SHALL center it both horizontally and vertically using flexbox with align-items and justify-content set to center
2. WHEN the Main Game Viewport is displayed THEN the App Container SHALL center it both horizontally and vertically using the same flexbox centering approach
3. WHEN the browser window is resized THEN the App Container SHALL maintain centering of the active screen without requiring page refresh
4. WHEN content is centered THEN the App Container SHALL use a full-viewport flex container that spans 100% of viewport width and height
5. WHEN multiple screens exist THEN the App Container SHALL apply consistent centering behavior to all game screens

### Requirement 2

**User Story:** As a player, I want the background to fill my entire screen attractively, so that the game has a polished appearance even when the game content doesn't fill the viewport.

#### Acceptance Criteria

1. WHEN the background artwork is rendered THEN the system SHALL apply background-size: cover to ensure full viewport coverage
2. WHEN the background artwork is rendered THEN the system SHALL apply background-position: center to center the background image
3. WHEN the viewport aspect ratio differs from the background artwork aspect ratio THEN the system SHALL crop the background at edges rather than distort it
4. WHEN the viewport is resized THEN the system SHALL maintain cover behavior and re-center the background automatically
5. WHEN the background is displayed THEN the system SHALL ensure it remains behind all game content in the z-index stacking order

### Requirement 3

**User Story:** As a player, I want the game to remain scroll-free during normal play, so that I can focus on gameplay without accidental scrolling disrupting my experience.

#### Acceptance Criteria

1. WHEN the game is displayed on desktop devices THEN the system SHALL prevent vertical scrolling by setting overflow: hidden on the body element
2. WHEN the game is displayed on mobile devices in portrait orientation THEN the system SHALL prevent scrolling when content fits within the viewport
3. WHEN the Main Game Viewport is displayed THEN the system SHALL size all elements to fit within the viewport height without triggering scroll
4. WHEN mobile controls are displayed THEN the system SHALL position them within the viewport bounds to avoid scroll requirements
5. WHEN the viewport height is insufficient for all content THEN the system SHALL allow minimal scrolling only as a fallback for extremely small screens

### Requirement 4

**User Story:** As a player, I want the game board to maintain its correct proportions, so that the gameplay area looks correct and pieces appear with proper shapes.

#### Acceptance Criteria

1. WHEN the Game Board is rendered THEN the system SHALL maintain a 1:2 aspect ratio (width:height) corresponding to the 10×20 grid
2. WHEN the viewport is resized THEN the system SHALL scale the Game Board proportionally without distorting the aspect ratio
3. WHEN the Game Board is scaled THEN the system SHALL ensure tetromino pieces maintain their correct square-based shapes
4. WHEN responsive breakpoints are triggered THEN the system SHALL preserve the Game Board aspect ratio across all breakpoints
5. WHEN the Game Board is displayed THEN the system SHALL apply devicePixelRatio-aware rendering to maintain visual crispness without affecting layout

### Requirement 5

**User Story:** As a player, I want the game to adapt to my device size, so that I get an optimal experience whether I'm on mobile, tablet, or desktop.

#### Acceptance Criteria

1. WHEN the viewport width is 600px or less THEN the system SHALL apply mobile layout styles with stacked UI panels
2. WHEN the viewport width is between 601px and 1024px THEN the system SHALL apply tablet layout styles with adjusted spacing
3. WHEN the viewport width is greater than 1024px THEN the system SHALL apply desktop layout styles with side-by-side panels
4. WHEN a breakpoint transition occurs THEN the system SHALL maintain horizontal and vertical centering of the Main Game Viewport
5. WHEN a breakpoint transition occurs THEN the system SHALL smoothly adjust layout without jarring visual jumps

### Requirement 6

**User Story:** As a player on a high-DPI display, I want the game graphics to appear sharp and crisp, so that the visual quality matches my device capabilities.

#### Acceptance Criteria

1. WHEN the Game Board canvas is initialized THEN the system SHALL detect the devicePixelRatio of the display
2. WHEN devicePixelRatio is greater than 1 THEN the system SHALL scale the canvas internal resolution by the devicePixelRatio
3. WHEN the canvas is scaled for high-DPI THEN the system SHALL maintain the CSS dimensions to preserve layout and centering
4. WHEN rendering to the scaled canvas THEN the system SHALL apply the devicePixelRatio scale transform to the canvas context
5. WHEN high-DPI rendering is active THEN the system SHALL ensure centering calculations use CSS pixels not physical pixels

### Requirement 7

**User Story:** As a player, I want consistent centering across all game screens, so that the interface feels cohesive and predictable as I navigate.

#### Acceptance Criteria

1. WHEN transitioning from Main Menu to Select Mode screen THEN the system SHALL maintain the same centering approach
2. WHEN transitioning from Select Mode screen to Main Game Viewport THEN the system SHALL maintain the same centering approach
3. WHEN the pause overlay is displayed THEN the system SHALL center it within the Game Board without affecting the board's centering
4. WHEN the game over overlay is displayed THEN the system SHALL center it within the Game Board without affecting the board's centering
5. WHEN any screen transition occurs THEN the system SHALL preserve the full-viewport flex container centering behavior
