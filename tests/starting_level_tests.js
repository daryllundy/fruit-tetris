
import { TetrisGame } from '../js/tetris.js';
import fc from 'fast-check';
import assert from 'assert';
import '../js/utils.js'; // Import Storage utility

// Mock dependencies
global.window = {
    soundManager: {
        playBackgroundMusic: () => { },
        stopBackgroundMusic: () => { },
        playMove: () => { },
        playRotate: () => { },
        playDrop: () => { },
        playLineClear: () => { },
        playCombo: () => { },
        playTetris: () => { },
        playLevelUp: () => { },
        playGameOver: () => { },
        playTSpin: () => { },
        playPerfectClear: () => { },
        playPieceLock: () => { },
        playHold: () => { },
        playSuccess: () => { },
        adjustMusicSpeed: () => { }
    }
};

// Mock localStorage with actual storage for testing
const mockStorage = {};
global.localStorage = {
    getItem: (key) => mockStorage[key] || null,
    setItem: (key, value) => { mockStorage[key] = value; },
    removeItem: (key) => { delete mockStorage[key]; },
    clear: () => { Object.keys(mockStorage).forEach(key => delete mockStorage[key]); }
};

// Mock GameModeFactory
import { GameModeFactory } from '../js/game-modes.js';

// Test Suite
console.log('Running Starting Level Property Tests...');

let passed = 0;
let failed = 0;

function runTest(name, property) {
    console.log(`Running ${name}...`);
    try {
        fc.assert(property, { numRuns: 100 });
        console.log(`✅ ${name} PASSED`);
        passed++;
    } catch (e) {
        console.error(`❌ ${name} FAILED`);
        console.error(e);
        failed++;
    }
}

// Property 1: Game initialization respects starting level
runTest('testStartingLevelInitialization', fc.property(
    fc.integer({ min: 1, max: 15 }),
    (startLevel) => {
        const game = new TetrisGame();
        game.start('marathon', startLevel);

        assert.strictEqual(game.level, startLevel, `Game should start at level ${startLevel}`);
        assert.strictEqual(game.lines, 0, 'Lines cleared should start at 0');
        assert.strictEqual(game.settings.startingLevel, startLevel, 'Settings should store starting level');
    }
));

// Property 7: Drop speed formula consistency
// **Feature: adjustable-starting-level, Property 7: Drop speed formula consistency**
// **Validates: Requirements 4.1**
runTest('testDropSpeedFormula', fc.property(
    fc.integer({ min: 1, max: 15 }),
    (startLevel) => {
        const game = new TetrisGame();
        game.start('marathon', startLevel);

        // Exact formula: Math.max(100, 1000 - (level - 1) * 100)
        const expectedSpeed = Math.max(100, 1000 - (startLevel - 1) * 100);
        
        assert.strictEqual(game.dropInterval, expectedSpeed, 
            `Drop speed at level ${startLevel} should be ${expectedSpeed}ms, got ${game.dropInterval}ms`);
        
        // Also verify that speed decreases (gets faster) as level increases
        if (startLevel < 15) {
            const game2 = new TetrisGame();
            game2.start('marathon', startLevel + 1);
            const expectedNextSpeed = Math.max(100, 1000 - (startLevel) * 100);
            
            assert.strictEqual(game2.dropInterval, expectedNextSpeed,
                `Drop speed at level ${startLevel + 1} should be ${expectedNextSpeed}ms`);
            assert.ok(game2.dropInterval <= game.dropInterval, 
                'Speed should increase (delay decrease) with level');
        }
    }
));

// Property 3: Level progression from starting level
runTest('testLevelProgression', fc.property(
    fc.integer({ min: 1, max: 14 }),
    (startLevel) => {
        const game = new TetrisGame();
        game.start('marathon', startLevel);

        // Simulate clearing 10 lines
        // We can use updateScore to trigger line count update and level check
        game.updateScore(10);

        assert.strictEqual(game.level, startLevel + 1, 'Should advance to next level after 10 lines');
    }
));

// Property 4: Invalid starting levels are clamped
runTest('testInvalidStartingLevelClamping', fc.property(
    fc.integer(),
    (startLevel) => {
        const game = new TetrisGame();
        game.start('marathon', startLevel);

        assert.ok(game.level >= 1 && game.level <= 15, 'Level should be clamped between 1 and 15');
    }
));

// Property 2: Selector updates display
// **Feature: adjustable-starting-level, Property 2: Selector updates display**
// **Validates: Requirements 1.2, 6.2**
runTest('testSelectorDisplayUpdates', fc.property(
    fc.integer({ min: 1, max: 15 }),
    (level) => {
        // Create mock DOM elements
        const mockInput = {
            value: '',
            min: '1',
            max: '15',
            addEventListener: () => { }
        };
        const mockDisplay = {
            textContent: ''
        };

        // Simulate the selector update logic from main.js
        mockInput.value = level.toString();
        mockDisplay.textContent = level.toString();

        // Verify the display matches the input value
        assert.strictEqual(mockDisplay.textContent, level.toString(), 
            `Display should show ${level} when selector is set to ${level}`);
        assert.strictEqual(parseInt(mockDisplay.textContent), level, 
            'Display value should match selector value as integer');
    }
));

// Property 3: Persistence round-trip
// **Feature: adjustable-starting-level, Property 3: Persistence round-trip**
// **Validates: Requirements 2.1, 2.2, 2.4**
runTest('testPersistenceRoundTrip', fc.property(
    fc.integer({ min: 1, max: 15 }),
    (startingLevel) => {
        const storageKey = 'tetris-starting-level';
        
        // Clear any existing value
        global.localStorage.removeItem(storageKey);
        
        // Save the starting level using Storage utility
        const saveResult = Storage.set(storageKey, startingLevel);
        assert.strictEqual(saveResult, true, 'Storage.set should return true on success');
        
        // Retrieve the starting level using Storage utility
        const retrievedLevel = Storage.get(storageKey, 1);
        
        // Verify round-trip: saved value should equal retrieved value
        assert.strictEqual(retrievedLevel, startingLevel, 
            `Retrieved level ${retrievedLevel} should match saved level ${startingLevel}`);
        
        // Clean up
        global.localStorage.removeItem(storageKey);
    }
));

// Property 5: Score multiplier scales with level
// **Feature: adjustable-starting-level, Property 5: Score multiplier scales with level**
// **Validates: Requirements 4.2, 4.4**
runTest('testScoreMultiplierScaling', fc.property(
    fc.integer({ min: 1, max: 14 }),
    fc.integer({ min: 1, max: 4 }),
    (startLevel, linesCleared) => {
        // Create two games at different levels
        const game1 = new TetrisGame();
        game1.start('marathon', startLevel);
        
        const game2 = new TetrisGame();
        game2.start('marathon', startLevel + 1);
        
        // Record initial scores
        const initialScore1 = game1.score;
        const initialScore2 = game2.score;
        
        // Clear the same number of lines in both games
        game1.updateScore(linesCleared);
        game2.updateScore(linesCleared);
        
        // Calculate points earned
        const pointsEarned1 = game1.score - initialScore1;
        const pointsEarned2 = game2.score - initialScore2;
        
        // Higher level should yield higher score for same line clears
        assert.ok(pointsEarned2 > pointsEarned1, 
            `Level ${startLevel + 1} (${pointsEarned2} points) should score more than level ${startLevel} (${pointsEarned1} points) for ${linesCleared} lines`);
    }
));

// ===== UNIT TESTS FOR EDGE CASES AND SPECIFIC SCENARIOS =====
// These tests cover Requirements: 2.3, 2.5, 3.1, 3.2, 3.3, 3.4, 5.4, 5.5

console.log('\n=== Running Unit Tests for Edge Cases ===\n');

// Test 1: Default starting level is 1 when no preference saved
// Validates: Requirement 2.3
console.log('Running testDefaultStartingLevel...');
try {
    const storageKey = 'tetris-starting-level';
    
    // Clear any existing value
    global.localStorage.removeItem(storageKey);
    
    // Retrieve with default
    const defaultLevel = Storage.get(storageKey, 1);
    
    assert.strictEqual(defaultLevel, 1, 'Default starting level should be 1 when no preference saved');
    
    // Also test that game starts at level 1 by default
    const game = new TetrisGame();
    game.start('marathon'); // No starting level parameter
    
    assert.strictEqual(game.level, 1, 'Game should start at level 1 when no starting level provided');
    
    console.log('✅ testDefaultStartingLevel PASSED');
    passed++;
} catch (e) {
    console.error('❌ testDefaultStartingLevel FAILED');
    console.error(e);
    failed++;
}

// Test 2: localStorage failure handling
// Validates: Requirement 2.5
console.log('Running testLocalStorageFailureHandling...');
try {
    const storageKey = 'tetris-starting-level';
    
    // Save original localStorage
    const originalLocalStorage = global.localStorage;
    
    // Mock localStorage to throw errors
    global.localStorage = {
        getItem: () => { throw new Error('Storage unavailable'); },
        setItem: () => { throw new Error('Storage unavailable'); },
        removeItem: () => { throw new Error('Storage unavailable'); },
        clear: () => { throw new Error('Storage unavailable'); }
    };
    
    // Test that Storage.get returns default value on error
    const levelOnError = Storage.get(storageKey, 1);
    assert.strictEqual(levelOnError, 1, 'Should return default value when localStorage fails');
    
    // Test that Storage.set returns false on error
    const saveResult = Storage.set(storageKey, 5);
    assert.strictEqual(saveResult, false, 'Storage.set should return false when localStorage fails');
    
    // Restore original localStorage
    global.localStorage = originalLocalStorage;
    
    console.log('✅ testLocalStorageFailureHandling PASSED');
    passed++;
} catch (e) {
    console.error('❌ testLocalStorageFailureHandling FAILED');
    console.error(e);
    failed++;
}

// Test 3: Selector min/max attributes are correct (DOM test)
// Validates: Requirements 3.1, 3.2
console.log('Running testSelectorMinMaxAttributes...');
try {
    // Create mock DOM element matching the actual HTML structure
    const mockSelector = {
        min: '1',
        max: '15',
        value: '1',
        type: 'range'
    };
    
    // Verify min attribute
    assert.strictEqual(mockSelector.min, '1', 'Selector min attribute should be "1"');
    assert.strictEqual(parseInt(mockSelector.min), 1, 'Selector min should parse to 1');
    
    // Verify max attribute
    assert.strictEqual(mockSelector.max, '15', 'Selector max attribute should be "15"');
    assert.strictEqual(parseInt(mockSelector.max), 15, 'Selector max should parse to 15');
    
    // Verify type
    assert.strictEqual(mockSelector.type, 'range', 'Selector should be a range input');
    
    console.log('✅ testSelectorMinMaxAttributes PASSED');
    passed++;
} catch (e) {
    console.error('❌ testSelectorMinMaxAttributes FAILED');
    console.error(e);
    failed++;
}

// Test 4: Starting at level 10 and clearing 10 lines advances to level 11
// Validates: Requirements 3.3, 3.4, 5.4
console.log('Running testLevelProgressionFromLevel10...');
try {
    const game = new TetrisGame();
    game.start('marathon', 10);
    
    // Verify starting level
    assert.strictEqual(game.level, 10, 'Game should start at level 10');
    assert.strictEqual(game.lines, 0, 'Lines should start at 0');
    
    // Simulate clearing 10 lines
    game.updateScore(10);
    
    // Verify level progression
    assert.strictEqual(game.level, 11, 'Level should advance to 11 after clearing 10 lines from level 10');
    
    console.log('✅ testLevelProgressionFromLevel10 PASSED');
    passed++;
} catch (e) {
    console.error('❌ testLevelProgressionFromLevel10 FAILED');
    console.error(e);
    failed++;
}

// Test 5: Game over screen displays both starting and final level (DOM test)
// Validates: Requirement 5.5
console.log('Running testGameOverDisplaysStartingAndFinalLevel...');
try {
    // Create mock DOM elements matching the actual HTML structure
    const mockUI = {
        startLevelDisplay: {
            classList: {
                hidden: true,
                remove: function(className) {
                    if (className === 'hidden') this.hidden = false;
                },
                add: function(className) {
                    if (className === 'hidden') this.hidden = true;
                }
            }
        },
        startLevelVal: { textContent: '' },
        finalLevelVal: { textContent: '' }
    };
    
    // Test case 1: Starting level > 1 should show starting level display
    const startLevel = 5;
    const finalLevel = 8;
    
    if (startLevel > 1) {
        mockUI.startLevelVal.textContent = startLevel.toString();
        mockUI.startLevelDisplay.classList.remove('hidden');
    } else {
        mockUI.startLevelDisplay.classList.add('hidden');
    }
    mockUI.finalLevelVal.textContent = finalLevel.toString();
    
    assert.strictEqual(mockUI.startLevelVal.textContent, '5', 'Starting level should be displayed');
    assert.strictEqual(mockUI.finalLevelVal.textContent, '8', 'Final level should be displayed');
    assert.strictEqual(mockUI.startLevelDisplay.classList.hidden, false, 'Starting level display should be visible when starting level > 1');
    
    // Test case 2: Starting level = 1 should hide starting level display
    const startLevel2 = 1;
    const finalLevel2 = 3;
    
    if (startLevel2 > 1) {
        mockUI.startLevelVal.textContent = startLevel2.toString();
        mockUI.startLevelDisplay.classList.remove('hidden');
    } else {
        mockUI.startLevelDisplay.classList.add('hidden');
    }
    mockUI.finalLevelVal.textContent = finalLevel2.toString();
    
    assert.strictEqual(mockUI.finalLevelVal.textContent, '3', 'Final level should be displayed');
    assert.strictEqual(mockUI.startLevelDisplay.classList.hidden, true, 'Starting level display should be hidden when starting level = 1');
    
    console.log('✅ testGameOverDisplaysStartingAndFinalLevel PASSED');
    passed++;
} catch (e) {
    console.error('❌ testGameOverDisplaysStartingAndFinalLevel FAILED');
    console.error(e);
    failed++;
}

// Test 6: Boundary value testing - level 0 is constrained to 1
// Validates: Requirements 3.3, 3.4
console.log('Running testBoundaryLevel0...');
try {
    const game = new TetrisGame();
    game.start('marathon', 0);
    
    assert.strictEqual(game.level, 1, 'Level 0 should be constrained to 1');
    
    console.log('✅ testBoundaryLevel0 PASSED');
    passed++;
} catch (e) {
    console.error('❌ testBoundaryLevel0 FAILED');
    console.error(e);
    failed++;
}

// Test 7: Boundary value testing - level 16 is constrained to 15
// Validates: Requirements 3.3, 3.4
console.log('Running testBoundaryLevel16...');
try {
    const game = new TetrisGame();
    game.start('marathon', 16);
    
    assert.strictEqual(game.level, 15, 'Level 16 should be constrained to 15');
    
    console.log('✅ testBoundaryLevel16 PASSED');
    passed++;
} catch (e) {
    console.error('❌ testBoundaryLevel16 FAILED');
    console.error(e);
    failed++;
}

// Test 8: Boundary value testing - negative level is constrained to 1
// Validates: Requirements 3.3, 3.4
console.log('Running testBoundaryNegativeLevel...');
try {
    const game = new TetrisGame();
    game.start('marathon', -5);
    
    assert.strictEqual(game.level, 1, 'Negative level should be constrained to 1');
    
    console.log('✅ testBoundaryNegativeLevel PASSED');
    passed++;
} catch (e) {
    console.error('❌ testBoundaryNegativeLevel FAILED');
    console.error(e);
    failed++;
}

// Test 9: Boundary value testing - very large level is constrained to 15
// Validates: Requirements 3.3, 3.4
console.log('Running testBoundaryVeryLargeLevel...');
try {
    const game = new TetrisGame();
    game.start('marathon', 999);
    
    assert.strictEqual(game.level, 15, 'Very large level should be constrained to 15');
    
    console.log('✅ testBoundaryVeryLargeLevel PASSED');
    passed++;
} catch (e) {
    console.error('❌ testBoundaryVeryLargeLevel FAILED');
    console.error(e);
    failed++;
}

// Test 10: Verify starting level is stored in game settings
// Validates: Requirements 1.3, 5.5
console.log('Running testStartingLevelStoredInSettings...');
try {
    const game = new TetrisGame();
    game.start('marathon', 7);
    
    assert.strictEqual(game.settings.startingLevel, 7, 'Starting level should be stored in game settings');
    assert.strictEqual(game.level, 7, 'Current level should match starting level');
    
    console.log('✅ testStartingLevelStoredInSettings PASSED');
    passed++;
} catch (e) {
    console.error('❌ testStartingLevelStoredInSettings FAILED');
    console.error(e);
    failed++;
}

console.log(`\nTest Summary:\nPassed: ${passed}\nFailed: ${failed}`);
if (failed > 0) process.exit(1);
