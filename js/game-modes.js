
export class GameMode {
    constructor(game) {
        this.game = game;
        this.name = 'Standard';
        this.description = 'Standard Tetris';
        this.isGameOver = false;
        this.isCompleted = false;
    }

    initialize() {
        this.isGameOver = false;
        this.isCompleted = false;
    }

    update(deltaTime) {
        // Base implementation does nothing
    }

    onLineClear(lines) {
        // Base implementation does nothing
    }

    onPieceLock() {
        // Base implementation does nothing
    }

    getDropSpeed() {
        // Default behavior: delegate to game's standard speed calculation
        // Subclasses can override to return fixed speed or custom formula
        return null; // null means "use default game logic"
    }

    shouldSpawn() {
        return true;
    }

    // Hook for game over condition
    checkGameOver() {
        return false;
    }
}

export class SprintMode extends GameMode {
    constructor(game) {
        super(game);
        this.name = 'Sprint';
        this.description = 'Clear 40 lines as fast as possible';
        this.targetLines = 40;
        this.linesCleared = 0;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.timerRunning = false;
    }

    initialize() {
        super.initialize();
        this.linesCleared = 0;
        this.elapsedTime = 0;
        this.timerRunning = false;
        this.startTime = Date.now();
        this.bestTime = this.loadBestTime();
    }

    loadBestTime() {
        const stored = localStorage.getItem('tetris_sprint_best');
        return stored ? parseInt(stored) : null;
    }

    saveBestTime(time) {
        const currentBest = this.loadBestTime();
        if (!currentBest || time < currentBest) {
            localStorage.setItem('tetris_sprint_best', time.toString());
            this.bestTime = time;
            return true; // New record
        }
        return false;
    }

    update(deltaTime) {
        if (this.timerRunning && !this.isCompleted && !this.isGameOver) {
            this.elapsedTime += deltaTime;
        }
    }

    startTimer() {
        this.timerRunning = true;
        this.startTime = Date.now() - this.elapsedTime;
    }

    stopTimer() {
        this.timerRunning = false;
    }

    onLineClear(lines) {
        this.linesCleared += lines.length;
        if (this.linesCleared >= this.targetLines) {
            this.isCompleted = true;
            this.stopTimer();
            this.saveBestTime(this.elapsedTime);
            this.game.handleModeComplete();
        }
    }

    getDropSpeed() {
        return 500; // Fixed speed for Sprint (Requirement 6.1)
    }
}

export class MarathonMode extends GameMode {
    constructor(game) {
        super(game);
        this.name = 'Marathon';
        this.description = 'Reach level 15';
        this.targetLevel = 15;
    }

    initialize() {
        super.initialize();
        // Game handles level/lines reset
        this.highestLevel = this.loadHighestLevel();
    }

    loadHighestLevel() {
        const stored = localStorage.getItem('tetris_marathon_level');
        return stored ? parseInt(stored) : 1;
    }

    saveHighestLevel(level) {
        const currentHighest = this.loadHighestLevel();
        if (level > currentHighest) {
            localStorage.setItem('tetris_marathon_level', level.toString());
            this.highestLevel = level;
            return true;
        }
        return false;
    }

    onLineClear(lines) {
        // Game handles level progression
        // Check for new high level
        if (this.game.level > this.highestLevel) {
            this.saveHighestLevel(this.game.level);
        }

        if (this.game.level >= this.targetLevel) {
            this.isCompleted = true;
            this.game.handleModeComplete();
        }
    }
}

export class ZenMode extends GameMode {
    constructor(game) {
        super(game);
        this.name = 'Zen';
        this.description = 'Relaxed play, no game over';
    }

    initialize() {
        super.initialize();
    }

    getDropSpeed() {
        return 800; // Fixed slow speed for Zen (Requirement 6.3)
    }

    // Zen mode specific: recovery instead of game over
    // This will be called by game.gameOver() if mode is Zen
    triggerRecovery() {
        // Clear the entire grid to allow fresh start
        // Or we could just clear top half, but clearing all is safer and simpler for "recovery"
        // Requirement 3.2 says "clear the top rows to make space".
        // Requirement 3.3 says "WHEN the board is cleared... allow current piece".
        // Let's clear the whole board for now as it guarantees spawn success.

        for (let y = 0; y < this.game.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.game.BOARD_WIDTH; x++) {
                this.game.grid[y][x] = 0;
            }
        }

        // Also clear any active effects or lines
        this.game.clearingLines = [];

        // Play gentle recovery sound (Requirement 6.4)
        window.soundManager.playZenRecovery();

        // Trigger visual effect (Requirement 3.2, 6.4)
        this.game.triggerZenRecoveryEffect();

        return true;
    }
}

export class GameModeFactory {
    static createMode(type, game) {
        switch (type) {
            case 'sprint': return new SprintMode(game);
            case 'marathon': return new MarathonMode(game);
            case 'zen': return new ZenMode(game);
            default: return new MarathonMode(game);
        }
    }
}
