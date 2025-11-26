# Design Document: Viewport Centering and Responsive Layout

## Overview

This design implements a comprehensive viewport centering and responsive layout system for the Fruit Tetris game. The system ensures that all game screens (Main Menu, Select Mode, Game Viewport) are centered both horizontally and vertically within the browser viewport using modern CSS flexbox techniques, while maintaining proper aspect ratios, preventing unwanted scrolling, and providing crisp rendering on high-DPI displays.

The design focuses on:
1. **Universal Centering** - All screens use a consistent flexbox-based centering approach
2. **Responsive Breakpoints** - Three distinct layouts for mobile, tablet, and desktop
3. **Aspect Ratio Preservation** - Game board maintains 1:2 ratio across all screen sizes
4. **High-DPI Support** - Canvas rendering scales for devicePixelRatio without affecting layout
5. **Scroll Prevention** - Layouts fit within viewport bounds under normal conditions

## Architecture

### CSS Architecture

The centering system uses a layered CSS architecture:

```
body (viewport-filling flex container)
  └── #game-container (.app - full-viewport flex container)
      ├── .screen (individual game screens)
      │   ├── #main-menu
      │   ├── #mode-selection-screen
      │   ├── #settings-screen
      │   ├── #instructions
      │   └── #game-screen
      │       └── #game-ui (game layout container)
      │           ├── .ui-panel.left-panel
      │           ├── .game-area
      │           │   └── #game-canvas
      │           └── .ui-panel.right-panel
      └── background (CSS background on body)
```

### Responsive Strategy

The system uses three breakpoints with mobile-first CSS:

1. **Mobile (≤600px)**: Stacked vertical layout, minimal spacing
2. **Tablet (601-1024px)**: Adjusted spacing, optimized for medium screens
3. **Desktop (>1024px)**: Full horizontal layout with side panels

### Canvas Rendering Pipeline

```
1. Detect devicePixelRatio
2. Calculate CSS dimensions (logical pixels)
3. Scale canvas internal resolution (physical pixels)
4. Apply scale transform to canvas context
5. Render game content at scaled resolution
6. Browser displays canvas at CSS dimensions
```

## Components and Interfaces

### CSS Classes and Selectors

#### Core Layout Classes

```css
/* Root container - full viewport flex */
body {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background-size: cover;
    background-position: center;
}

/* App container - centers all screens */
#game-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    position: relative;
}

/* Individual screens - inherit centering */
.screen {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    position: absolute;
}
```

#### Game Viewport Layout

```css
/* Game UI container */
#game-ui {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    max-width: 100%;
    max-height: 100vh;
}

/* Game area - maintains aspect ratio */
.game-area {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* Canvas with aspect ratio preservation */
#game-canvas {
    width: 300px;
    height: 600px;
    max-width: 100%;
    max-height: calc(100vh - 4rem);
    aspect-ratio: 1 / 2;
}
```

### JavaScript Canvas Manager

```javascript
class CanvasManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.dpr = window.devicePixelRatio || 1;
        this.cssWidth = 300;  // Logical width
        this.cssHeight = 600; // Logical height
    }
    
    // Initialize canvas with DPI scaling
    initializeCanvas() {
        // Set CSS dimensions (layout)
        this.canvas.style.width = `${this.cssWidth}px`;
        this.canvas.style.height = `${this.cssHeight}px`;
        
        // Set internal resolution (rendering)
        this.canvas.width = this.cssWidth * this.dpr;
        this.canvas.height = this.cssHeight * this.dpr;
        
        // Scale context for high-DPI
        this.ctx.scale(this.dpr, this.dpr);
    }
    
    // Handle window resize
    handleResize() {
        const rect = this.canvas.getBoundingClientRect();
        this.cssWidth = rect.width;
        this.cssHeight = rect.height;
        this.initializeCanvas();
    }
    
    // Get logical dimensions for game logic
    getLogicalDimensions() {
        return {
            width: this.cssWidth,
            height: this.cssHeight
        };
    }
}
```

### Responsive Layout Manager

```javascript
class ResponsiveLayoutManager {
    constructor() {
        this.breakpoints = {
            mobile: 600,
            tablet: 1024
        };
        this.currentBreakpoint = this.detectBreakpoint();
        this.setupResizeListener();
    }
    
    detectBreakpoint() {
        const width = window.innerWidth;
        if (width <= this.breakpoints.mobile) return 'mobile';
        if (width <= this.breakpoints.tablet) return 'tablet';
        return 'desktop';
    }
    
    setupResizeListener() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const newBreakpoint = this.detectBreakpoint();
                if (newBreakpoint !== this.currentBreakpoint) {
                    this.currentBreakpoint = newBreakpoint;
                    this.onBreakpointChange(newBreakpoint);
                }
            }, 150);
        });
    }
    
    onBreakpointChange(breakpoint) {
        // Trigger layout adjustments
        document.body.setAttribute('data-breakpoint', breakpoint);
        this.adjustGameLayout(breakpoint);
    }
    
    adjustGameLayout(breakpoint) {
        const gameUI = document.getElementById('game-ui');
        const canvas = document.getElementById('game-canvas');
        
        switch(breakpoint) {
            case 'mobile':
                gameUI.style.flexDirection = 'column';
                gameUI.style.padding = '0.5rem';
                break;
            case 'tablet':
                gameUI.style.flexDirection = 'row';
                gameUI.style.padding = '1rem';
                break;
            case 'desktop':
                gameUI.style.flexDirection = 'row';
                gameUI.style.padding = '2rem';
                break;
        }
    }
}
```

## Data Models

### Viewport Configuration

```javascript
const ViewportConfig = {
    // Canvas dimensions (CSS pixels)
    canvas: {
        defaultWidth: 300,
        defaultHeight: 600,
        aspectRatio: 1 / 2,
        minWidth: 250,
        minHeight: 500,
        maxWidth: 400,
        maxHeight: 800
    },
    
    // Breakpoint definitions
    breakpoints: {
        mobile: {
            maxWidth: 600,
            canvasWidth: 250,
            canvasHeight: 500,
            uiGap: '0.5rem',
            padding: '0.5rem'
        },
        tablet: {
            minWidth: 601,
            maxWidth: 1024,
            canvasWidth: 300,
            canvasHeight: 600,
            uiGap: '1rem',
            padding: '1rem'
        },
        desktop: {
            minWidth: 1025,
            canvasWidth: 300,
            canvasHeight: 600,
            uiGap: '2rem',
            padding: '2rem'
        }
    },
    
    // Centering configuration
    centering: {
        method: 'flexbox',
        horizontalAlign: 'center',
        verticalAlign: 'center',
        fullViewport: true
    },
    
    // Background configuration
    background: {
        size: 'cover',
        position: 'center',
        repeat: 'no-repeat',
        attachment: 'fixed'
    }
};
```

### Layout State

```javascript
class LayoutState {
    constructor() {
        this.currentBreakpoint = 'desktop';
        this.viewportWidth = window.innerWidth;
        this.viewportHeight = window.innerHeight;
        this.devicePixelRatio = window.devicePixelRatio || 1;
        this.canvasDimensions = {
            cssWidth: 300,
            cssHeight: 600,
            physicalWidth: 300 * this.devicePixelRatio,
            physicalHeight: 600 * this.devicePixelRatio
        };
        this.isCentered = true;
        this.scrollEnabled = false;
    }
    
    update() {
        this.viewportWidth = window.innerWidth;
        this.viewportHeight = window.innerHeight;
        this.currentBreakpoint = this.calculateBreakpoint();
    }
    
    calculateBreakpoint() {
        if (this.viewportWidth <= 600) return 'mobile';
        if (this.viewportWidth <= 1024) return 'tablet';
        return 'desktop';
    }
}
```

## Data Models (continued)

### Canvas Dimensions Calculator

```javascript
class CanvasDimensionsCalculator {
    constructor(config) {
        this.config = config;
    }
    
    // Calculate optimal canvas size for viewport
    calculateDimensions(viewportWidth, viewportHeight, breakpoint) {
        const breakpointConfig = this.config.breakpoints[breakpoint];
        let width = breakpointConfig.canvasWidth;
        let height = breakpointConfig.canvasHeight;
        
        // Account for UI panels and padding
        const availableWidth = viewportWidth - this.getUIWidth(breakpoint);
        const availableHeight = viewportHeight - this.getUIHeight(breakpoint);
        
        // Scale down if needed while maintaining aspect ratio
        const scaleX = availableWidth / width;
        const scaleY = availableHeight / height;
        const scale = Math.min(scaleX, scaleY, 1);
        
        return {
            cssWidth: Math.floor(width * scale),
            cssHeight: Math.floor(height * scale),
            scale: scale
        };
    }
    
    getUIWidth(breakpoint) {
        // Calculate total width consumed by UI panels
        switch(breakpoint) {
            case 'mobile': return 32; // padding only
            case 'tablet': return 64;
            case 'desktop': return 400; // side panels + gaps
        }
    }
    
    getUIHeight(breakpoint) {
        // Calculate total height consumed by UI elements
        switch(breakpoint) {
            case 'mobile': return 300; // panels + controls
            case 'tablet': return 100;
            case 'desktop': return 64;
        }
    }
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Flexbox centering for all screens

*For any* screen element displayed in the App Container, the computed styles of the App Container should have display: flex, align-items: center, and justify-content: center.

**Validates: Requirements 1.1, 1.2, 1.5**

### Property 2: Centering persistence across resize

*For any* window resize event, the App Container's flexbox centering properties (align-items: center, justify-content: center) should remain unchanged before and after the resize.

**Validates: Requirements 1.3**

### Property 3: Full-viewport container dimensions

*For any* point in time when the game is displayed, the App Container's computed width should equal window.innerWidth and computed height should equal window.innerHeight (within 1px tolerance).

**Validates: Requirements 1.4**

### Property 4: Background cover property

*For any* point in time when the game is displayed, the body element's computed background-size should be 'cover'.

**Validates: Requirements 2.1, 2.3**

### Property 5: Background center position

*For any* point in time when the game is displayed, the body element's computed background-position should be 'center' or '50% 50%'.

**Validates: Requirements 2.2**

### Property 6: Background properties persistence across resize

*For any* window resize event, the body element's background-size and background-position properties should remain 'cover' and 'center' respectively after the resize.

**Validates: Requirements 2.4**

### Property 7: Background z-index stacking

*For any* game content element (screens, canvas, UI panels), its z-index or stacking context should be higher than the body element's background layer.

**Validates: Requirements 2.5**

### Property 8: Desktop overflow prevention

*For any* viewport with width greater than 1024px, the body element's computed overflow or overflow-y property should be 'hidden'.

**Validates: Requirements 3.1**

### Property 9: Mobile scroll prevention when content fits

*For any* mobile viewport (width ≤ 600px) where document.documentElement.scrollHeight ≤ window.innerHeight, scrolling should not be triggered (scrollY should remain 0 during normal interaction).

**Validates: Requirements 3.2**

### Property 10: Game viewport fits within viewport height

*For any* viewport when the Main Game Viewport is displayed, the document.documentElement.scrollHeight should equal window.innerHeight (indicating no scroll is needed).

**Validates: Requirements 3.3**

### Property 11: Mobile controls within viewport bounds

*For any* mobile viewport with mobile controls displayed, the bottom edge of the mobile controls element (getBoundingClientRect().bottom) should be less than or equal to window.innerHeight.

**Validates: Requirements 3.4**

### Property 12: Game board aspect ratio

*For any* canvas element representing the Game Board, the ratio of its CSS height to CSS width (computed from style.height / style.width) should equal 2.0 (within 0.01 tolerance).

**Validates: Requirements 4.1, 4.3**

### Property 13: Aspect ratio preservation across resize

*For any* window resize event, the Game Board canvas aspect ratio (CSS height / CSS width) should remain equal to 2.0 before and after the resize (within 0.01 tolerance).

**Validates: Requirements 4.2**

### Property 14: Aspect ratio consistency across breakpoints

*For any* breakpoint transition (mobile, tablet, desktop), the Game Board canvas aspect ratio should remain 2.0 (within 0.01 tolerance) across all breakpoints.

**Validates: Requirements 4.4**

### Property 15: DevicePixelRatio scaling without layout impact

*For any* canvas element with devicePixelRatio > 1, the ratio of canvas.width to parseInt(canvas.style.width) should equal window.devicePixelRatio (within 0.1 tolerance), while canvas.style.width and canvas.style.height remain unchanged from their initial CSS values.

**Validates: Requirements 4.5**

### Property 16: Mobile breakpoint layout

*For any* viewport with width ≤ 600px, the game UI container should have flex-direction: column (or display a stacked layout) as indicated by computed styles.

**Validates: Requirements 5.1**

### Property 17: Tablet breakpoint layout

*For any* viewport with width between 601px and 1024px, the game UI container should apply tablet-specific spacing and layout properties.

**Validates: Requirements 5.2**

### Property 18: Desktop breakpoint layout

*For any* viewport with width > 1024px, the game UI container should have flex-direction: row (or display a side-by-side layout) as indicated by computed styles.

**Validates: Requirements 5.3**

### Property 19: Centering persistence across breakpoint transitions

*For any* breakpoint transition, the App Container's flexbox centering properties should remain unchanged (align-items: center, justify-content: center) before and after the transition.

**Validates: Requirements 5.4**

### Property 20: DevicePixelRatio detection

*For any* canvas initialization, the CanvasManager should store a devicePixelRatio value that equals window.devicePixelRatio.

**Validates: Requirements 6.1**

### Property 21: Canvas internal resolution scaling

*For any* canvas with devicePixelRatio > 1, the canvas.width should equal cssWidth * devicePixelRatio and canvas.height should equal cssHeight * devicePixelRatio.

**Validates: Requirements 6.2**

### Property 22: CSS dimensions preservation during DPI scaling

*For any* canvas element when DPI scaling is applied, the canvas.style.width and canvas.style.height values should remain equal to their pre-scaling CSS values.

**Validates: Requirements 6.3**

### Property 23: Canvas context scale transform

*For any* canvas context with devicePixelRatio > 1, the context's current transform matrix should include a scale factor equal to devicePixelRatio in both x and y dimensions.

**Validates: Requirements 6.4**

### Property 24: Centering calculations use CSS pixels

*For any* centering calculation involving the canvas, the calculation should reference canvas.style.width and canvas.style.height (CSS pixels) rather than canvas.width and canvas.height (physical pixels).

**Validates: Requirements 6.5**

### Property 25: Centering consistency across screen transitions

*For any* two different screens (Main Menu, Select Mode, Game Viewport), both screens' parent container should have identical flexbox centering properties (display: flex, align-items: center, justify-content: center).

**Validates: Requirements 7.1, 7.2**

### Property 26: Overlay centering without parent impact

*For any* overlay (pause, game over) displayed within the Game Board, the overlay should be centered within its parent, and the parent's centering properties should remain unchanged.

**Validates: Requirements 7.3, 7.4**

### Property 27: Full-viewport flex container preservation

*For any* screen transition, the App Container should maintain display: flex, width: 100%, height: 100% throughout the transition.

**Validates: Requirements 7.5**

## Error Handling

### CSS Property Failures

1. **Flexbox Not Supported**
   - Detection: Check for CSS.supports('display', 'flex')
   - Handling: Fall back to absolute positioning with transform: translate(-50%, -50%)
   - Recovery: Display warning to user about degraded experience

2. **Background Cover Not Supported**
   - Detection: Check computed background-size value
   - Handling: Fall back to background-size: 100% 100% (may distort)
   - Recovery: Automatic - background still fills viewport

3. **Viewport Units Not Supported**
   - Detection: Check for CSS.supports('width', '100vw')
   - Handling: Use percentage-based dimensions with JavaScript fallback
   - Recovery: Calculate dimensions using window.innerWidth/Height

### Canvas Rendering Errors

1. **Canvas Context Not Available**
   - Detection: canvas.getContext('2d') returns null
   - Handling: Display error message to user
   - Recovery: Suggest browser update or different browser

2. **DevicePixelRatio Undefined**
   - Detection: typeof window.devicePixelRatio === 'undefined'
   - Handling: Default to DPR = 1
   - Recovery: Automatic - rendering continues at standard resolution

3. **Canvas Scaling Overflow**
   - Detection: canvas.width or canvas.height exceeds browser limits
   - Handling: Clamp to maximum supported dimensions
   - Recovery: Scale down while maintaining aspect ratio

### Responsive Layout Errors

1. **Breakpoint Detection Failure**
   - Detection: window.innerWidth returns 0 or undefined
   - Handling: Default to desktop layout
   - Recovery: Retry detection on next resize event

2. **Viewport Too Small**
   - Detection: window.innerHeight < 400px or window.innerWidth < 250px
   - Handling: Enable scrolling and display warning
   - Recovery: User can rotate device or resize window

3. **Resize Event Storm**
   - Detection: More than 10 resize events in 100ms
   - Handling: Debounce resize handler with 150ms delay
   - Recovery: Automatic - only process final resize

### Z-Index Stacking Errors

1. **Overlay Not Visible**
   - Detection: Overlay element has lower z-index than game content
   - Handling: Force overlay z-index to 9999
   - Recovery: Automatic - overlay becomes visible

2. **Background Overlapping Content**
   - Detection: Game content not visible due to z-index issues
   - Handling: Reset z-index hierarchy
   - Recovery: Automatic - proper stacking restored

## Testing Strategy

### Unit Testing

The viewport centering system will use standard unit tests for:

1. **CSS Property Verification**
   - Test that App Container has correct flexbox properties
   - Test background-size and background-position values
   - Test overflow properties at different breakpoints
   - Verify z-index stacking order

2. **Canvas Dimension Calculations**
   - Test CanvasDimensionsCalculator with various viewport sizes
   - Verify aspect ratio preservation logic
   - Test DPI scaling calculations
   - Verify CSS vs physical pixel handling

3. **Breakpoint Detection**
   - Test ResponsiveLayoutManager.detectBreakpoint() with various widths
   - Verify breakpoint transition logic
   - Test debouncing of resize events

4. **Layout State Management**
   - Test LayoutState updates on resize
   - Verify state consistency across transitions
   - Test edge cases (very small viewports)

### Property-Based Testing

The system will use **fast-check** (JavaScript property-based testing library) to verify universal properties:

**Configuration:**
- Minimum 100 iterations per property test
- Each property test tagged with format: `**Feature: viewport-centering, Property {N}: {description}**`
- Tests located in `tests/viewport_centering_tests.js`

**Property Test Coverage:**

1. **Flexbox Centering (Property 1)**
   - Generate random screen elements
   - Verify App Container always has centering properties
   - Test with different screen types

2. **Aspect Ratio Preservation (Properties 12, 13, 14)**
   - Generate random viewport dimensions
   - Verify canvas aspect ratio always equals 2.0
   - Test across resize events and breakpoint transitions

3. **DPI Scaling (Properties 15, 21, 22)**
   - Generate random devicePixelRatio values (1.0 to 3.0)
   - Verify internal resolution scales correctly
   - Verify CSS dimensions remain unchanged

4. **Breakpoint Consistency (Properties 16, 17, 18)**
   - Generate random viewport widths
   - Verify correct layout applied for each breakpoint
   - Test boundary conditions (600px, 1024px)

5. **Centering Persistence (Properties 2, 6, 19)**
   - Generate random resize sequences
   - Verify centering properties never change
   - Test with rapid resize events

### Integration Testing

1. **Full Screen Transitions**
   - Navigate through all screens (Menu → Mode Select → Game)
   - Verify centering maintained throughout
   - Test with different viewport sizes

2. **Responsive Behavior**
   - Resize window through all breakpoints
   - Verify smooth transitions
   - Test portrait/landscape orientation changes on mobile

3. **High-DPI Display Testing**
   - Test on devices with DPR 1.0, 1.5, 2.0, 3.0
   - Verify visual crispness
   - Verify layout remains consistent

4. **Overlay Behavior**
   - Display pause and game over overlays
   - Verify overlay centering
   - Verify parent centering unaffected

### Visual Regression Testing

1. **Screenshot Comparison**
   - Capture screenshots at each breakpoint
   - Compare against baseline images
   - Detect unintended layout shifts

2. **Centering Verification**
   - Measure pixel distances from edges
   - Verify equal spacing on all sides
   - Test with various content sizes

### Browser Compatibility Testing

1. **Cross-Browser Testing**
   - Test on Chrome, Firefox, Safari, Edge
   - Verify flexbox behavior consistency
   - Test background cover behavior

2. **Mobile Browser Testing**
   - Test on iOS Safari, Chrome Mobile, Firefox Mobile
   - Verify touch interaction doesn't break centering
   - Test with browser chrome (address bar) showing/hiding

## Implementation Notes

### CSS Implementation Strategy

1. **Mobile-First Approach**
   - Start with mobile styles as base
   - Use min-width media queries for tablet and desktop
   - Ensures graceful degradation

2. **Flexbox Centering Pattern**
   ```css
   .centering-container {
       display: flex;
       justify-content: center;
       align-items: center;
       width: 100%;
       height: 100%;
   }
   ```

3. **Aspect Ratio Preservation**
   ```css
   #game-canvas {
       aspect-ratio: 1 / 2;
       max-width: 100%;
       max-height: calc(100vh - 4rem);
   }
   ```

### JavaScript Implementation Strategy

1. **Canvas Initialization**
   - Initialize canvas on page load
   - Set up resize listener with debouncing
   - Apply DPI scaling immediately

2. **Resize Handling**
   - Debounce resize events (150ms delay)
   - Detect breakpoint changes
   - Recalculate canvas dimensions
   - Reapply DPI scaling

3. **Performance Optimization**
   - Cache computed styles where possible
   - Minimize DOM queries during resize
   - Use requestAnimationFrame for layout updates

### Responsive Breakpoint Strategy

1. **Breakpoint Selection Rationale**
   - 600px: Common phone/tablet boundary
   - 1024px: Common tablet/desktop boundary
   - Aligns with common device sizes

2. **Breakpoint Transition Handling**
   - Use CSS transitions for smooth layout changes
   - Avoid jarring repositioning
   - Maintain focus on game content

### High-DPI Rendering Strategy

1. **Canvas Scaling Approach**
   - Detect DPR on initialization
   - Scale canvas internal resolution
   - Apply context scale transform
   - Keep CSS dimensions unchanged

2. **Performance Considerations**
   - Higher DPR = more pixels to render
   - May impact performance on lower-end devices
   - Consider capping DPR at 2.0 for performance

### Accessibility Considerations

1. **Keyboard Navigation**
   - Ensure centering doesn't break tab order
   - Maintain focus visibility

2. **Screen Readers**
   - Ensure semantic HTML structure
   - Centering should not affect reading order

3. **Reduced Motion**
   - Respect prefers-reduced-motion media query
   - Disable transitions if user prefers

### Browser Compatibility Notes

1. **Flexbox Support**
   - Supported in all modern browsers
   - IE11 requires -ms- prefix (not supporting IE11)

2. **Aspect-Ratio Property**
   - Modern CSS property (2021+)
   - Fallback: Use padding-bottom hack for older browsers

3. **DevicePixelRatio**
   - Widely supported
   - Fallback to 1.0 if undefined

## Integration Points

### HTML Structure Requirements

The HTML must follow this structure for centering to work:

```html
<body>
    <div id="game-container" class="app">
        <div class="screen" id="main-menu">...</div>
        <div class="screen" id="mode-selection-screen">...</div>
        <div class="screen" id="game-screen">
            <div id="game-ui">
                <div class="ui-panel left-panel">...</div>
                <div class="game-area">
                    <canvas id="game-canvas"></canvas>
                </div>
                <div class="ui-panel right-panel">...</div>
            </div>
        </div>
    </div>
</body>
```

### CSS File Modifications

1. **style.css**
   - Update body styles for flexbox and background
   - Update #game-container for full-viewport flex
   - Update .screen for inherited centering
   - Add/update media queries for breakpoints
   - Update canvas styles for aspect ratio

### JavaScript File Modifications

1. **main.js**
   - Add CanvasManager initialization
   - Add ResponsiveLayoutManager initialization
   - Set up resize event listeners
   - Apply DPI scaling on canvas

2. **New file: js/viewport.js** (optional)
   - Extract CanvasManager class
   - Extract ResponsiveLayoutManager class
   - Extract CanvasDimensionsCalculator class
   - Keep viewport logic separate from game logic

### Configuration

Add viewport configuration to game settings:

```javascript
const gameConfig = {
    viewport: {
        enableResponsive: true,
        enableHighDPI: true,
        maxDPR: 2.0,  // Cap for performance
        breakpoints: {
            mobile: 600,
            tablet: 1024
        },
        canvas: {
            defaultWidth: 300,
            defaultHeight: 600,
            minWidth: 250,
            minHeight: 500
        }
    }
};
```

### Event Hooks

The viewport system should emit events for other systems to react:

```javascript
// Breakpoint change event
window.dispatchEvent(new CustomEvent('breakpointChange', {
    detail: { breakpoint: 'mobile' }
}));

// Canvas resize event
window.dispatchEvent(new CustomEvent('canvasResize', {
    detail: { width: 300, height: 600 }
}));

// DPI scale event
window.dispatchEvent(new CustomEvent('dpiScale', {
    detail: { dpr: 2.0 }
}));
```
