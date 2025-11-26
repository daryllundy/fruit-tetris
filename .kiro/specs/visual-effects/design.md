# Design Document: Visual Effects System

## Overview

This design adds a comprehensive visual effects system to the Fruit Tetris game, enhancing player feedback through particle effects, screen shake, and celebration animations. The system integrates seamlessly with the existing Canvas-based renderer and game loop, providing responsive visual feedback without impacting gameplay performance.

The effects system consists of three main components:
1. **Particle System** - Manages juice splatter and sparkle particles with physics simulation
2. **Screen Shake System** - Applies viewport displacement for impact feedback
3. **Celebration System** - Orchestrates special effects for exceptional achievements

## Architecture

### System Integration

The visual effects system integrates into the existing architecture as follows:

```
TetrisApp (main.js)
    └── TetrisRenderer (main.js)
        ├── ParticleSystem (new: effects.js)
        ├── ScreenShake (new: effects.js)
        └── CelebrationManager (new: effects.js)
    └── TetrisGame (tetris.js)
        └── Triggers effect events
```

### File Structure

- `js/effects.js` - New file containing all visual effects classes
- `js/main.js` - Modified to integrate ParticleSystem and ScreenShake into TetrisRenderer
- `js/tetris.js` - Modified to trigger effect events at appropriate game moments

### Rendering Pipeline

The rendering order ensures proper layering:

1. Background (existing)
2. Placed blocks (existing)
3. **Particles (new - behind active pieces)**
4. Ghost piece (existing)
5. Current piece (existing)
6. Line clear effect (existing)
7. **Screen shake transform (new - applied to entire canvas)**
8. Combo notification (existing)

## Components and Interfaces

### ParticleSystem Class

Manages creation, update, and rendering of particle effects.

```javascript
class ParticleSystem {
    constructor(ctx, canvas)
    
    // Particle management
    createJuiceSplatter(x, y, emoji, count)
    createSparkles(x, y, count, color)
    createCelebrationBurst(centerX, centerY, intensity)
    
    // System updates
    update(deltaTime)
    render()
    clear()
    
    // Performance management
    setMaxParticles(max)
    getActiveParticleCount()
}
```

**Key Methods:**

- `createJuiceSplatter(x, y, emoji, count)` - Spawns juice particles matching fruit type
  - `x, y`: World coordinates (in blocks)
  - `emoji`: Fruit emoji to determine color
  - `count`: Number of particles to spawn
  
- `createSparkles(x, y, count, color)` - Spawns sparkle particles
  - `color`: Optional color override (defaults to white/yellow)
  
- `update(deltaTime)` - Updates all active particles
  - Applies velocity and gravity
  - Updates opacity based on lifespan
  - Removes expired particles

### Particle Class

Represents individual particle instances.

```javascript
class Particle {
    constructor(x, y, vx, vy, type, options)
    
    // Properties
    x, y              // Position (pixels)
    vx, vy            // Velocity (pixels/second)
    life              // Current lifespan (ms)
    maxLife           // Maximum lifespan (ms)
    size              // Particle size (pixels)
    color             // Particle color
    type              // 'juice' or 'sparkle'
    emoji             // For juice particles
    rotation          // Current rotation angle
    rotationSpeed     // Rotation velocity
    
    // Methods
    update(deltaTime)
    render(ctx)
    isExpired()
}
```

### ScreenShake Class

Manages viewport displacement effects.

```javascript
class ScreenShake {
    constructor()
    
    // Trigger shake effects
    shake(intensity, duration)
    addShake(intensity, duration)
    
    // System updates
    update(deltaTime)
    getOffset()
    isShaking()
    
    // Configuration
    setMaxIntensity(max)
}
```

**Shake Parameters:**

- `intensity`: Displacement magnitude in pixels (0-20)
- `duration`: Effect duration in milliseconds (100-500)
- Multiple simultaneous shakes combine additively up to max intensity

### CelebrationManager Class

Orchestrates complex celebration effects.

```javascript
class CelebrationManager {
    constructor(particleSystem, screenShake, game)
    
    // Celebration triggers
    triggerTetrisCelebration(clearedLines)
    triggerComboCelebration(comboCount, comboSize)
    
    // Internal methods
    spawnFullScreenParticles(density)
    createColorBurst(positions, colors)
}
```

## Data Models

### Particle Configuration

```javascript
const ParticleConfig = {
    juice: {
        minVelocity: { x: -150, y: -200 },
        maxVelocity: { x: 150, y: -100 },
        gravity: 400,
        minLife: 500,
        maxLife: 1200,
        minSize: 4,
        maxSize: 10,
        fadeStart: 0.6  // Start fading at 60% of lifespan
    },
    sparkle: {
        minVelocity: { x: -100, y: -150 },
        maxVelocity: { x: 100, y: -50 },
        gravity: 200,
        minLife: 400,
        maxLife: 1000,
        minSize: 2,
        maxSize: 6,
        fadeStart: 0.5,
        twinkle: true  // Oscillate opacity
    }
}
```

### Fruit Color Mapping

Maps fruit emojis to particle colors for juice splatters:

```javascript
const FruitColors = {
    '🍌': '#FFE135',  // Banana - Yellow
    '🍊': '#FF8C00',  // Orange - Orange
    '🍎': '#DC143C',  // Apple - Red
    '🍓': '#FF1744',  // Strawberry - Bright Red
    '🥝': '#8BC34A',  // Kiwi - Green
    '🍇': '#9C27B0',  // Grapes - Purple
    '🍍': '#FDD835'   // Pineapple - Golden Yellow
}
```

### Shake Intensity Mapping

```javascript
const ShakeIntensity = {
    softDrop: 0,           // No shake for soft drop
    hardDrop: 4,           // Subtle shake
    lineClear1: 3,         // 1 line
    lineClear2: 5,         // 2 lines
    lineClear3: 8,         // 3 lines
    tetris: 12,            // 4 lines (Tetris)
    combo3: 6,             // 3+ combo
    combo5: 10,            // 5+ combo
    combo7: 15             // 7+ combo
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Particle creation for cleared lines

*For any* line clear event, the number of particles created should equal the number of fruit blocks in the cleared lines multiplied by the particles-per-block configuration.

**Validates: Requirements 1.1**

### Property 2: Fruit color mapping consistency

*For any* fruit emoji type, when juice splatter particles are created, the particle color should match the color defined in the FruitColors mapping for that emoji.

**Validates: Requirements 1.2**

### Property 3: Sparkle particle variety

*For any* batch of sparkle particles generated, there should exist at least two particles with different sizes and at least two particles with different opacity values (demonstrating variety).

**Validates: Requirements 1.3**

### Property 4: Particle physics simulation

*For any* particle with initial position (x, y) and velocity (vx, vy), after a time step dt, the new position should equal (x + vx*dt, y + vy*dt + 0.5*gravity*dt²) within floating-point tolerance.

**Validates: Requirements 1.4**

### Property 5: Particle lifecycle management

*For any* particle whose age exceeds its maximum lifespan, that particle should not appear in the active particles collection after the next update cycle.

**Validates: Requirements 1.5**

### Property 6: Line clear shake intensity scaling

*For any* line clear event with N lines cleared (where N > 0), the screen shake intensity should be monotonically increasing with N (more lines = stronger shake).

**Validates: Requirements 2.2**

### Property 7: Screen shake displacement during effect

*For any* active screen shake effect, the viewport offset should be non-zero for at least one frame during the shake duration, and the offset direction should vary over time.

**Validates: Requirements 2.3**

### Property 8: Screen shake intensity bounds

*For any* combination of simultaneous screen shake effects, the resulting viewport displacement magnitude should never exceed the configured maximum intensity value.

**Validates: Requirements 2.4**

### Property 9: Screen shake reset

*For any* screen shake effect, after the effect duration has elapsed and no other shakes are active, the viewport offset should return to (0, 0).

**Validates: Requirements 2.5**

### Property 10: Combo celebration intensity scaling

*For any* two combo celebrations with combo counts C1 and C2 where C1 < C2, the particle count for C2 should be greater than or equal to the particle count for C1.

**Validates: Requirements 3.2**

### Property 11: Celebration spatial distribution

*For any* celebration animation, the particles should be distributed such that at least 70% of the playfield width and 50% of the playfield height contain at least one particle.

**Validates: Requirements 3.3**

### Property 12: High combo color variety

*For any* high combo celebration (combo >= 5), the particles should include at least 3 distinct colors from the FruitColors palette.

**Validates: Requirements 3.5**

### Property 13: Maximum particle count invariant

*For any* point in time during gameplay, the number of active particles in the ParticleSystem should never exceed the configured maximum particle limit.

**Validates: Requirements 4.1**

### Property 14: Collision detection independence from visual effects

*For any* game state with active screen shake, collision detection results (piece placement validity, line detection) should be identical to the results with shake offset set to zero.

**Validates: Requirements 4.3**

### Property 15: Particle memory cleanup

*For any* set of particles that have all expired, after the next update cycle, the active particle count should be reduced by the number of expired particles.

**Validates: Requirements 4.5**

## Error Handling

### Particle System Errors

1. **Maximum Particle Limit Exceeded**
   - Detection: Check particle count before spawning
   - Handling: Skip particle creation, log warning in development mode
   - Recovery: Automatic - system continues with existing particles

2. **Invalid Fruit Color Mapping**
   - Detection: Emoji not found in FruitColors map
   - Handling: Use default white color
   - Recovery: Automatic - effect still renders

3. **Canvas Context Lost**
   - Detection: ctx.isContextLost() check
   - Handling: Skip rendering, attempt context restoration
   - Recovery: Retry on next frame

### Screen Shake Errors

1. **Invalid Shake Parameters**
   - Detection: Validate intensity and duration ranges
   - Handling: Clamp to valid ranges (intensity: 0-20, duration: 50-1000ms)
   - Recovery: Automatic - use clamped values

2. **Shake Accumulation Overflow**
   - Detection: Check combined intensity before adding shake
   - Handling: Scale down all active shakes proportionally
   - Recovery: Automatic - maintain max intensity bound

### Performance Degradation

1. **Low Frame Rate Detection**
   - Detection: Track frame times, calculate rolling average FPS
   - Handling: Reduce particle spawn rate by 50%
   - Recovery: Gradually restore spawn rate when FPS improves

2. **Memory Pressure**
   - Detection: Particle count growing unexpectedly
   - Handling: Force cleanup of oldest particles
   - Recovery: Investigate particle expiration logic

## Testing Strategy

### Unit Testing

The visual effects system will use standard unit tests for:

1. **Particle Creation**
   - Test particle spawning with various parameters
   - Verify initial particle properties (position, velocity, color)
   - Test edge cases: zero particles, maximum particles

2. **Screen Shake Mechanics**
   - Test shake triggering with different intensities
   - Verify shake combination logic
   - Test shake expiration and reset

3. **Color Mapping**
   - Test all fruit emoji to color mappings
   - Test fallback for unknown emojis

4. **Celebration Triggers**
   - Test Tetris celebration activation
   - Test combo celebration thresholds
   - Verify particle density calculations

### Property-Based Testing

The system will use **fast-check** (JavaScript property-based testing library) to verify universal properties:

**Configuration:**
- Minimum 100 iterations per property test
- Each property test tagged with format: `**Feature: visual-effects, Property {N}: {description}**`
- Tests located in `js/effects.test.js`

**Property Test Coverage:**

1. **Particle Physics** (Property 4)
   - Generate random particles with various velocities and positions
   - Verify position updates follow physics equations
   - Test with different time steps

2. **Particle Lifecycle** (Property 5)
   - Generate particles with random lifespans
   - Advance time and verify expired particles are removed
   - Ensure no memory leaks

3. **Shake Intensity Bounds** (Property 8)
   - Generate random combinations of simultaneous shakes
   - Verify combined intensity never exceeds maximum
   - Test with extreme values

4. **Collision Independence** (Property 14)
   - Generate random game states and piece positions
   - Verify collision detection with and without shake offset
   - Ensure results are identical

5. **Maximum Particle Invariant** (Property 13)
   - Generate random sequences of particle spawn events
   - Verify particle count never exceeds limit
   - Test with rapid spawning

### Integration Testing

1. **Full Game Integration**
   - Play through game scenarios triggering all effects
   - Verify effects don't interfere with gameplay
   - Test performance with all effects active

2. **Visual Regression**
   - Capture screenshots of effects at key moments
   - Compare against baseline images
   - Detect unintended visual changes

### Performance Testing

1. **Frame Rate Monitoring**
   - Measure FPS with maximum particles active
   - Verify FPS stays above 30 with all effects
   - Test on lower-end devices

2. **Memory Profiling**
   - Monitor memory usage over extended play sessions
   - Verify no memory leaks from particle system
   - Test particle cleanup efficiency

## Implementation Notes

### Performance Optimizations

1. **Object Pooling**
   - Reuse particle objects instead of creating new ones
   - Maintain pool of inactive particles
   - Reduces garbage collection pressure

2. **Spatial Partitioning**
   - Only update particles within viewport
   - Skip rendering for off-screen particles
   - Improves performance with many particles

3. **Batch Rendering**
   - Group particles by type for rendering
   - Minimize context state changes
   - Use single draw call per particle type when possible

### Canvas Rendering Techniques

1. **Particle Rendering**
   - Use `globalAlpha` for opacity
   - Use `fillRect` for simple particles
   - Use `fillText` for emoji-based juice particles
   - Apply rotation with `save/restore` context

2. **Screen Shake Implementation**
   - Apply `translate` to canvas context before rendering
   - Reset translation after frame complete
   - Ensure UI elements (score, hold, next) are unaffected

### Integration Points

1. **Game Event Hooks**
   - `onLineClear(lines)` - Trigger particle effects and shake
   - `onHardDrop(distance)` - Trigger subtle shake
   - `onTetris()` - Trigger celebration
   - `onCombo(count, size)` - Trigger combo celebration

2. **Renderer Integration**
   - Add `particleSystem` property to TetrisRenderer
   - Add `screenShake` property to TetrisRenderer
   - Call `update()` and `render()` in render loop
   - Apply shake offset before rendering game elements

3. **Configuration**
   - Add effects settings to game settings object
   - Allow enabling/disabling individual effect types
   - Provide intensity multipliers for accessibility
