// Main Tetris game logic

class TetrisGame {
    constructor() {
        // Game dimensions
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.BLOCK_SIZE = 30;
        
        // Game state
        this.state = 'menu'; // 'menu', 'playing', 'paused', 'gameOver'
        this.grid = create2DArray(this.BOARD_WIDTH, this.BOARD_HEIGHT);
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropTimer = 0;
        
        // Pieces
        this.currentPiece = null;
        this.nextPieces = [];
        this.heldPiece = null;
        this.canHold = true;
        this.ghostPiece = null;
        
        // Timing
        this.dropSpeed = 1000; // ms between automatic drops
        this.lastTime = 0;
        this.softDropBonus = 0;
        
        // Piece bag for fair distribution
        this.pieceBag = new TetrominoBag();
        
        // Game settings
        this.settings = {
            showGhost: true,
            lockDelay: 500,
            lineClearDelay: 400
        };
        
        // Animation states
        this.clearingLines = [];
        this.clearStartTime = 0;
        
        this.initializeNextPieces();
    }
    
    initializeNextPieces() {
        // Fill next pieces queue
        this.nextPieces = [];
        for (let i = 0; i < 3; i++) {
            this.nextPieces.push(this.pieceBag.getNext());
        }
    }
    
    start() {
        this.state = 'playing';
        this.reset();
        this.spawnNewPiece();
        window.soundManager.playBackgroundMusic();
    }
    
    reset() {
        this.grid = create2DArray(this.BOARD_WIDTH, this.BOARD_HEIGHT);
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.currentPiece = null;
        this.heldPiece = null;
        this.canHold = true;
        this.clearingLines = [];
        this.pieceBag = new TetrominoBag();
        this.initializeNextPieces();
        this.updateDropSpeed();
    }
    
    update(deltaTime) {
        if (this.state !== 'playing') return;
        
        // Handle line clearing animation
        if (this.clearingLines.length > 0) {
            if (Date.now() - this.clearStartTime > this.settings.lineClearDelay) {
                this.completeLinesClearing();
            }
            return;
        }
        
        // Update drop timer
        this.dropTimer += deltaTime;
        
        // Automatic piece drop
        if (this.dropTimer >= this.dropSpeed) {
            this.dropTimer = 0;
            this.dropPiece();
        }
        
        // Update ghost piece
        if (this.currentPiece && this.settings.showGhost) {
            this.updateGhostPiece();
        }
    }
    
    spawnNewPiece() {
        // Get next piece
        this.currentPiece = this.nextPieces.shift();
        this.nextPieces.push(this.pieceBag.getNext());
        
        // Reset piece position
        this.currentPiece.reset();
        
        // Check if piece can spawn (game over condition)
        if (!this.isValidPosition(this.currentPiece.position.x, this.currentPiece.position.y, this.currentPiece.getCurrentShape())) {
            this.gameOver();
            return;
        }
        
        this.canHold = true;
        this.updateGhostPiece();
    }
    
    dropPiece() {
        if (!this.currentPiece) return;
        
        if (this.isValidPosition(this.currentPiece.position.x, this.currentPiece.position.y + 1, this.currentPiece.getCurrentShape())) {
            this.currentPiece.move(0, 1);
        } else {
            this.lockPiece();
        }
    }
    
    lockPiece() {
        if (!this.currentPiece) return;
        
        // Add piece to grid
        const blocks = this.currentPiece.getBlocks();
        blocks.forEach(block => {
            if (block.y >= 0) { // Don't place blocks above the board
                this.grid[block.y][block.x] = {
                    type: block.type,
                    emoji: block.emoji
                };
            }
        });
        
        window.soundManager.playPieceLock();
        
        // Check for completed lines
        const completedLines = this.checkCompletedLines();
        if (completedLines.length > 0) {
            this.startLineClear(completedLines);
        } else {
            this.spawnNewPiece();
        }
    }
    
    checkCompletedLines() {
        const completedLines = [];
        
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            let lineComplete = true;
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.grid[y][x] === 0) {
                    lineComplete = false;
                    break;
                }
            }
            if (lineComplete) {
                completedLines.push(y);
            }
        }
        
        return completedLines;
    }
    
    startLineClear(lines) {
        this.clearingLines = lines;
        this.clearStartTime = Date.now();
        
        // Play appropriate sound
        if (lines.length === 4) {
            window.soundManager.playTetris(); // 4 lines = Tetris!
        } else {
            window.soundManager.playLineClear();
        }
    }
    
    completeLinesClearing() {
        const linesCleared = this.clearingLines.length;
        
        // Remove completed lines
        this.clearingLines.sort((a, b) => b - a); // Sort descending
        this.clearingLines.forEach(lineIndex => {
            this.grid.splice(lineIndex, 1);
            this.grid.unshift(Array(this.BOARD_WIDTH).fill(0));
        });
        
        // Update score and stats
        this.updateScore(linesCleared);
        this.lines += linesCleared;
        
        // Check for level up
        const newLevel = Math.floor(this.lines / 10) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.updateDropSpeed();
            window.soundManager.playLevelUp();
        }
        
        this.clearingLines = [];
        this.spawnNewPiece();
    }
    
    updateScore(linesCleared) {
        const basePoints = [0, 40, 100, 300, 1200]; // Points for 0-4 lines
        const points = basePoints[linesCleared] * this.level;
        this.score += points + this.softDropBonus;
        this.softDropBonus = 0;
    }
    
    updateDropSpeed() {
        // Speed increases with level (classic Tetris formula)
        const baseSpeed = 1000;
        this.dropSpeed = Math.max(50, baseSpeed - (this.level - 1) * 50);
    }
    
    // Player actions
    movePiece(dx, dy) {
        if (!this.currentPiece || this.state !== 'playing') return false;
        
        const newX = this.currentPiece.position.x + dx;
        const newY = this.currentPiece.position.y + dy;
        
        if (this.isValidPosition(newX, newY, this.currentPiece.getCurrentShape())) {
            this.currentPiece.move(dx, dy);
            if (dx !== 0) window.soundManager.playMove();
            return true;
        }
        
        return false;
    }
    
    rotatePiece(clockwise = true) {
        if (!this.currentPiece || this.state !== 'playing') return false;
        
        const originalPosition = this.currentPiece.position.clone();
        const { oldRotation } = this.currentPiece.rotate(clockwise);
        
        // Try wall kicks
        const kickTests = this.currentPiece.getWallKickTests(oldRotation, this.currentPiece.currentRotation);
        
        for (const kick of kickTests) {
            this.currentPiece.setPosition(originalPosition.x + kick.x, originalPosition.y + kick.y);
            
            if (this.isValidPosition(this.currentPiece.position.x, this.currentPiece.position.y, this.currentPiece.getCurrentShape())) {
                window.soundManager.playRotate();
                return true;
            }
        }
        
        // Rotation failed, revert
        this.currentPiece.currentRotation = oldRotation;
        this.currentPiece.position = originalPosition;
        return false;
    }
    
    softDrop() {
        if (this.movePiece(0, 1)) {
            this.softDropBonus += 1;
            this.dropTimer = 0; // Reset drop timer
            return true;
        }
        return false;
    }
    
    hardDrop() {
        if (!this.currentPiece || this.state !== 'playing') return;
        
        let dropDistance = 0;
        while (this.movePiece(0, 1)) {
            dropDistance++;
        }
        
        this.score += dropDistance * 2; // Hard drop bonus
        window.soundManager.playDrop();
        this.lockPiece();
    }
    
    holdPiece() {
        if (!this.currentPiece || !this.canHold || this.state !== 'playing') return;
        
        if (this.heldPiece === null) {
            // First hold
            this.heldPiece = new Tetromino(this.currentPiece.type);
            this.spawnNewPiece();
        } else {
            // Swap pieces
            const tempType = this.heldPiece.type;
            this.heldPiece = new Tetromino(this.currentPiece.type);
            this.currentPiece = new Tetromino(tempType);
            this.currentPiece.reset();
            
            // Check if swapped piece can spawn
            if (!this.isValidPosition(this.currentPiece.position.x, this.currentPiece.position.y, this.currentPiece.getCurrentShape())) {
                this.gameOver();
                return;
            }
        }
        
        this.canHold = false;
        this.updateGhostPiece();
    }
    
    updateGhostPiece() {
        if (!this.currentPiece) {
            this.ghostPiece = null;
            return;
        }
        
        this.ghostPiece = this.currentPiece.clone();
        
        // Move ghost piece down until it would collide
        while (this.isValidPosition(this.ghostPiece.position.x, this.ghostPiece.position.y + 1, this.ghostPiece.getCurrentShape())) {
            this.ghostPiece.move(0, 1);
        }
    }
    
    isValidPosition(x, y, shape) {
        for (let py = 0; py < shape.length; py++) {
            for (let px = 0; px < shape[py].length; px++) {
                if (shape[py][px]) {
                    const boardX = x + px;
                    const boardY = y + py;
                    
                    // Check bounds
                    if (boardX < 0 || boardX >= this.BOARD_WIDTH || boardY >= this.BOARD_HEIGHT) {
                        return false;
                    }
                    
                    // Check collision with existing blocks (allow negative Y for spawning)
                    if (boardY >= 0 && this.grid[boardY][boardX] !== 0) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    togglePause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            window.soundManager.stopBackgroundMusic();
        } else if (this.state === 'paused') {
            this.state = 'playing';
            window.soundManager.playBackgroundMusic();
        }
    }
    
    gameOver() {
        this.state = 'gameOver';
        window.soundManager.stopBackgroundMusic();
        window.soundManager.playGameOver();
        
        // Save high score
        const highScore = Storage.get('tetris-high-score', 0);
        if (this.score > highScore) {
            Storage.set('tetris-high-score', this.score);
        }
    }
    
    getHighScore() {
        return Storage.get('tetris-high-score', 0);
    }
}
