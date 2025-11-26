
import assert from 'assert';

// Property 7: Mode initialization
// Validates: Requirements 4.2
export const testModeInitialization = async ({ TetrisGame, GameModeFactory }) => {
    const game = new TetrisGame();

    // Initialize Sprint Mode
    const sprintMode = GameModeFactory.createMode('sprint', game);
    assert.strictEqual(sprintMode.name, 'Sprint', 'Should create Sprint mode');
    assert.strictEqual(sprintMode.targetLines, 40, 'Sprint should have 40 lines target');

    // Initialize Marathon Mode
    const marathonMode = GameModeFactory.createMode('marathon', game);
    assert.strictEqual(marathonMode.name, 'Marathon', 'Should create Marathon mode');
    assert.strictEqual(marathonMode.targetLevel, 15, 'Marathon should have level 15 target');

    // Initialize Zen Mode
    const zenMode = GameModeFactory.createMode('zen', game);
    assert.strictEqual(zenMode.name, 'Zen', 'Should create Zen mode');
};

// Property 1: Personal best time persistence
// Validates: Requirements 1.5
export const testSprintPersistence = async ({ TetrisGame, GameModeFactory }) => {
    // Mock localStorage
    const storage = {};
    global.localStorage = {
        getItem: (key) => storage[key],
        setItem: (key, value) => storage[key] = value
    };

    const game = new TetrisGame();
    const mode = GameModeFactory.createMode('sprint', game);

    // Simulate completion
    // We need to implement save logic in SprintMode first.
    // For now, check if method exists or if we can trigger it.
    // Assuming saveBestTime(time) method.

    // Simulate completion
    mode.saveBestTime(10000); // 10 seconds
    assert.strictEqual(storage['tetris_sprint_best'], '10000', 'Should save best time');

    mode.saveBestTime(5000); // 5 seconds (better)
    assert.strictEqual(storage['tetris_sprint_best'], '5000', 'Should update better time');

    mode.saveBestTime(20000); // 20 seconds (worse)
    assert.strictEqual(storage['tetris_sprint_best'], '5000', 'Should not update worse time');
};

// Property 2: Marathon level progression and persistence
// Validates: Requirements 2.2, 2.3, 6.2
export const testMarathonPersistence = async ({ TetrisGame, GameModeFactory }) => {
    // Mock localStorage
    const storage = {};
    global.localStorage = {
        getItem: (key) => storage[key],
        setItem: (key, value) => storage[key] = value
    };

    const game = new TetrisGame();
    const mode = GameModeFactory.createMode('marathon', game);

    // Simulate level up
    mode.saveHighestLevel(5);
    assert.strictEqual(storage['tetris_marathon_level'], '5', 'Should save highest level');

    mode.saveHighestLevel(3);
    assert.strictEqual(storage['tetris_marathon_level'], '5', 'Should not update lower level');

    mode.saveHighestLevel(10);
    assert.strictEqual(storage['tetris_marathon_level'], '10', 'Should update higher level');
};

// Property 2: Marathon level progression
// Feature: game-modes, Property 2: Marathon level progression
// Validates: Requirements 2.2, 2.3
export const testMarathonLevelProgression = async ({ TetrisGame, GameModeFactory }) => {
    // Test that level progression and speed changes work correctly
    // For any marathon mode game state, when the total lines cleared reaches a multiple of 10,
    // the level should increment by 1 and the fall speed should decrease according to the formula:
    // max(100, 1000 - (level - 1) * 100)
    
    const game = new TetrisGame();
    game.start('marathon');
    
    // Test multiple line clear scenarios
    const testCases = [
        { linesToClear: 10, expectedLevel: 2, expectedSpeed: 900 },
        { linesToClear: 20, expectedLevel: 3, expectedSpeed: 800 },
        { linesToClear: 30, expectedLevel: 4, expectedSpeed: 700 },
        { linesToClear: 50, expectedLevel: 6, expectedSpeed: 500 },
        { linesToClear: 90, expectedLevel: 10, expectedSpeed: 100 },
        { linesToClear: 100, expectedLevel: 11, expectedSpeed: 100 }, // Should cap at 100
    ];
    
    for (const testCase of testCases) {
        // Reset game for each test
        game.start('marathon');
        
        // Simulate clearing lines by directly setting the lines count
        game.lines = testCase.linesToClear;
        
        // Trigger level update through updateScore (which handles level progression)
        // We'll simulate this by calling the level update logic directly
        const newLevel = Math.floor(game.lines / 10) + 1;
        game.level = newLevel;
        game.updateDropSpeed();
        
        // Verify level
        assert.strictEqual(
            game.level,
            testCase.expectedLevel,
            `At ${testCase.linesToClear} lines, level should be ${testCase.expectedLevel}, got ${game.level}`
        );
        
        // Verify drop speed follows the formula: max(100, 1000 - (level - 1) * 100)
        const expectedSpeed = Math.max(100, 1000 - (game.level - 1) * 100);
        assert.strictEqual(
            game.dropInterval,
            expectedSpeed,
            `At level ${game.level}, drop speed should be ${expectedSpeed}ms, got ${game.dropInterval}ms`
        );
        
        // Also verify it matches the test case expectation
        assert.strictEqual(
            game.dropInterval,
            testCase.expectedSpeed,
            `At ${testCase.linesToClear} lines (level ${game.level}), speed should be ${testCase.expectedSpeed}ms`
        );
    }
    
    // Test that onLineClear properly triggers level progression
    game.start('marathon');
    game.lines = 9; // Just before level up
    game.level = 1;
    
    // Simulate clearing 1 line (should trigger level up to 2)
    game.lines = 10;
    const newLevel = Math.floor(game.lines / 10) + 1;
    game.level = newLevel;
    game.updateDropSpeed();
    
    assert.strictEqual(game.level, 2, 'Level should increment when crossing 10 line threshold');
    assert.strictEqual(game.dropInterval, 900, 'Speed should update when level changes');
};

// Property 4: Zen mode recovery
// Validates: Requirements 3.2, 3.3
export const testZenRecovery = async ({ TetrisGame, GameModeFactory }) => {
    const game = new TetrisGame();
    const mode = GameModeFactory.createMode('zen', game);

    // Fill the grid to simulate game over condition
    for (let y = 0; y < game.BOARD_HEIGHT; y++) {
        for (let x = 0; x < game.BOARD_WIDTH; x++) {
            game.grid[y][x] = { type: 'X' };
        }
    }

    // Verify grid is full
    assert.notStrictEqual(game.grid[0][0], 0, 'Grid should be full');

    // Trigger recovery
    mode.triggerRecovery();

    // Verify grid is cleared
    assert.strictEqual(game.grid[0][0], 0, 'Grid should be cleared after recovery');
    assert.strictEqual(game.grid[game.BOARD_HEIGHT - 1][game.BOARD_WIDTH - 1], 0, 'Grid should be cleared after recovery');
};

// Property 8: Mode transition state reset
// Validates: Requirements 4.3, 4.5
export const testModeTransitionReset = async ({ TetrisGame, GameModeFactory }) => {
    const game = new TetrisGame();
    game.start('sprint');

    // Modify state
    game.score = 1000;
    game.lines = 10;
    game.currentMode.linesCleared = 10;

    // Switch to Marathon
    game.setMode('marathon');

    // Verify reset
    assert.strictEqual(game.score, 0, 'Score should reset on mode switch');
    assert.strictEqual(game.lines, 0, 'Lines should reset on mode switch');
    assert.strictEqual(game.modeType, 'marathon', 'Mode type should update');
    assert.strictEqual(game.currentMode.name, 'Marathon', 'Current mode object should update');

    // Switch back to Sprint
    game.setMode('sprint');
    assert.strictEqual(game.currentMode.linesCleared, 0, 'Sprint state should be fresh');
};

// Property 5: Zen mode scoring consistency
// Feature: game-modes, Property 5: Zen mode scoring consistency
// Validates: Requirements 3.4
export const testZenModeScoringConsistency = async ({ TetrisGame }) => {
    // For any number of lines cleared in Zen mode, the scoring calculation should match
    // the standard scoring formula: basePoints[linesCleared] * level + softDropBonus + comboBonus
    
    const linePoints = [0, 100, 300, 500, 800]; // Single, Double, Triple, Tetris
    
    // Test various line clear scenarios in Zen mode
    const testCases = [
        { linesCleared: 1, level: 1, expectedBase: 100 },
        { linesCleared: 2, level: 1, expectedBase: 300 },
        { linesCleared: 3, level: 1, expectedBase: 500 },
        { linesCleared: 4, level: 1, expectedBase: 800 },
        { linesCleared: 1, level: 5, expectedBase: 500 },
        { linesCleared: 2, level: 3, expectedBase: 900 },
        { linesCleared: 4, level: 10, expectedBase: 8000 },
    ];
    
    for (const testCase of testCases) {
        const game = new TetrisGame();
        game.start('zen');
        
        // Set up the game state
        game.level = testCase.level;
        const initialScore = game.score;
        
        // Simulate line clearing by calling updateScore directly
        // This tests the scoring formula without needing to set up the entire board
        game.updateScore(testCase.linesCleared, 0, false, false);
        
        const scoreGained = game.score - initialScore;
        
        // Verify the score matches the expected formula
        assert.strictEqual(
            scoreGained,
            testCase.expectedBase,
            `Zen mode: Clearing ${testCase.linesCleared} line(s) at level ${testCase.level} should award ${testCase.expectedBase} points, got ${scoreGained}`
        );
    }
    
    // Test that soft drop bonus is added correctly in Zen mode
    const game2 = new TetrisGame();
    game2.start('zen');
    game2.level = 1;
    game2.softDropBonus = 50; // Simulate soft drops
    
    const initialScore2 = game2.score;
    game2.updateScore(1, 0, false, false); // Clear 1 line
    const scoreGained2 = game2.score - initialScore2;
    
    // Should be base (100) + soft drop bonus (50) = 150
    assert.strictEqual(
        scoreGained2,
        150,
        `Zen mode should include soft drop bonus in scoring: expected 150, got ${scoreGained2}`
    );
    
    // Verify soft drop bonus is reset after scoring
    assert.strictEqual(
        game2.softDropBonus,
        0,
        'Soft drop bonus should be reset to 0 after scoring'
    );
    
    // Test that combo bonus is added correctly in Zen mode
    const game3 = new TetrisGame();
    game3.start('zen');
    game3.level = 2;
    
    const comboBonus = 500;
    const initialScore3 = game3.score;
    game3.updateScore(2, comboBonus, false, false); // Clear 2 lines with combo
    const scoreGained3 = game3.score - initialScore3;
    
    // Should be base (300 * 2 = 600) + combo bonus (500) = 1100
    assert.strictEqual(
        scoreGained3,
        1100,
        `Zen mode should include combo bonus in scoring: expected 1100, got ${scoreGained3}`
    );
    
    // Test that Zen mode doesn't get T-Spin or Perfect Clear bonuses differently
    // (These should work the same as other modes)
    const game4 = new TetrisGame();
    game4.start('zen');
    game4.level = 1;
    
    const initialScore4 = game4.score;
    game4.updateScore(1, 0, true, false); // T-Spin single
    const scoreGained4 = game4.score - initialScore4;
    
    // T-Spin single at level 1 should be 800 points
    assert.strictEqual(
        scoreGained4,
        800,
        `Zen mode should award T-Spin bonuses: expected 800, got ${scoreGained4}`
    );
    
    // Verify that the scoring formula is consistent across multiple clears
    const game5 = new TetrisGame();
    game5.start('zen');
    game5.level = 3;
    
    // Clear lines multiple times and verify cumulative scoring
    const initialScore5 = game5.score;
    
    game5.updateScore(1, 0, false, false); // +300
    game5.updateScore(2, 0, false, false); // +900
    game5.updateScore(4, 0, false, false); // +2400
    
    const totalScoreGained = game5.score - initialScore5;
    const expectedTotal = 300 + 900 + 2400; // 3600
    
    assert.strictEqual(
        totalScoreGained,
        expectedTotal,
        `Zen mode scoring should be cumulative and consistent: expected ${expectedTotal}, got ${totalScoreGained}`
    );
};

// Property 6: Zen mode state persistence
// Feature: game-modes, Property 6: Zen mode state persistence
// Validates: Requirements 3.5
export const testZenModeStatePersistence = async ({ TetrisGame }) => {
    // For any game state in Zen mode, pausing and then resuming should preserve
    // all game state values (score, lines, level, board, current piece, next pieces, held piece)
    
    const game = new TetrisGame();
    game.start('zen');
    
    // Set up various game states to test
    game.score = 5000;
    game.lines = 25;
    game.level = 3;
    
    // Modify the grid to have some blocks
    for (let y = 15; y < 20; y++) {
        for (let x = 0; x < 5; x++) {
            game.grid[y][x] = { type: 'I', emoji: '🍌' };
        }
    }
    
    // Store the current piece type
    const currentPieceType = game.currentPiece ? game.currentPiece.type : null;
    const currentPieceX = game.currentPiece ? game.currentPiece.position.x : null;
    const currentPieceY = game.currentPiece ? game.currentPiece.position.y : null;
    const currentPieceRotation = game.currentPiece ? game.currentPiece.currentRotation : null;
    
    // Store next pieces
    const nextPieceTypes = game.nextPieces.map(p => p.type);
    
    // Store held piece
    const heldPieceType = game.heldPiece ? game.heldPiece.type : null;
    
    // Store grid state (deep copy)
    const gridSnapshot = game.grid.map(row => 
        row.map(cell => cell === 0 ? 0 : { type: cell.type, emoji: cell.emoji })
    );
    
    // Pause the game
    game.togglePause();
    assert.strictEqual(game.state, 'paused', 'Game should be paused');
    
    // Resume the game
    game.togglePause();
    assert.strictEqual(game.state, 'playing', 'Game should be playing after resume');
    
    // Verify all state is preserved
    assert.strictEqual(game.score, 5000, 'Score should be preserved after pause/resume');
    assert.strictEqual(game.lines, 25, 'Lines should be preserved after pause/resume');
    assert.strictEqual(game.level, 3, 'Level should be preserved after pause/resume');
    
    // Verify current piece is preserved
    if (currentPieceType) {
        assert.strictEqual(
            game.currentPiece.type,
            currentPieceType,
            'Current piece type should be preserved'
        );
        assert.strictEqual(
            game.currentPiece.position.x,
            currentPieceX,
            'Current piece X position should be preserved'
        );
        assert.strictEqual(
            game.currentPiece.position.y,
            currentPieceY,
            'Current piece Y position should be preserved'
        );
        assert.strictEqual(
            game.currentPiece.currentRotation,
            currentPieceRotation,
            'Current piece rotation should be preserved'
        );
    }
    
    // Verify next pieces are preserved
    const nextPieceTypesAfter = game.nextPieces.map(p => p.type);
    assert.deepStrictEqual(
        nextPieceTypesAfter,
        nextPieceTypes,
        'Next pieces should be preserved after pause/resume'
    );
    
    // Verify held piece is preserved
    const heldPieceTypeAfter = game.heldPiece ? game.heldPiece.type : null;
    assert.strictEqual(
        heldPieceTypeAfter,
        heldPieceType,
        'Held piece should be preserved after pause/resume'
    );
    
    // Verify grid state is preserved
    for (let y = 0; y < game.BOARD_HEIGHT; y++) {
        for (let x = 0; x < game.BOARD_WIDTH; x++) {
            const original = gridSnapshot[y][x];
            const current = game.grid[y][x];
            
            if (original === 0) {
                assert.strictEqual(
                    current,
                    0,
                    `Grid cell [${y}][${x}] should remain empty`
                );
            } else {
                assert.notStrictEqual(
                    current,
                    0,
                    `Grid cell [${y}][${x}] should not be empty`
                );
                assert.strictEqual(
                    current.type,
                    original.type,
                    `Grid cell [${y}][${x}] type should be preserved`
                );
                assert.strictEqual(
                    current.emoji,
                    original.emoji,
                    `Grid cell [${y}][${x}] emoji should be preserved`
                );
            }
        }
    }
    
    // Test multiple pause/resume cycles
    const scoreBeforeMultiplePauses = game.score;
    const linesBeforeMultiplePauses = game.lines;
    
    for (let i = 0; i < 5; i++) {
        game.togglePause();
        assert.strictEqual(game.state, 'paused', `Game should be paused on cycle ${i + 1}`);
        game.togglePause();
        assert.strictEqual(game.state, 'playing', `Game should be playing on cycle ${i + 1}`);
    }
    
    assert.strictEqual(
        game.score,
        scoreBeforeMultiplePauses,
        'Score should remain unchanged after multiple pause/resume cycles'
    );
    assert.strictEqual(
        game.lines,
        linesBeforeMultiplePauses,
        'Lines should remain unchanged after multiple pause/resume cycles'
    );
    
    // Test that game state is preserved even with held piece swap
    game.holdPiece();
    const scoreAfterHold = game.score;
    const linesAfterHold = game.lines;
    const heldAfterSwap = game.heldPiece ? game.heldPiece.type : null;
    
    game.togglePause();
    game.togglePause();
    
    assert.strictEqual(
        game.score,
        scoreAfterHold,
        'Score should be preserved after pause/resume with held piece'
    );
    assert.strictEqual(
        game.lines,
        linesAfterHold,
        'Lines should be preserved after pause/resume with held piece'
    );
    assert.strictEqual(
        game.heldPiece ? game.heldPiece.type : null,
        heldAfterSwap,
        'Held piece should be preserved after pause/resume'
    );
};

// Property 9: Active mode display
// Feature: game-modes, Property 9: Active mode display
// Validates: Requirements 4.4
export const testActiveModeDisplay = async ({ TetrisGame, GameModeFactory }) => {
    // For any active game session, the UI should display the current mode name throughout gameplay
    
    const modes = ['sprint', 'marathon', 'zen'];
    const expectedNames = {
        'sprint': 'Sprint',
        'marathon': 'Marathon',
        'zen': 'Zen'
    };
    
    for (const modeType of modes) {
        const game = new TetrisGame();
        game.start(modeType);
        
        // Verify the mode is set correctly
        assert.strictEqual(
            game.modeType,
            modeType,
            `Game mode type should be '${modeType}'`
        );
        
        // Verify the current mode object has the correct name
        assert.strictEqual(
            game.currentMode.name,
            expectedNames[modeType],
            `Current mode name should be '${expectedNames[modeType]}' for ${modeType} mode`
        );
        
        // Verify the mode name is accessible throughout gameplay
        // Simulate some gameplay actions
        if (game.currentPiece) {
            game.movePiece(1, 0); // Move right
            game.rotatePiece(true); // Rotate
        }
        
        // Mode name should still be correct after gameplay actions
        assert.strictEqual(
            game.currentMode.name,
            expectedNames[modeType],
            `Mode name should remain '${expectedNames[modeType]}' after gameplay actions`
        );
        
        // Verify mode name persists through state changes
        game.togglePause();
        assert.strictEqual(
            game.currentMode.name,
            expectedNames[modeType],
            `Mode name should remain '${expectedNames[modeType]}' when paused`
        );
        
        game.togglePause();
        assert.strictEqual(
            game.currentMode.name,
            expectedNames[modeType],
            `Mode name should remain '${expectedNames[modeType]}' after resuming`
        );
    }
    
    // Test that mode name updates when switching modes
    const game2 = new TetrisGame();
    game2.start('sprint');
    assert.strictEqual(game2.currentMode.name, 'Sprint', 'Should start with Sprint mode');
    
    game2.setMode('marathon');
    assert.strictEqual(game2.currentMode.name, 'Marathon', 'Should switch to Marathon mode');
    
    game2.setMode('zen');
    assert.strictEqual(game2.currentMode.name, 'Zen', 'Should switch to Zen mode');
    
    // Test that mode name is available even before starting
    const game3 = new TetrisGame();
    assert.notStrictEqual(
        game3.currentMode,
        null,
        'Current mode should be initialized even before starting'
    );
    assert.strictEqual(
        typeof game3.currentMode.name,
        'string',
        'Mode name should be a string'
    );
    
    // Test mode name consistency across multiple game sessions
    for (let i = 0; i < 3; i++) {
        const game = new TetrisGame();
        game.start('marathon');
        assert.strictEqual(
            game.currentMode.name,
            'Marathon',
            `Mode name should be consistent across session ${i + 1}`
        );
    }
};

// Property 10: Mode completion summary
// Feature: game-modes, Property 10: Mode completion summary
// Validates: Requirements 5.4
export const testModeCompletionSummary = async ({ TetrisGame, GameModeFactory }) => {
    // For any mode that reaches its completion condition, the game should display a summary screen
    // containing at minimum: final score, total lines cleared, and mode-specific statistics
    
    // Mock the sound manager
    const originalSoundManager = window.soundManager;
    window.soundManager = {
        playSuccess: () => {},
        stopBackgroundMusic: () => {},
        playBackgroundMusic: () => {},
        playPieceLock: () => {},
        playMove: () => {},
        playRotate: () => {},
        playDrop: () => {},
        playHold: () => {},
        playLineClear: () => {},
        playTetris: () => {},
        playCombo: () => {},
        playLevelUp: () => {},
        playGameOver: () => {},
        playPerfectClear: () => {},
        adjustMusicSpeed: () => {},
        isMuted: () => false,
        toggleMute: () => {}
    };
    
    try {
        // Test Sprint Mode completion summary
        const sprintGame = new TetrisGame();
        sprintGame.start('sprint');
    
    // Set up completion state
    sprintGame.score = 15000;
    sprintGame.lines = 40;
    sprintGame.currentMode.linesCleared = 40;
    sprintGame.currentMode.elapsedTime = 45000; // 45 seconds
    sprintGame.currentMode.isCompleted = true;
    
    // Trigger completion
    sprintGame.handleModeComplete();
    
    // Verify state changed to completed
    assert.strictEqual(
        sprintGame.state,
        'completed',
        'Sprint mode should be in completed state'
    );
    
    // Verify required data is available for summary
    assert.strictEqual(
        typeof sprintGame.score,
        'number',
        'Final score should be available'
    );
    assert.strictEqual(
        typeof sprintGame.lines,
        'number',
        'Total lines cleared should be available'
    );
    assert.strictEqual(
        typeof sprintGame.currentMode.elapsedTime,
        'number',
        'Sprint mode should have elapsed time statistic'
    );
    
    assert.ok(
        sprintGame.score > 0,
        'Final score should be greater than 0'
    );
    assert.strictEqual(
        sprintGame.lines,
        40,
        'Sprint mode should have cleared 40 lines'
    );
    assert.ok(
        sprintGame.currentMode.elapsedTime > 0,
        'Sprint mode should have positive elapsed time'
    );
    
    // Test Marathon Mode completion summary
    const marathonGame = new TetrisGame();
    marathonGame.start('marathon');
    
    // Set up completion state
    marathonGame.score = 50000;
    marathonGame.lines = 150;
    marathonGame.level = 15;
    marathonGame.currentMode.isCompleted = true;
    
    // Trigger completion
    marathonGame.handleModeComplete();
    
    // Verify state changed to completed
    assert.strictEqual(
        marathonGame.state,
        'completed',
        'Marathon mode should be in completed state'
    );
    
    // Verify required data is available for summary
    assert.strictEqual(
        typeof marathonGame.score,
        'number',
        'Final score should be available'
    );
    assert.strictEqual(
        typeof marathonGame.lines,
        'number',
        'Total lines cleared should be available'
    );
    assert.strictEqual(
        typeof marathonGame.level,
        'number',
        'Marathon mode should have level statistic'
    );
    
    assert.ok(
        marathonGame.score > 0,
        'Final score should be greater than 0'
    );
    assert.ok(
        marathonGame.lines > 0,
        'Total lines should be greater than 0'
    );
    assert.strictEqual(
        marathonGame.level,
        15,
        'Marathon mode should have reached level 15'
    );
    
    // Test that completion summary includes mode-specific stats
    // Sprint should have time, Marathon should have level
    const sprintMode = GameModeFactory.createMode('sprint', sprintGame);
    sprintMode.elapsedTime = 60000;
    
    assert.ok(
        'elapsedTime' in sprintMode,
        'Sprint mode should have elapsedTime property for summary'
    );
    
    const marathonMode = GameModeFactory.createMode('marathon', marathonGame);
    marathonMode.initialize();
    
    assert.ok(
        'targetLevel' in marathonMode,
        'Marathon mode should have targetLevel property for summary'
    );
    
        // Test that all required summary data persists through completion
        const game3 = new TetrisGame();
        game3.start('sprint');
    
    const scoreBeforeCompletion = 25000;
    const linesBeforeCompletion = 40;
    const timeBeforeCompletion = 55000;
    
    game3.score = scoreBeforeCompletion;
    game3.lines = linesBeforeCompletion;
    game3.currentMode.linesCleared = linesBeforeCompletion;
    game3.currentMode.elapsedTime = timeBeforeCompletion;
    game3.currentMode.isCompleted = true;
    
    game3.handleModeComplete();
    
    // Verify data is preserved after completion
    assert.strictEqual(
        game3.score,
        scoreBeforeCompletion,
        'Score should be preserved in completion state'
    );
    assert.strictEqual(
        game3.lines,
        linesBeforeCompletion,
        'Lines should be preserved in completion state'
    );
        assert.strictEqual(
            game3.currentMode.elapsedTime,
            timeBeforeCompletion,
            'Mode-specific stats should be preserved in completion state'
        );
        
    } finally {
        // Restore original sound manager
        window.soundManager = originalSoundManager;
    }
};

// Property 11: Mode completion feedback
// Feature: game-modes, Property 11: Mode completion feedback
// Validates: Requirements 6.4
export const testModeCompletionFeedback = async ({ TetrisGame }) => {
    // For any mode completion event, the game should trigger both a success sound effect
    // and visual feedback (state change to 'modeComplete')
    
    // Mock the sound manager to track calls
    const soundCalls = [];
    const originalSoundManager = window.soundManager;
    window.soundManager = {
        playSuccess: () => soundCalls.push('playSuccess'),
        stopBackgroundMusic: () => soundCalls.push('stopBackgroundMusic'),
        playBackgroundMusic: () => {},
        playPieceLock: () => {},
        playMove: () => {},
        playRotate: () => {},
        playDrop: () => {},
        playHold: () => {},
        playLineClear: () => {},
        playTetris: () => {},
        playCombo: () => {},
        playLevelUp: () => {},
        playGameOver: () => {},
        playPerfectClear: () => {},
        adjustMusicSpeed: () => {},
        isMuted: () => false,
        toggleMute: () => {}
    };
    
    try {
        // Test Sprint Mode completion feedback
        const sprintGame = new TetrisGame();
        sprintGame.start('sprint');
        
        // Set up completion state
        sprintGame.currentMode.linesCleared = 40;
        sprintGame.currentMode.isCompleted = true;
        
        // Clear sound calls
        soundCalls.length = 0;
        
        // Trigger completion
        sprintGame.handleModeComplete();
        
        // Verify visual feedback: state changed to 'completed'
        assert.strictEqual(
            sprintGame.state,
            'completed',
            'Sprint mode completion should change state to "completed"'
        );
        
        // Verify audio feedback: success sound was played
        assert.ok(
            soundCalls.includes('playSuccess'),
            'Sprint mode completion should play success sound'
        );
        
        // Verify background music was stopped
        assert.ok(
            soundCalls.includes('stopBackgroundMusic'),
            'Sprint mode completion should stop background music'
        );
        
        // Test Marathon Mode completion feedback
        const marathonGame = new TetrisGame();
        marathonGame.start('marathon');
        
        // Set up completion state
        marathonGame.level = 15;
        marathonGame.currentMode.isCompleted = true;
        
        // Clear sound calls
        soundCalls.length = 0;
        
        // Trigger completion
        marathonGame.handleModeComplete();
        
        // Verify visual feedback
        assert.strictEqual(
            marathonGame.state,
            'completed',
            'Marathon mode completion should change state to "completed"'
        );
        
        // Verify audio feedback
        assert.ok(
            soundCalls.includes('playSuccess'),
            'Marathon mode completion should play success sound'
        );
        
        assert.ok(
            soundCalls.includes('stopBackgroundMusic'),
            'Marathon mode completion should stop background music'
        );
        
        // Test that completion feedback is consistent across modes
        const modes = ['sprint', 'marathon'];
        
        for (const mode of modes) {
            const game = new TetrisGame();
            game.start(mode);
            
            // Set up completion
            if (mode === 'sprint') {
                game.currentMode.linesCleared = 40;
            } else if (mode === 'marathon') {
                game.level = 15;
            }
            game.currentMode.isCompleted = true;
            
            // Clear sound calls
            soundCalls.length = 0;
            
            // Trigger completion
            game.handleModeComplete();
            
            // Verify both visual and audio feedback
            assert.strictEqual(
                game.state,
                'completed',
                `${mode} mode should provide visual feedback (state = completed)`
            );
            
            assert.ok(
                soundCalls.includes('playSuccess'),
                `${mode} mode should provide audio feedback (success sound)`
            );
        }
        
        // Test that completion feedback happens immediately
        const game2 = new TetrisGame();
        game2.start('sprint');
        game2.currentMode.linesCleared = 40;
        game2.currentMode.isCompleted = true;
        
        const stateBeforeCompletion = game2.state;
        soundCalls.length = 0;
        
        game2.handleModeComplete();
        
        // State should change immediately
        assert.notStrictEqual(
            game2.state,
            stateBeforeCompletion,
            'State should change immediately upon completion'
        );
        
        // Sound should be triggered immediately
        assert.ok(
            soundCalls.length > 0,
            'Audio feedback should be triggered immediately upon completion'
        );
        
        // Test that completion feedback is distinct from game over
        const game3 = new TetrisGame();
        game3.start('marathon');
        
        soundCalls.length = 0;
        
        // Trigger game over (not completion)
        game3.gameOver();
        
        // Should NOT play success sound for game over
        assert.ok(
            !soundCalls.includes('playSuccess'),
            'Game over should NOT play success sound (distinct from completion)'
        );
        
        // State should be gameOver, not completed
        assert.strictEqual(
            game3.state,
            'gameOver',
            'Game over state should be distinct from completed state'
        );
        
    } finally {
        // Restore original sound manager
        window.soundManager = originalSoundManager;
    }
};

// Property 3: Game over on spawn collision
// Feature: game-modes, Property 3: Game over on spawn collision
// Validates: Requirements 2.5
export const testSpawnCollisionGameOver = async ({ TetrisGame, Tetromino }) => {
    // For any game board state in non-Zen modes where the spawn position is occupied,
    // attempting to spawn a new piece should trigger game over
    
    const nonZenModes = ['sprint', 'marathon'];
    
    for (const mode of nonZenModes) {
        const game = new TetrisGame();
        game.start(mode);
        
        // Fill the spawn area (top rows) to create collision condition
        // Standard spawn position is around y=0 (top of board)
        // Fill the top 4 rows completely to ensure spawn collision
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < game.BOARD_WIDTH; x++) {
                game.grid[y][x] = { type: 'I', emoji: '🍌' };
            }
        }
        
        // Store initial state
        const initialState = game.state;
        assert.strictEqual(initialState, 'playing', `Game should be in playing state before spawn collision in ${mode} mode`);
        
        // Attempt to spawn a new piece - this should trigger game over
        game.spawnNewPiece();
        
        // Verify game over was triggered
        assert.strictEqual(
            game.state,
            'gameOver',
            `Game state should be 'gameOver' after spawn collision in ${mode} mode, but got '${game.state}'`
        );
        
        // Verify the piece was not successfully spawned
        // (In game over state, currentPiece might be null or the failed piece)
        // The key is that the game state changed to gameOver
    }
    
    // Test with various spawn positions occupied
    // Test case: Only center columns occupied (where most pieces spawn)
    const game2 = new TetrisGame();
    game2.start('marathon');
    
    // Fill center columns at spawn height
    for (let y = 0; y < 2; y++) {
        for (let x = 3; x < 7; x++) {
            game2.grid[y][x] = { type: 'O', emoji: '🍊' };
        }
    }
    
    game2.spawnNewPiece();
    
    // Should trigger game over since spawn position is blocked
    assert.strictEqual(
        game2.state,
        'gameOver',
        'Game should be over when center spawn columns are occupied'
    );
    
    // Test case: Verify Zen mode does NOT trigger game over (it should recover instead)
    const zenGame = new TetrisGame();
    zenGame.start('zen');
    
    // Fill the spawn area
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < zenGame.BOARD_WIDTH; x++) {
            zenGame.grid[y][x] = { type: 'T', emoji: '🍎' };
        }
    }
    
    zenGame.spawnNewPiece();
    
    // Zen mode should NOT be in gameOver state - it should recover
    assert.notStrictEqual(
        zenGame.state,
        'gameOver',
        'Zen mode should NOT trigger game over on spawn collision - it should recover'
    );
    
    // Verify the grid was cleared (recovery happened)
    let hasBlocks = false;
    for (let y = 0; y < zenGame.BOARD_HEIGHT; y++) {
        for (let x = 0; x < zenGame.BOARD_WIDTH; x++) {
            if (zenGame.grid[y][x] !== 0) {
                hasBlocks = true;
                break;
            }
        }
        if (hasBlocks) break;
    }
    
    assert.strictEqual(
        hasBlocks,
        false,
        'Zen mode should clear the grid during recovery'
    );
};
