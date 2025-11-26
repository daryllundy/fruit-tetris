// Main Tetris game logic

export class TetrisGame {
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
        this.lines = 0;
        this.dropTimer = 0;
        this.dropTimer = 0;
        this.lastMoveWasRotation = false;
        this.backToBack = false;

        // Fruit combo system
        this.comboMultiplier = 1;
        this.lastComboSize = 0;
        this.totalCombos = 0;
        this.comboHistory = [];

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
            lineClearDelay: 400,
            enableParticles: true,
            enableScreenShake: true,
            effectsIntensity: 1.0,
            maxParticles: 500
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
        this.reset();
        this.state = 'playing';
        this.spawnNewPiece();
        window.soundManager.playBackgroundMusic();
        this.updateMusicTension(); // Initialize music tension
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

        // Reset combo system
        this.comboMultiplier = 1;
        this.lastComboSize = 0;
        this.totalCombos = 0;
        this.comboHistory = [];
        this.state = 'menu';
        this.lastMoveWasRotation = false;
        this.softDropBonus = 0;
        this.backToBack = false;
        
        // Clear notification states
        this.comboNotification = null;
        this.ghostPiece = null;
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

        // Check for T-Spin
        const tSpin = this.checkTSpin();

        // Check for fruit combos before checking lines
        const comboBonus = this.checkFruitCombos();

        // Check for completed lines
        const completedLines = this.checkCompletedLines();

        // Check for Perfect Clear (if all non-cleared cells are empty)
        const perfectClear = this.checkPerfectClear(completedLines);

        if (completedLines.length > 0 || tSpin) {
            this.startLineClear(completedLines, comboBonus, tSpin, perfectClear);
        } else {
            this.spawnNewPiece();
        }

        // Update music speed based on stack height
        this.updateMusicTension();
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

    startLineClear(lines, comboBonus = 0, tSpin = false, perfectClear = false) {
        this.clearingLines = lines;
        this.clearStartTime = Date.now();
        this.pendingComboBonus = comboBonus;
        this.pendingTSpin = tSpin;
        this.pendingPerfectClear = perfectClear;

        // Play appropriate sound
        if (perfectClear) {
            window.soundManager.playPerfectClear();
        } else if (tSpin) {
            window.soundManager.playTSpin(); // Assuming a T-Spin specific sound
        } else if (lines.length === 4) {
            window.soundManager.playTetris(); // 4 lines = Tetris!
        } else if (lines.length > 0) {
            window.soundManager.playLineClear();
        }

        // Play combo sound if there's a bonus
        if (comboBonus > 0) {
            window.soundManager.playCombo();
        }

        // Trigger effects
        if (this.particleSystem && this.settings.enableParticles) {
            // Juice splatter for each block in cleared lines
            lines.forEach(y => {
                for (let x = 0; x < this.BOARD_WIDTH; x++) {
                    const block = this.grid[y][x];
                    if (block && block.type) {
                        const color = this.getFruitColor(block.type);
                        this.particleSystem.createJuiceSplatter(
                            x * this.BLOCK_SIZE + this.BLOCK_SIZE / 2,
                            y * this.BLOCK_SIZE + this.BLOCK_SIZE / 2,
                            color
                        );
                    }
                }
            });
        }

        if (this.screenShake && this.settings.enableScreenShake) {
            // Shake based on lines cleared or perfect clear
            let intensity = lines.length * 2 * this.settings.effectsIntensity;
            if (perfectClear) {
                intensity = 15 * this.settings.effectsIntensity; // Extra intense for perfect clear
            }
            this.screenShake.shake(intensity, perfectClear ? 400 : 200);
        }

        if (this.celebrationManager && this.settings.enableParticles) {
            if (perfectClear) {
                // Epic celebration for perfect clear
                this.celebrationManager.triggerPerfectClearCelebration(
                    this.BOARD_WIDTH * this.BLOCK_SIZE / 2,
                    this.BOARD_HEIGHT * this.BLOCK_SIZE / 2
                );
            } else if (lines.length === 4) {
                this.celebrationManager.triggerTetrisCelebration(
                    this.BOARD_WIDTH * this.BLOCK_SIZE / 2,
                    this.BOARD_HEIGHT * this.BLOCK_SIZE / 2
                );
            }
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

        // Update score and level
        this.updateScore(linesCleared, this.pendingComboBonus || 0, this.pendingTSpin, this.pendingPerfectClear);
        this.pendingComboBonus = 0;
        this.pendingTSpin = false; // Reset T-Spin flag
        this.pendingPerfectClear = false; // Reset Perfect Clear flag

        // Check for level up (now handled in updateScore, but keeping this for consistency if needed elsewhere)
        // const newLevel = Math.floor(this.lines / 10) + 1;
        // if (newLevel > this.level) {
        //     this.level = newLevel;
        //     this.updateDropSpeed();
        //     window.soundManager.playLevelUp();
        // }

        this.clearingLines = [];
        this.spawnNewPiece();

        // Update music speed after clearing lines (stack may be lower now)
        this.updateMusicTension();
    }

    updateScore(linesCleared, comboBonus = 0, tSpin = false, perfectClear = false) {
        let points = 0;

        // Base points for lines
        const linePoints = [0, 100, 300, 500, 800]; // Single, Double, Triple, Tetris

        // Check for difficult clear (Tetris or T-Spin)
        const isDifficult = tSpin || linesCleared === 4;
        let b2bBonus = false;

        if (isDifficult) {
            if (this.backToBack) {
                b2bBonus = true;
                // 1.5x multiplier for B2B
            }
            this.backToBack = true;
        } else if (linesCleared > 0) {
            this.backToBack = false;
        }

        if (tSpin) {
            // T-Spin scoring
            const tSpinPoints = [400, 800, 1200, 1600];
            let tsp = tSpinPoints[linesCleared] * this.level;

            if (b2bBonus) {
                tsp = Math.floor(tsp * 1.5);
            }

            points += tsp;

            // Show notification
            let text = linesCleared === 0 ? "T-SPIN" :
                linesCleared === 1 ? "T-SPIN SINGLE" :
                    linesCleared === 2 ? "T-SPIN DOUBLE" : "T-SPIN TRIPLE";

            if (b2bBonus) text = "B2B " + text;

            this.showComboNotification(points, text);
        } else if (linesCleared > 0) {
            points += linePoints[linesCleared] * this.level;

            if (b2bBonus) { // Only for Tetris (linesCleared === 4)
                points = Math.floor(points * 1.5);
                this.showComboNotification(points, "B2B TETRIS");
            }
        }

        if (perfectClear) {
            // Perfect Clear Bonus (added on top of line clear or T-Spin points)
            // Single: 800, Double: 1200, Triple: 1800, Tetris: 2000 (multiplied by level)
            const perfectClearBonus = [0, 800, 1200, 1800, 2000]; // Index by lines cleared
            const pcBonus = perfectClearBonus[linesCleared] * this.level;
            points += pcBonus;
            this.showComboNotification(pcBonus, "PERFECT CLEAR");
        }

        points += this.softDropBonus; // Add soft drop bonus
        points += comboBonus;
        this.score += points;
        this.softDropBonus = 0; // Reset soft drop bonus

        this.lines += linesCleared; // Update total lines cleared

        // Level up every 10 lines
        const newLevel = Math.floor(this.lines / 10) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.updateDropSpeed();
            window.soundManager.playLevelUp();
        }

        // Show combo notification if applicable
        if (comboBonus > 0 && !tSpin && !b2bBonus) { // Only show if not T-Spin/B2B (avoid clutter)
            this.showComboNotification(comboBonus);
        }
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
            this.updateGhostPiece();
            this.lastMoveWasRotation = false;
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
                this.updateGhostPiece();
                this.lastMoveWasRotation = true;
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

        if (this.screenShake && this.settings.enableScreenShake) {
            this.screenShake.shake(3 * this.settings.effectsIntensity, 100);
        }

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
        window.soundManager.playHold();
    }

    updateGhostPiece() {
        if (!this.currentPiece) {
            this.ghostPiece = null;
            return;
        }
        this.ghostPiece = this.currentPiece.clone();
        const ghostPos = this.currentPiece.getGhostPosition(this);
        this.ghostPiece.position = ghostPos;
    }

    checkTSpin() {
        if (!this.currentPiece || this.currentPiece.type !== 'T') return false;
        if (!this.lastMoveWasRotation) return false;

        const x = this.currentPiece.position.x;
        const y = this.currentPiece.position.y;

        // Check 4 corners of the 3x3 bounding box
        // Corners are relative to (x, y): (0,0), (2,0), (0,2), (2,2)
        let corners = 0;

        // Helper to check if a point is occupied or out of bounds (wall)
        const isOccupied = (cx, cy) => {
            // Check bounds
            if (cx < 0 || cx >= this.BOARD_WIDTH || cy >= this.BOARD_HEIGHT) return true;
            // Check grid (ignore current piece, but it's not in grid yet)
            if (cy >= 0 && this.grid[cy][cx] !== 0) return true;
            return false;
        };

        if (isOccupied(x, y)) corners++;
        if (isOccupied(x + 2, y)) corners++;
        if (isOccupied(x, y + 2)) corners++;
        if (isOccupied(x + 2, y + 2)) corners++;

        if (corners >= 3) {
            return { isTSpin: true, isMini: false }; // Simplified: always regular T-Spin for now
        }

        return false;
    }

    checkPerfectClear(ignoringLines = []) {
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            if (ignoringLines.includes(y)) continue; // This line will be cleared
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.grid[y][x] !== 0) return false;
            }
        }
        return true;
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

    // ===== FRUIT COMBO SYSTEM =====

    checkFruitCombos() {
        // Find all fruit clusters and calculate bonus
        const clusters = this.findFruitClusters();
        let totalBonus = 0;

        clusters.forEach(cluster => {
            if (cluster.size >= 3) { // Minimum 3 connected fruits for combo
                const comboBonus = this.calculateComboBonus(cluster);
                totalBonus += comboBonus;

                // Track combo stats
                this.totalCombos++;
                this.lastComboSize = cluster.size;
                this.comboHistory.push({
                    fruit: cluster.fruit,
                    size: cluster.size,
                    bonus: comboBonus,
                    level: this.level
                });

                // Update combo multiplier
                this.updateComboMultiplier(cluster.size);

                // Trigger celebration
                if (this.celebrationManager && this.settings.enableParticles) {
                    // Calculate center of cluster
                    let sumX = 0, sumY = 0;
                    cluster.positions.forEach(p => {
                        sumX += p.x;
                        sumY += p.y;
                    });
                    const centerX = (sumX / cluster.positions.length) * this.BLOCK_SIZE + this.BLOCK_SIZE / 2;
                    const centerY = (sumY / cluster.positions.length) * this.BLOCK_SIZE + this.BLOCK_SIZE / 2;

                    this.celebrationManager.triggerComboCelebration(centerX, centerY, cluster.size);
                }
            }
        });

        return totalBonus;
    }

    findFruitClusters() {
        const visited = create2DArray(this.BOARD_WIDTH, this.BOARD_HEIGHT);
        const clusters = [];

        // Check each position for start of a cluster
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.grid[y][x] !== 0 && !visited[y][x]) {
                    const cluster = this.floodFill(x, y, this.grid[y][x].type, visited);
                    if (cluster.positions.length >= 3) {
                        clusters.push({
                            fruit: this.grid[y][x].type,
                            emoji: this.grid[y][x].emoji,
                            size: cluster.positions.length,
                            positions: cluster.positions,
                            patterns: this.analyzeClusterPattern(cluster.positions)
                        });
                    }
                }
            }
        }

        return clusters;
    }

    floodFill(startX, startY, targetType, visited) {
        const positions = [];
        const stack = [{ x: startX, y: startY }];

        while (stack.length > 0) {
            const { x, y } = stack.pop();

            // Check bounds and conditions
            if (x < 0 || x >= this.BOARD_WIDTH || y < 0 || y >= this.BOARD_HEIGHT) continue;
            if (visited[y][x]) continue;
            if (this.grid[y][x] === 0 || this.grid[y][x].type !== targetType) continue;

            // Mark as visited and add to cluster
            visited[y][x] = true;
            positions.push({ x, y });

            // Check 4 adjacent cells
            stack.push({ x: x + 1, y });
            stack.push({ x: x - 1, y });
            stack.push({ x, y: y + 1 });
            stack.push({ x, y: y - 1 });
        }

        return { positions };
    }

    analyzeClusterPattern(positions) {
        // Analyze the shape/pattern of the cluster for bonus calculation
        const patterns = {
            line: this.isLinePattern(positions),
            square: this.isSquarePattern(positions),
            cross: this.isCrossPattern(positions),
            scattered: positions.length >= 5 && this.isScatteredPattern(positions)
        };

        return patterns;
    }

    isLinePattern(positions) {
        if (positions.length < 3) return false;

        // Check if all positions are in a straight line (horizontal or vertical)
        const horizontal = positions.every(pos => pos.y === positions[0].y);
        const vertical = positions.every(pos => pos.x === positions[0].x);

        return horizontal || vertical;
    }

    isSquarePattern(positions) {
        if (positions.length < 4) return false;

        // Find bounding box
        const minX = Math.min(...positions.map(p => p.x));
        const maxX = Math.max(...positions.map(p => p.x));
        const minY = Math.min(...positions.map(p => p.y));
        const maxY = Math.max(...positions.map(p => p.y));

        // Check if it forms a filled rectangle
        const width = maxX - minX + 1;
        const height = maxY - minY + 1;

        return positions.length === width * height && width >= 2 && height >= 2;
    }

    isCrossPattern(positions) {
        if (positions.length < 5) return false;

        // Look for T or + shaped patterns
        const posSet = new Set(positions.map(p => `${p.x},${p.y}`));

        for (const center of positions) {
            let arms = 0;
            const directions = [
                { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
                { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
            ];

            for (const dir of directions) {
                if (posSet.has(`${center.x + dir.dx},${center.y + dir.dy}`)) {
                    arms++;
                }
            }

            if (arms >= 3) return true; // T-shape or cross
        }

        return false;
    }

    isScatteredPattern(positions) {
        // Check if positions are spread across multiple rows/columns
        const uniqueRows = new Set(positions.map(p => p.y)).size;
        const uniqueCols = new Set(positions.map(p => p.x)).size;

        return uniqueRows >= 3 && uniqueCols >= 3;
    }

    calculateComboBonus(cluster) {
        let baseBonus = 0;

        // Base points per fruit type
        const fruitValues = {
            'I': 100, // Banana - rare I-piece
            'O': 50,  // Orange - common O-piece
            'T': 75,  // Apple - medium T-piece
            'S': 60,  // Strawberry
            'Z': 60,  // Kiwi
            'J': 70,  // Grapes
            'L': 70   // Pineapple
        };

        baseBonus = (fruitValues[cluster.fruit] || 50) * cluster.size;

        // Pattern bonuses
        let patternMultiplier = 1;
        if (cluster.patterns.square) patternMultiplier += 0.5;
        if (cluster.patterns.cross) patternMultiplier += 0.7;
        if (cluster.patterns.line && cluster.size >= 5) patternMultiplier += 0.3;
        if (cluster.patterns.scattered) patternMultiplier += 0.4;

        // Size bonuses
        if (cluster.size >= 7) patternMultiplier += 0.5; // Large cluster bonus
        if (cluster.size >= 10) patternMultiplier += 1.0; // Massive cluster bonus

        // Apply combo multiplier
        const finalBonus = Math.floor(baseBonus * patternMultiplier * this.comboMultiplier * this.level);

        return finalBonus;
    }

    updateComboMultiplier(clusterSize) {
        // Increase multiplier based on recent combos
        if (clusterSize >= 5) {
            this.comboMultiplier = Math.min(3.0, this.comboMultiplier + 0.2);
        } else if (clusterSize >= 3) {
            this.comboMultiplier = Math.min(2.0, this.comboMultiplier + 0.1);
        }

        // Multiplier decays slowly over time
        setTimeout(() => {
            this.comboMultiplier = Math.max(1.0, this.comboMultiplier - 0.05);
        }, 5000);
    }

    showComboNotification(comboBonus, text = null) {
        // This will be used by the renderer to show combo notifications
        this.comboNotification = {
            bonus: comboBonus,
            size: this.lastComboSize,
            timestamp: Date.now(),
            multiplier: this.comboMultiplier,
            text: text // Custom text for T-Spin, B2B, etc.
        };

        // Clear notification after 2.5 seconds (matches renderer duration)
        setTimeout(() => {
            this.comboNotification = null;
        }, 2500);
    }

    // ===== DYNAMIC MUSIC SYSTEM =====

    getStackHeight() {
        // Find the highest non-empty row
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.grid[y][x] !== 0) {
                    return this.BOARD_HEIGHT - y; // Return height from bottom
                }
            }
        }
        return 0; // Empty board
    }

    getDangerLevel() {
        // Calculate danger level based on stack height (0 = safe, 1 = maximum danger)
        const stackHeight = this.getStackHeight();
        const safeZone = this.BOARD_HEIGHT * 0.3; // Bottom 30% is safe
        const dangerZone = this.BOARD_HEIGHT * 0.8; // Top 80% is danger zone

        if (stackHeight <= safeZone) {
            return 0; // Safe
        } else if (stackHeight >= dangerZone) {
            return 1; // Maximum danger
        } else {
            // Linear interpolation between safe and danger zones
            return (stackHeight - safeZone) / (dangerZone - safeZone);
        }
    }

    updateMusicTension() {
        // Calculate danger level and adjust music speed
        const dangerLevel = this.getDangerLevel();

        // Log for debugging
        if (dangerLevel > 0.5) {
            console.log(`Stack height danger: ${Math.floor(dangerLevel * 100)}% - Music speeding up!`);
        }

        // Adjust background music speed based on danger
        window.soundManager.adjustMusicSpeed(dangerLevel);

        // Additional tension effects at high danger
        if (dangerLevel > 0.7) {
            // Flash warning or add visual effects here if needed
            // This could trigger warning animations in the renderer
            this.highDangerMode = true;
        } else {
            this.highDangerMode = false;
        }
    }

    setEffects(celebrationManager, particleSystem, screenShake) {
        this.celebrationManager = celebrationManager;
        this.particleSystem = particleSystem;
        this.screenShake = screenShake;
    }

    getComboStats() {
        return {
            totalCombos: this.totalCombos,
            currentMultiplier: this.comboMultiplier,
            lastComboSize: this.lastComboSize,
            comboHistory: this.comboHistory.slice(-5) // Last 5 combos
        };
    }

    getFruitColor(type) {
        const colors = {
            'I': '#FFD700', // Banana - Yellow
            'O': '#FFA500', // Orange - Orange
            'T': '#FF0000', // Apple - Red
            'S': '#FF69B4', // Strawberry - Pink
            'Z': '#9ACD32', // Kiwi - Green
            'J': '#800080', // Grapes - Purple
            'L': '#FFFF00'  // Pineapple - Yellow
        };
        return colors[type] || '#FFFFFF';
    }
}

// Export for browser (when loaded as module)
if (typeof window !== 'undefined') {
    window.TetrisGame = TetrisGame;
}

// Export for ES modules (testing)
if (typeof window === 'undefined') {
    globalThis.TetrisGame = TetrisGame;
}
