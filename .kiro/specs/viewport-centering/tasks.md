# Implementation Plan

- [ ] 1. Update CSS for flexbox centering and full-viewport layout
  - Modify body element to use flexbox centering with 100vw/100vh dimensions
  - Update #game-container to be a full-viewport flex container with centering
  - Ensure all .screen elements inherit centering behavior
  - Add overflow: hidden to body for desktop to prevent scrolling
  - _Requirements: 1.1, 1.2, 1.4, 1.5, 3.1_

- [ ] 1.1 Write property test for flexbox centering
  - **Property 1: Flexbox centering for all screens**
  - **Validates: Requirements 1.1, 1.2, 1.5**

- [ ] 1.2 Write property test for full-viewport dimensions
  - **Property 3: Full-viewport container dimensions**
  - **Validates: Requirements 1.4**

- [ ] 2. Implement background cover and center positioning
  - Add background-size: cover to body element
  - Add background-position: center to body element
  - Ensure background remains fixed during scroll (if any)
  - Verify z-index stacking keeps background behind content
  - _Requirements: 2.1, 2.2, 2.5_

- [ ] 2.1 Write property test for background properties
  - **Property 4: Background cover property**
  - **Property 5: Background center position**
  - **Validates: Requirements 2.1, 2.2**

- [ ] 3. Update game canvas styles for aspect ratio preservation
  - Add aspect-ratio: 1 / 2 to #game-canvas
  - Set max-width and max-height constraints to fit within viewport
  - Ensure canvas maintains 300px × 600px default dimensions
  - Update canvas border and styling to work with new dimensions
  - _Requirements: 4.1, 4.3_

- [ ] 3.1 Write property test for canvas aspect ratio
  - **Property 12: Game board aspect ratio**
  - **Validates: Requirements 4.1, 4.3**

- [ ] 4. Implement responsive breakpoints with media queries
  - Add mobile breakpoint (max-width: 600px) with stacked layout
  - Add tablet breakpoint (min-width: 601px, max-width: 1024px) with adjusted spacing
  - Add desktop breakpoint (min-width: 1025px) with side-by-side layout
  - Update #game-ui flex-direction for each breakpoint
  - Adjust padding, gaps, and panel sizes for each breakpoint
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 4.1 Write property test for breakpoint layouts
  - **Property 16: Mobile breakpoint layout**
  - **Property 17: Tablet breakpoint layout**
  - **Property 18: Desktop breakpoint layout**
  - **Validates: Requirements 5.1, 5.2, 5.3**

- [ ] 5. Create CanvasManager class for DPI-aware rendering
  - Create new js/viewport.js file
  - Implement CanvasManager class with canvas initialization
  - Detect devicePixelRatio on initialization
  - Scale canvas internal resolution by DPR while maintaining CSS dimensions
  - Apply scale transform to canvas context
  - Implement getLogicalDimensions() method for game logic
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 5.1 Write property test for DPI detection and scaling
  - **Property 20: DevicePixelRatio detection**
  - **Property 21: Canvas internal resolution scaling**
  - **Property 22: CSS dimensions preservation during DPI scaling**
  - **Validates: Requirements 6.1, 6.2, 6.3**

- [ ] 6. Create ResponsiveLayoutManager class
  - Implement ResponsiveLayoutManager in js/viewport.js
  - Add detectBreakpoint() method to identify current breakpoint
  - Set up resize event listener with debouncing (150ms)
  - Implement onBreakpointChange() callback for layout adjustments
  - Add data-breakpoint attribute to body for CSS targeting
  - _Requirements: 5.4, 1.3_

- [ ] 6.1 Write property test for centering persistence across resize
  - **Property 2: Centering persistence across resize**
  - **Property 19: Centering persistence across breakpoint transitions**
  - **Validates: Requirements 1.3, 5.4**

- [ ] 7. Integrate CanvasManager into main.js
  - Import or include CanvasManager from viewport.js
  - Initialize CanvasManager with game canvas on page load
  - Call initializeCanvas() to apply DPI scaling
  - Set up resize handler to call handleResize()
  - Update game rendering to use logical dimensions from CanvasManager
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 8. Integrate ResponsiveLayoutManager into main.js
  - Import or include ResponsiveLayoutManager from viewport.js
  - Initialize ResponsiveLayoutManager on page load
  - Connect breakpoint change events to layout updates
  - Ensure canvas resizing works with breakpoint changes
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 9. Update mobile controls positioning
  - Ensure mobile controls are positioned within viewport bounds
  - Use fixed positioning with bottom offset
  - Verify controls don't trigger scrolling on mobile
  - Test with various mobile viewport heights
  - _Requirements: 3.4_

- [ ] 9.1 Write property test for mobile controls positioning
  - **Property 11: Mobile controls within viewport bounds**
  - **Validates: Requirements 3.4**

- [ ] 10. Implement scroll prevention for game viewport
  - Ensure game UI elements fit within viewport height
  - Add max-height constraints to prevent overflow
  - Test that document.documentElement.scrollHeight equals window.innerHeight
  - Add fallback scrolling for extremely small viewports (< 400px height)
  - _Requirements: 3.2, 3.3, 3.5_

- [ ] 10.1 Write property test for scroll prevention
  - **Property 9: Mobile scroll prevention when content fits**
  - **Property 10: Game viewport fits within viewport height**
  - **Validates: Requirements 3.2, 3.3**

- [ ] 11. Update overlay centering (pause and game over)
  - Ensure overlays are centered within game canvas
  - Verify overlay positioning doesn't affect parent centering
  - Update #game-overlay styles to maintain centering
  - Test overlay display at different breakpoints
  - _Requirements: 7.3, 7.4_

- [ ] 11.1 Write property test for overlay centering
  - **Property 26: Overlay centering without parent impact**
  - **Validates: Requirements 7.3, 7.4**

- [ ] 12. Add CSS transitions for smooth breakpoint changes
  - Add transition properties to #game-ui for layout changes
  - Add transitions to canvas dimensions
  - Add transitions to panel positioning
  - Test that transitions don't cause layout jank
  - _Requirements: 5.5_

- [ ] 13. Implement error handling for canvas and viewport
  - Add fallback for missing flexbox support (absolute positioning)
  - Add fallback for undefined devicePixelRatio (default to 1.0)
  - Add error handling for canvas context failures
  - Add viewport size validation with warnings for very small screens
  - Implement resize event debouncing to prevent event storms
  - _Requirements: All (error handling)_

- [ ] 14. Test centering consistency across all screens
  - Verify Main Menu centering
  - Verify Mode Selection screen centering
  - Verify Settings screen centering
  - Verify Instructions screen centering
  - Verify Game screen centering
  - Ensure all screens use same flexbox approach
  - _Requirements: 7.1, 7.2, 7.5_

- [ ] 14.1 Write property test for screen transition centering
  - **Property 25: Centering consistency across screen transitions**
  - **Property 27: Full-viewport flex container preservation**
  - **Validates: Requirements 7.1, 7.2, 7.5**

- [ ] 15. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Test aspect ratio preservation across all scenarios
  - Test canvas aspect ratio at default size
  - Test aspect ratio after window resize
  - Test aspect ratio across breakpoint transitions
  - Test aspect ratio with different DPR values
  - Verify tetromino pieces maintain square shapes
  - _Requirements: 4.1, 4.2, 4.4_

- [ ] 16.1 Write property test for aspect ratio preservation
  - **Property 13: Aspect ratio preservation across resize**
  - **Property 14: Aspect ratio consistency across breakpoints**
  - **Validates: Requirements 4.2, 4.4**

- [ ] 17. Test background persistence across interactions
  - Test background properties after resize events
  - Test background properties after breakpoint changes
  - Test background properties after screen transitions
  - Verify background always stays behind content
  - _Requirements: 2.4, 2.5_

- [ ] 17.1 Write property test for background persistence
  - **Property 6: Background properties persistence across resize**
  - **Property 7: Background z-index stacking**
  - **Validates: Requirements 2.4, 2.5**

- [ ] 18. Verify DPI scaling doesn't affect layout
  - Test that CSS dimensions remain unchanged with DPI scaling
  - Test that centering calculations use CSS pixels
  - Test canvas context scale transform is applied correctly
  - Verify visual crispness on high-DPI displays
  - _Requirements: 6.3, 6.4, 6.5_

- [ ] 18.1 Write property test for DPI scaling isolation
  - **Property 15: DevicePixelRatio scaling without layout impact**
  - **Property 23: Canvas context scale transform**
  - **Property 24: Centering calculations use CSS pixels**
  - **Validates: Requirements 6.3, 6.4, 6.5**

- [ ] 19. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
