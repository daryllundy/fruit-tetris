
import assert from 'assert';

// Property 4: Particle physics simulation
// Validates: Requirements 1.4
export const testParticlePhysicsSimulation = async ({ Particle }) => {
    const particle = new Particle(0, 0, 'test', {
        vx: 10,
        vy: 0,
        gravity: 1,
        friction: 1 // No friction for easier calculation
    });

    // Initial state
    assert.strictEqual(particle.x, 0);
    assert.strictEqual(particle.y, 0);

    // Update 1 frame
    particle.update(16); // deltaTime doesn't affect physics in current implementation, but good to pass

    // x should increase by vx (10)
    // y should increase by vy (0)
    // vy should increase by gravity (1)
    assert.strictEqual(particle.x, 10);
    assert.strictEqual(particle.y, 0);
    assert.strictEqual(particle.vy, 1);

    // Update 2nd frame
    particle.update(16);

    // x should increase by vx (10) -> 20
    // y should increase by vy (1) -> 1
    // vy should increase by gravity (1) -> 2
    assert.strictEqual(particle.x, 20);
    assert.strictEqual(particle.y, 1);
    assert.strictEqual(particle.vy, 2);
};

// Property 5: Particle lifecycle management
// Validates: Requirements 1.5
export const testParticleLifecycleManagement = async ({ Particle }) => {
    const life = 10;
    const particle = new Particle(0, 0, 'test', { life });

    assert.strictEqual(particle.active, true);
    assert.strictEqual(particle.age, 0);
    assert.strictEqual(particle.opacity, 1.0);

    // Simulate life (active for life-1 updates, dies on the life-th update if age starts at 0 and increments before check)
    // Actually, if age starts at 0:
    // Update 1: age=1. Active.
    // ...
    // Update 9: age=9. Active.
    // Update 10: age=10. Inactive.

    for (let i = 0; i < life - 1; i++) {
        particle.update(16);
        assert.strictEqual(particle.active, true, `Particle should be active at age ${particle.age}`);
        assert.ok(particle.opacity <= 1.0 && particle.opacity >= 0, 'Opacity should be between 0 and 1');
    }

    // One more update should kill it (age becomes 10)
    particle.update(16);
    assert.strictEqual(particle.active, false, 'Particle should be inactive after exceeding maxLife');
};

// Property 13: Maximum particle count invariant
// Validates: Requirements 4.1
export const testMaxParticleCountInvariant = async ({ ParticleSystem }) => {
    const maxParticles = 10;
    const system = new ParticleSystem(maxParticles);

    // Try to create more than max particles
    system.createJuiceSplatter(0, 0, '#FFF', 20);

    assert.ok(system.particles.length <= maxParticles, `Particle count ${system.particles.length} should not exceed max ${maxParticles}`);

    // Add more
    system.createSparkles(0, 0, 20);
    assert.ok(system.particles.length <= maxParticles, `Particle count ${system.particles.length} should not exceed max ${maxParticles}`);
};

// Property 8: Screen shake intensity bounds
// Validates: Requirements 2.4
export const testScreenShakeIntensityBounds = async ({ ScreenShake }) => {
    const shake = new ScreenShake();

    // Add massive shake
    shake.shake(100, 100);

    // Should be clamped to 20 (as defined in implementation)
    assert.ok(shake.intensity <= 20, `Intensity ${shake.intensity} should be clamped to 20`);

    // Add more shake
    shake.shake(100, 100);
    assert.ok(shake.intensity <= 20, `Intensity ${shake.intensity} should still be clamped to 20`);
};

// Property 9: Screen shake reset
// Validates: Requirements 2.5
export const testScreenShakeReset = async ({ ScreenShake }) => {
    const shake = new ScreenShake();
    shake.shake(10, 100); // 10 intensity, 100ms duration (simulated)

    // Update until duration expires
    // Note: implementation uses duration as time remaining
    shake.update(50); // Halfway
    assert.ok(shake.intensity > 0, 'Shake should still be active');

    shake.update(60); // Past end
    assert.strictEqual(shake.intensity, 0, 'Intensity should be 0 after duration expires');
    assert.strictEqual(shake.offsetX, 0, 'OffsetX should be 0 after duration expires');
    assert.strictEqual(shake.offsetY, 0, 'OffsetY should be 0 after duration expires');
};

// Property 2: Fruit color mapping consistency
// Validates: Requirements 1.2
export const testFruitColorMappingConsistency = async ({ ParticleSystem }) => {
    const system = new ParticleSystem();
    const testColor = '#FF0000';

    system.createJuiceSplatter(0, 0, testColor, 5);

    assert.strictEqual(system.particles.length, 5);

    // Verify all particles have the correct color
    for (const p of system.particles) {
        assert.strictEqual(p.color, testColor, 'Particle color should match input color');
        assert.strictEqual(p.type, 'juice', 'Particle type should be juice');
    }
};

// Property 3: Sparkle particle variety
// Validates: Requirements 1.3
export const testSparkleParticleVariety = async ({ ParticleSystem }) => {
    const system = new ParticleSystem();
    system.createSparkles(0, 0, 10);

    // Verify variety in size and velocity
    const sizes = new Set(system.particles.map(p => p.size));
    const vxs = new Set(system.particles.map(p => p.vx));
    const vys = new Set(system.particles.map(p => p.vy));

    // Should have multiple different sizes and velocities
    assert.ok(sizes.size > 1, 'Sparkles should have variety in size');
    assert.ok(vxs.size > 1, 'Sparkles should have variety in vx');
    assert.ok(vys.size > 1, 'Sparkles should have variety in vy');

    // Verify type
    for (const p of system.particles) {
        assert.strictEqual(p.type, 'sparkle', 'Particle type should be sparkle');
    }
};

// Property 10: Combo celebration intensity scaling
// Validates: Requirements 3.2
export const testComboCelebrationIntensityScaling = async ({ CelebrationManager, ParticleSystem, ScreenShake }) => {
    const system = new ParticleSystem();
    const shake = new ScreenShake();
    const manager = new CelebrationManager(system, shake);

    // Low combo
    manager.triggerComboCelebration(0, 0, 1);
    const lowComboParticles = system.particles.length;
    const lowComboShake = shake.intensity;

    system.clear();
    shake.intensity = 0;

    // High combo
    manager.triggerComboCelebration(0, 0, 5);
    const highComboParticles = system.particles.length;
    const highComboShake = shake.intensity;

    assert.ok(highComboParticles > lowComboParticles, 'High combo should produce more particles');
    assert.ok(highComboShake > lowComboShake, 'High combo should produce more shake');
};

// Property 11: Celebration spatial distribution
// Validates: Requirements 3.3
export const testCelebrationSpatialDistribution = async ({ CelebrationManager, ParticleSystem, ScreenShake }) => {
    const system = new ParticleSystem();
    const shake = new ScreenShake();
    const manager = new CelebrationManager(system, shake);

    manager.triggerTetrisCelebration(100, 100);

    // Check if particles are distributed around the center
    const xs = system.particles.map(p => p.x);
    const ys = system.particles.map(p => p.y);

    // Should be at 100, 100 initially
    assert.strictEqual(xs[0], 100);
    assert.strictEqual(ys[0], 100);

    // Update to let them move
    system.update(16);

    const newXs = system.particles.map(p => p.x);
    const newYs = system.particles.map(p => p.y);

    // Calculate spread
    const minX = Math.min(...newXs);
    const maxX = Math.max(...newXs);
    const minY = Math.min(...newYs);
    const maxY = Math.max(...newYs);

    assert.ok(maxX - minX > 0, 'Particles should spread out horizontally');
    assert.ok(maxY - minY > 0, 'Particles should spread out vertically');
};

// Property 12: High combo color variety
// Validates: Requirements 3.5
export const testHighComboColorVariety = async ({ CelebrationManager, ParticleSystem, ScreenShake }) => {
    const system = new ParticleSystem();
    const shake = new ScreenShake();
    const manager = new CelebrationManager(system, shake);

    // Trigger high combo (>= 5)
    manager.triggerComboCelebration(0, 0, 5);

    const colors = new Set(system.particles.map(p => p.color));

    // Should have multiple colors
    assert.ok(colors.size > 1, `High combo should have variety of colors, got ${colors.size}`);
};

// Property 15: Particle memory cleanup
// Validates: Requirements 4.5
export const testParticleMemoryCleanup = async ({ ParticleSystem }) => {
    const system = new ParticleSystem();

    // Create particles with short life
    system.createJuiceSplatter(0, 0, '#FFF', 10);

    // Force particles to expire
    // Max life is random 30-50, so update 60 times
    for (let i = 0; i < 60; i++) {
        system.update(16);
    }

    // Should be empty
    assert.strictEqual(system.particles.length, 0, 'Particles should be removed after expiration');

    // Should be in pool
    assert.strictEqual(system.pool.length, 10, 'Expired particles should be in pool');
};

// Property 14: Collision detection independence from visual effects
// Validates: Requirements 4.3
export const testCollisionDetectionIndependence = async ({ TetrisGame, ScreenShake, Tetromino }) => {
    const game = new TetrisGame();
    const shake = new ScreenShake();
    
    // Set up game with some blocks on the grid
    game.grid[19][0] = { type: 'I', emoji: '🍌' };
    game.grid[19][1] = { type: 'O', emoji: '🍊' };
    game.grid[19][2] = { type: 'T', emoji: '🍎' };
    game.grid[18][0] = { type: 'S', emoji: '🍓' };
    
    // Create a test piece
    const testPiece = new Tetromino('T');
    testPiece.setPosition(5, 10);
    
    // Test various positions with and without shake
    const testPositions = [
        { x: 0, y: 18, desc: 'collision with bottom blocks' },
        { x: 5, y: 10, desc: 'valid position in middle' },
        { x: -1, y: 10, desc: 'out of bounds left' },
        { x: 9, y: 10, desc: 'out of bounds right' },
        { x: 5, y: 19, desc: 'near bottom' },
        { x: 0, y: 0, desc: 'top left corner' },
        { x: 8, y: 0, desc: 'top right area' }
    ];
    
    for (const pos of testPositions) {
        // Test without shake
        shake.intensity = 0;
        shake.offsetX = 0;
        shake.offsetY = 0;
        const resultNoShake = game.isValidPosition(pos.x, pos.y, testPiece.getCurrentShape());
        
        // Test with various shake intensities
        const shakeIntensities = [5, 10, 15, 20];
        
        for (const intensity of shakeIntensities) {
            shake.shake(intensity, 100);
            shake.update(16); // Update to generate offsets
            
            const resultWithShake = game.isValidPosition(pos.x, pos.y, testPiece.getCurrentShape());
            
            assert.strictEqual(
                resultWithShake,
                resultNoShake,
                `Collision detection at (${pos.x}, ${pos.y}) [${pos.desc}] should be identical with shake intensity ${intensity}. ` +
                `Without shake: ${resultNoShake}, with shake (offset: ${shake.offsetX.toFixed(2)}, ${shake.offsetY.toFixed(2)}): ${resultWithShake}`
            );
        }
    }
    
    // Test rotation validity with shake
    game.currentPiece = new Tetromino('I');
    game.currentPiece.setPosition(5, 5);
    
    // Get rotation shape
    const originalRotation = game.currentPiece.currentRotation;
    game.currentPiece.rotate(true);
    const rotatedShape = game.currentPiece.getCurrentShape();
    game.currentPiece.currentRotation = originalRotation; // Reset
    
    // Test without shake
    shake.intensity = 0;
    shake.offsetX = 0;
    shake.offsetY = 0;
    const rotationValidNoShake = game.isValidPosition(5, 5, rotatedShape);
    
    // Test with shake
    shake.shake(15, 100);
    shake.update(16);
    const rotationValidWithShake = game.isValidPosition(5, 5, rotatedShape);
    
    assert.strictEqual(
        rotationValidWithShake,
        rotationValidNoShake,
        'Rotation validity should be identical with and without shake'
    );
};
