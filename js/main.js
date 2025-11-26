// Main application entry point

class TetrisApp {
    constructor() {
        this.game = null;
        this.renderer = null;
        this.lastTime = 0;
        this.animationId = null;

        this.currentScreen = 'main-menu';

        this.initializeApp();
    }

    async initializeApp() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initialize() {
        console.log('Initializing Fruit Tetris...');

        // Initialize game
        this.game = new TetrisGame();

        // Initialize effects
        this.particleSystem = new ParticleSystem();
        this.screenShake = new ScreenShake();
        this.celebrationManager = new CelebrationManager(this.particleSystem, this.screenShake);

        // Inject effects into game
        this.game.setEffects(this.celebrationManager, this.particleSystem, this.screenShake);

        // Initialize renderer
        this.renderer = new TetrisRenderer(this.game, this.particleSystem, this.screenShake);

        // Initialize input
        initializeInput(this.game);

        // Bind UI events
        this.bindUIEvents();

        // Show initial screen
        this.showScreen('main-menu');

        // Start game loop
        this.startGameLoop();

        console.log('Game initialized successfully!');
    }

    bindUIEvents() {
        // Cache UI elements
        this.ui = {
            // Mode selection
            bestSprintTime: document.getElementById('best-sprint-time'),
            bestMarathonLevel: document.getElementById('best-marathon-level'),
            bestZenScore: document.getElementById('best-zen-score'),
            startLevelInput: document.getElementById('start-level'),
            startLevelValue: document.getElementById('start-level-value'),

            // Game HUD
            modeName: document.getElementById('mode-name'),
            timer: document.getElementById('timer'),
            timerContainer: document.getElementById('timer-container'),
            targetValue: document.getElementById('target-value'),
            targetContainer: document.getElementById('target-container'),
            levelContainer: document.getElementById('level-container'),
            lines: document.getElementById('lines'),

            // Game over
            gameOverTitle: document.getElementById('game-over-title'),
            finalScore: document.getElementById('final-score'),
            completionStats: document.getElementById('completion-stats'),
            finalTime: document.getElementById('final-time'),
            finalTime: document.getElementById('final-time'),
            finalLines: document.getElementById('final-lines'),
            finalLevelVal: document.getElementById('final-level-val'),
            startLevelDisplay: document.getElementById('start-level-display'),
            startLevelVal: document.getElementById('start-level-val')
        };

        this.setupEventListeners();
        this.loadBestScores();
        this.loadStartingLevel();
    }

    setupEventListeners() {
        // Main menu buttons
        const playBtn = document.getElementById('play-btn');
        const instructionsBtn = document.getElementById('instructions-btn');
        const muteBtn = document.getElementById('mute-btn');
        const backBtn = document.getElementById('back-btn');

        if (playBtn) {
            playBtn.addEventListener('click', () => this.showModeSelection());
        }

        if (instructionsBtn) {
            instructionsBtn.addEventListener('click', () => this.showInstructions());
        }

        if (backBtn) {
            backBtn.addEventListener('click', () => this.showScreen('main-menu'));
        }

        if (muteBtn) {
            muteBtn.addEventListener('click', () => this.toggleMute());
        }

        // Mode selection buttons
        const modeBackBtn = document.getElementById('mode-back-btn');
        if (modeBackBtn) {
            modeBackBtn.addEventListener('click', () => this.showScreen('main-menu'));
        }

        // Mode selection cards
        const modeCards = document.querySelectorAll('.mode-card');
        modeCards.forEach(card => {
            const modeSelectBtn = card.querySelector('.mode-select-btn');
            if (modeSelectBtn) {
                modeSelectBtn.addEventListener('click', () => {
                    const mode = card.getAttribute('data-mode');
                    this.startGame(mode);
                });
            }
        });

        // Starting level slider
        if (this.ui.startLevelInput) {
            this.ui.startLevelInput.addEventListener('input', (e) => {
                const level = parseInt(e.target.value);
                this.ui.startLevelValue.textContent = level;
            });
            this.ui.startLevelInput.addEventListener('change', (e) => {
                const level = parseInt(e.target.value);
                localStorage.setItem('tetris_starting_level', level);
            });
        }

        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettings());
        }

        const settingsBackBtn = document.getElementById('settings-back-btn');
        if (settingsBackBtn) {
            settingsBackBtn.addEventListener('click', () => this.showScreen('main-menu'));
        }

        // Settings inputs
        const particlesToggle = document.getElementById('particles-toggle');
        const shakeToggle = document.getElementById('shake-toggle');
        const intensitySlider = document.getElementById('intensity-slider');

        if (particlesToggle) {
            particlesToggle.addEventListener('change', (e) => {
                if (this.game) this.game.settings.enableParticles = e.target.checked;
            });
        }

        if (shakeToggle) {
            shakeToggle.addEventListener('change', (e) => {
                if (this.game) this.game.settings.enableScreenShake = e.target.checked;
            });
        }

        if (intensitySlider) {
            intensitySlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                if (this.game) this.game.settings.effectsIntensity = value / 100;
                const valueDisplay = document.getElementById('intensity-value');
                if (valueDisplay) valueDisplay.textContent = `${value}%`;
            });
        }

        // Game screen buttons
        const restartBtn = document.getElementById('restart-btn');
        const changeModeBtn = document.getElementById('change-mode-btn');
        const menuBtn = document.getElementById('menu-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const quitBtn = document.getElementById('quit-btn');

        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restartGame());
        }

        if (changeModeBtn) {
            changeModeBtn.addEventListener('click', () => {
                this.quitGame();
                this.showModeSelection();
            });
        }

        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                this.quitGame();
                this.showScreen('main-menu');
            });
        }

        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                if (this.game) this.game.togglePause();
            });
        }

        if (quitBtn) {
            quitBtn.addEventListener('click', () => {
                this.quitGame();
                this.showModeSelection();
            });
        }

        // Update mute button text
        this.updateMuteButton();
    }

    loadBestScores() {
        const bestSprint = localStorage.getItem('tetris_sprint_best');
        this.ui.bestSprintTime.textContent = bestSprint ? this.formatTime(parseInt(bestSprint)) : '-';

        const bestMarathon = localStorage.getItem('tetris_marathon_level');
        this.ui.bestMarathonLevel.textContent = bestMarathon || '-';

        // Zen score persistence not implemented yet, placeholder
        this.ui.bestZenScore.textContent = '-';
    }

    loadStartingLevel() {
        const savedLevel = localStorage.getItem('tetris_starting_level');
        if (savedLevel && this.ui.startLevelInput) {
            const level = Math.max(1, Math.min(15, parseInt(savedLevel)));
            this.ui.startLevelInput.value = level;
            this.ui.startLevelValue.textContent = level;
        }
    }

    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor((ms % 1000) / 10); // 2 digits
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    }

    showModeSelection() {
        this.loadBestScores();
        this.showScreen('mode-selection-screen');
    }

    startGame(mode) {
        this.showScreen('game-screen');
        const startLevel = parseInt(this.ui.startLevelInput.value) || 1;
        this.game.start(mode, startLevel);
        this.updateHUDLayout(mode);
    }

    updateHUDLayout(mode) {
        // Update mode name display (Requirement 4.4)
        const modeName = mode.charAt(0).toUpperCase() + mode.slice(1);
        this.ui.modeName.textContent = modeName;

        // Reset visibility - hide all mode-specific elements first
        this.ui.timerContainer.classList.add('hidden');
        this.ui.targetContainer.classList.add('hidden');
        this.ui.levelContainer.classList.remove('hidden');

        if (mode === 'sprint') {
            // Sprint Mode: Show timer and target, hide level (Requirement 5.1)
            this.ui.timerContainer.classList.remove('hidden');
            this.ui.targetContainer.classList.remove('hidden');
            this.ui.levelContainer.classList.add('hidden'); // Sprint doesn't use levels
            this.ui.targetValue.textContent = '40 Lines';
        } else if (mode === 'marathon') {
            // Marathon Mode: Show target and level (Requirement 5.2)
            this.ui.targetContainer.classList.remove('hidden');
            this.ui.levelContainer.classList.remove('hidden');
            this.ui.targetValue.textContent = 'Level 15';
        } else if (mode === 'zen') {
            // Zen Mode: Show level, hide target (Requirement 5.3)
            this.ui.levelContainer.classList.remove('hidden');
            // No specific target for Zen mode
        }
    }

    restartGame() {
        this.game.start(this.game.modeType); // Restart with the current mode
        this.hideGameOverlay();
        this.updateUI();
    }

    quitGame() {
        if (this.game) {
            this.game.state = 'menu';
        }
        window.soundManager.stopBackgroundMusic();
        this.hideGameOverlay();
    }

    showInstructions() {
        this.showScreen('instructions');
    }

    showSettings() {
        this.showScreen('settings-screen');
        // Update UI to match current settings
        if (this.game) {
            const particlesToggle = document.getElementById('particles-toggle');
            if (particlesToggle) particlesToggle.checked = this.game.settings.enableParticles;

            const shakeToggle = document.getElementById('shake-toggle');
            if (shakeToggle) shakeToggle.checked = this.game.settings.enableScreenShake;

            const intensity = Math.round(this.game.settings.effectsIntensity * 100);
            const slider = document.getElementById('intensity-slider');
            if (slider) slider.value = intensity;

            const valueDisplay = document.getElementById('intensity-value');
            if (valueDisplay) valueDisplay.textContent = `${intensity}%`;
        }
    }

    toggleMute() {
        window.soundManager.toggleMute();
        this.updateMuteButton();
    }

    updateMuteButton() {
        const muteBtn = document.getElementById('mute-btn');
        if (muteBtn) {
            muteBtn.textContent = window.soundManager.isMuted() ? '🔇 Sound' : '🔊 Sound';
        }
    }

    showScreen(screenId) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            if (screen.id === screenId) {
                // Fade in the new screen
                screen.classList.remove('hidden');
                screen.style.opacity = '0';
                requestAnimationFrame(() => {
                    screen.style.transition = 'opacity 0.3s ease';
                    screen.style.opacity = '1';
                });
            } else {
                // Fade out other screens
                screen.style.opacity = '0';
                setTimeout(() => {
                    screen.classList.add('hidden');
                }, 300);
            }
        });

        this.currentScreen = screenId;
    }

    startGameLoop() {
        const gameLoop = (currentTime) => {
            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;

            // Update game logic
            if (this.game) {
                this.game.update(deltaTime);
                this.updateGameState();
            }

            // Render
            if (this.renderer) {
                this.renderer.update(deltaTime);
                this.renderer.render();
            }

            this.animationId = requestAnimFrame(gameLoop);
        };

        this.animationId = requestAnimFrame(gameLoop);
    }

    updateGameState() {
        // Update UI based on game state
        this.updateUI();

        // Check for perfect clear flash trigger
        if (this.game.pendingPerfectClear && !this.renderer.perfectClearFlash) {
            this.renderer.triggerPerfectClearFlash();
        }

        // Store previous state to avoid unnecessary updates
        if (this.previousGameState === this.game.state) {
            return;
        }
        this.previousGameState = this.game.state;

        // Handle game state changes
        if (this.game.state === 'paused') {
            console.log('Game state: paused - showing pause screen');
            this.showGameOverlay('pause-screen');
        } else if (this.game.state === 'gameOver' || this.game.state === 'completed') {
            console.log('Game state: gameOver/completed - showing game over screen');
            this.showGameOver();
        } else {
            console.log('Game state:', this.game.state, '- hiding overlays');
            this.hideGameOverlay();
        }
    }

    updateUI() {
        // Update score display
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = formatScore(this.game.score);
        }

        // Update level display
        const levelElement = document.getElementById('level');
        if (levelElement) {
            levelElement.textContent = this.game.level;
        }

        // Update lines display
        const linesElement = document.getElementById('lines');
        if (linesElement) {
            linesElement.textContent = this.game.lines;
        }

        // Update mode name display (Requirement 4.4)
        if (this.ui.modeName && this.game.currentMode) {
            const modeName = this.game.currentMode.name;
            this.ui.modeName.textContent = modeName;
        }

        // Mode specific updates (Requirements 5.1, 5.2, 5.3)
        if (this.game.modeType === 'sprint') {
            // Sprint Mode: Display timer and lines progress (Requirement 5.1)
            if (this.ui.timer) {
                this.ui.timer.textContent = this.formatTime(this.game.currentMode.elapsedTime);
            }
            if (this.ui.lines) {
                const linesCleared = this.game.currentMode.linesCleared;
                const remaining = Math.max(0, 40 - linesCleared);
                this.ui.lines.textContent = `${linesCleared} / 40 (${remaining} left)`;
            }
        } else if (this.game.modeType === 'marathon') {
            // Marathon Mode: Display level progress and lines until next level (Requirement 5.2)
            if (this.ui.lines) {
                const linesPerLevel = 10;
                const linesUntilNext = linesPerLevel - (this.game.lines % linesPerLevel);
                this.ui.lines.textContent = `${this.game.lines} (${linesUntilNext} to next level)`;
            }
            if (this.ui.targetValue) {
                this.ui.targetValue.textContent = `Level ${this.game.level} / 15`;
            }
        } else if (this.game.modeType === 'zen') {
            // Zen Mode: Display total lines and score (Requirement 5.3)
            if (this.ui.lines) {
                this.ui.lines.textContent = `${this.game.lines} total`;
            }
        }

        // Update combo stats
        const comboStats = this.game.getComboStats();
        const totalCombosElement = document.getElementById('total-combos');
        if (totalCombosElement) {
            totalCombosElement.textContent = comboStats.totalCombos;
        }

        const comboMultiplierElement = document.getElementById('combo-multiplier');
        if (comboMultiplierElement) {
            comboMultiplierElement.textContent = comboStats.currentMultiplier.toFixed(1) + 'x';
        }

        const lastComboElement = document.getElementById('last-combo');
        if (lastComboElement) {
            lastComboElement.textContent = comboStats.lastComboSize > 0 ? comboStats.lastComboSize + ' fruits' : '-';
        }

        // Update back-to-back indicator
        const b2bIndicator = document.getElementById('b2b-indicator');
        if (b2bIndicator) {
            if (this.game.backToBack) {
                b2bIndicator.classList.remove('hidden');
            } else {
                b2bIndicator.classList.add('hidden');
            }
        }
    }

    showGameOverlay(overlayId) {
        const overlay = document.getElementById('game-overlay');
        if (!overlay) return;

        // Hide all screens first
        const pauseScreen = document.getElementById('pause-screen');
        const gameOverScreen = document.getElementById('game-over-screen');

        if (pauseScreen) pauseScreen.classList.add('hidden');
        if (gameOverScreen) gameOverScreen.classList.add('hidden');

        // Show only the target screen
        const targetScreen = document.getElementById(overlayId);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            overlay.classList.remove('hidden');
        }
    }

    hideGameOverlay() {
        const overlay = document.getElementById('game-overlay');
        const pauseScreen = document.getElementById('pause-screen');
        const gameOverScreen = document.getElementById('game-over-screen');

        if (overlay) overlay.classList.add('hidden');
        if (pauseScreen) pauseScreen.classList.add('hidden');
        if (gameOverScreen) gameOverScreen.classList.add('hidden');
    }

    showGameOver() {
        this.showGameOverlay('game-over-screen');

        const isWin = this.game.state === 'completed';

        // Update game over title (Requirement 5.4)
        this.ui.gameOverTitle.textContent = isWin ? "COMPLETED!" : "GAME OVER";
        this.ui.gameOverTitle.style.color = isWin ? "#4ade80" : "#ff6b6b"; // Green for win, Red for loss

        if (this.ui.finalScore) this.ui.finalScore.textContent = this.game.score;
        if (this.ui.finalLevelVal) this.ui.finalLevelVal.textContent = this.game.level;

        // Show starting level if it was > 1
        if (this.ui.startLevelDisplay && this.ui.startLevelVal) {
            const startLevel = this.game.settings.startingLevel || 1;
            if (startLevel > 1) {
                this.ui.startLevelVal.textContent = startLevel;
                this.ui.startLevelDisplay.classList.remove('hidden');
            } else {
                this.ui.startLevelDisplay.classList.add('hidden');
            }
        }

        // Show mode-specific completion stats (Requirements 5.4, 5.5)
        if (isWin) {
            this.ui.completionStats.classList.remove('hidden');

            if (this.game.modeType === 'sprint') {
                // Sprint Mode: Display time and check for personal best
                const completionTime = this.game.currentMode.elapsedTime;
                const bestTime = this.game.currentMode.bestTime;
                const isNewRecord = !bestTime || completionTime < bestTime;

                this.ui.finalTime.textContent = this.formatTime(completionTime) +
                    (isNewRecord ? ' 🏆 NEW RECORD!' : '');
                this.ui.finalLines.textContent = this.game.lines + ' lines';

            } else if (this.game.modeType === 'marathon') {
                // Marathon Mode: Display level reached and check for personal best
                const finalLevel = this.game.level;
                const highestLevel = this.game.currentMode.highestLevel;
                const isNewRecord = finalLevel > highestLevel;

                this.ui.finalTime.textContent = 'Level ' + finalLevel +
                    (isNewRecord ? ' 🏆 NEW RECORD!' : '');
                this.ui.finalLines.textContent = this.game.lines + ' lines cleared';

            } else if (this.game.modeType === 'zen') {
                // Zen Mode: Display total stats (though Zen doesn't have completion)
                this.ui.finalTime.textContent = 'Zen Mode';
                this.ui.finalLines.textContent = this.game.lines + ' lines cleared';
            }
        } else {
            this.ui.completionStats.classList.add('hidden');
        }
    }

    updateFinalScore() {
        // Deprecated, used showGameOver instead
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        if (inputManager) {
            inputManager.destroy();
        }

        window.soundManager.stopBackgroundMusic();
    }
}

// Tetris Renderer Class
class TetrisRenderer {
    constructor(game, particleSystem, screenShake) {
        this.game = game;
        this.particleSystem = particleSystem;
        this.screenShake = screenShake;
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.holdCanvas = document.getElementById('hold-canvas');
        this.holdCtx = this.holdCanvas.getContext('2d');
        this.nextCanvas = document.getElementById('next-canvas');
        this.nextCtx = this.nextCanvas.getContext('2d');

        this.blockSize = 30;

        // Perfect clear flash effect
        this.perfectClearFlash = null;

        // Fruit-themed background colors for different levels
        this.levelBackgrounds = [
            { color: '#4a1f5c', name: 'Grape Garden' },        // Level 1 - Purple
            { color: '#8B4513', name: 'Kiwi Forest' },         // Level 2 - Brown/Green
            { color: '#FF6B35', name: 'Orange Grove' },        // Level 3 - Orange
            { color: '#DC143C', name: 'Strawberry Fields' },   // Level 4 - Red
            { color: '#FFD700', name: 'Banana Beach' },        // Level 5 - Yellow
            { color: '#98D8C8', name: 'Watermelon Wave' },     // Level 6 - Light Green
            { color: '#FF1493', name: 'Dragon Fruit Desert' }, // Level 7 - Pink
            { color: '#8B008B', name: 'Plum Paradise' },       // Level 8 - Dark Purple
            { color: '#228B22', name: 'Apple Orchard' },       // Level 9 - Green
            { color: '#4169E1', name: 'Blueberry Sky' }        // Level 10+ - Blue
        ];

        this.setupCanvases();
    }

    setupCanvases() {
        // Main game canvas
        this.canvas.width = this.game.BOARD_WIDTH * this.blockSize;
        this.canvas.height = this.game.BOARD_HEIGHT * this.blockSize;

        // Hold canvas
        this.holdCanvas.width = 120;
        this.holdCanvas.height = 120;

        // Next pieces canvas
        this.nextCanvas.width = 120;
        this.nextCanvas.height = 360;

        // Set font for emoji rendering
        this.ctx.font = `${this.blockSize - 6}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        this.holdCtx.font = '24px Arial';
        this.holdCtx.textAlign = 'center';
        this.holdCtx.textBaseline = 'middle';

        this.nextCtx.font = '20px Arial';
        this.nextCtx.textAlign = 'center';
        this.nextCtx.textBaseline = 'middle';
    }

    update(deltaTime) {
        if (this.particleSystem) this.particleSystem.update(deltaTime);
        if (this.screenShake) this.screenShake.update(deltaTime);
    }

    render() {
        this.ctx.save();

        // Apply screen shake
        if (this.screenShake) {
            this.ctx.translate(this.screenShake.offsetX, this.screenShake.offsetY);
        }

        this.renderMainGame();

        // Render particles
        if (this.particleSystem) {
            this.particleSystem.render(this.ctx);
        }

        this.ctx.restore();

        this.renderHoldPiece();
        this.renderNextPieces();
    }

    renderMainGame() {
        // Draw level-based background
        this.drawLevelBackground();

        // Draw placed blocks (no grid)
        this.drawPlacedBlocks();

        // Draw ghost piece
        if (this.game.ghostPiece && this.game.settings.showGhost) {
            this.drawPiece(this.game.ghostPiece, true);
        }

        // Draw current piece
        if (this.game.currentPiece) {
            this.drawPiece(this.game.currentPiece, false);
        }

        // Draw line clear animation
        if (this.game.clearingLines.length > 0) {
            this.drawLineClearEffect();
        }

        // Draw perfect clear flash effect
        if (this.perfectClearFlash) {
            this.drawPerfectClearFlash();
        }

        // Draw zen recovery effect
        if (this.game.zenRecoveryEffect && this.game.zenRecoveryEffect.active) {
            this.drawZenRecoveryEffect();
        }

        // Draw combo notification
        if (this.game.comboNotification) {
            this.drawComboNotification();
        }
    }

    drawLevelBackground() {
        const levelIndex = Math.min(this.game.level - 1, this.levelBackgrounds.length - 1);
        const background = this.levelBackgrounds[Math.max(0, levelIndex)];

        // Create gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, background.color);
        gradient.addColorStop(1, this.adjustBrightness(background.color, -30));

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Add subtle pattern overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for (let y = 0; y < this.canvas.height; y += 60) {
            for (let x = 0; x < this.canvas.width; x += 60) {
                if ((x + y) % 120 === 0) {
                    this.ctx.fillRect(x, y, 30, 30);
                }
            }
        }
    }

    adjustBrightness(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, Math.min(255, (num >> 16) + amt));
        const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
        const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    drawPlacedBlocks() {
        // Draw only the placed blocks without grid lines
        for (let y = 0; y < this.game.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.game.BOARD_WIDTH; x++) {
                if (this.game.grid[y][x] !== 0) {
                    this.drawBlock(x, y, this.game.grid[y][x], false);
                }
            }
        }
    }

    drawPiece(piece, isGhost = false) {
        const blocks = piece.getBlocks();
        blocks.forEach(block => {
            if (block.y >= 0) { // Only draw blocks that are visible
                this.drawBlock(block.x, block.y, block, isGhost);
            }
        });
    }

    drawBlock(x, y, blockData, isGhost = false) {
        const pixelX = x * this.blockSize;
        const pixelY = y * this.blockSize;

        if (isGhost) {
            // Draw ghost piece - just transparent emoji
            this.ctx.save();
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillStyle = 'white';
            const emoji = blockData.emoji || blockData;
            this.ctx.font = `${this.blockSize - 4}px Arial`;
            this.ctx.fillText(
                emoji,
                pixelX + this.blockSize / 2,
                pixelY + this.blockSize / 2
            );
            this.ctx.restore();
        } else {
            // Draw emoji directly without background or border
            this.ctx.fillStyle = 'white';
            this.ctx.font = `${this.blockSize - 4}px Arial`;
            const emoji = blockData.emoji || blockData;
            this.ctx.fillText(
                emoji,
                pixelX + this.blockSize / 2,
                pixelY + this.blockSize / 2
            );
        }
    }

    drawLineClearEffect() {
        const progress = (Date.now() - this.game.clearStartTime) / this.game.settings.lineClearDelay;
        const alpha = Math.sin(progress * Math.PI * 5) * 0.5 + 0.5; // More flashes for better feedback

        // Add color based on number of lines cleared
        let color = 'rgba(255, 255, 255, ';
        if (this.game.clearingLines.length === 4) {
            // Gold for Tetris
            color = 'rgba(255, 215, 0, ';
        } else if (this.game.clearingLines.length >= 2) {
            // Light blue for double/triple
            color = 'rgba(135, 206, 250, ';
        }

        this.ctx.fillStyle = color + (alpha * 0.85) + ')';

        this.game.clearingLines.forEach(lineY => {
            this.ctx.fillRect(0, lineY * this.blockSize, this.canvas.width, this.blockSize);

            // Add border effect
            this.ctx.strokeStyle = color + (alpha * 0.95) + ')';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(0, lineY * this.blockSize, this.canvas.width, this.blockSize);
        });
    }

    triggerPerfectClearFlash() {
        this.perfectClearFlash = {
            timestamp: Date.now()
        };
    }

    drawPerfectClearFlash() {
        const elapsed = Date.now() - this.perfectClearFlash.timestamp;
        const duration = 2000; // Extended to 2 seconds for more impact
        const progress = elapsed / duration;

        if (progress >= 1) {
            this.perfectClearFlash = null;
            return;
        }

        // Create pulsing flash effect with better timing
        const pulseCount = 4; // More pulses for dramatic effect
        const pulseProgress = (progress * pulseCount) % 1;
        const pulseAlpha = Math.sin(pulseProgress * Math.PI) * (1 - progress) * 0.7;

        // Full-screen white flash
        this.ctx.fillStyle = `rgba(255, 255, 255, ${pulseAlpha})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Add rainbow glow overlay that cycles through colors
        const hue = (elapsed * 0.2) % 360;
        const glowAlpha = (1 - progress) * 0.5;
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width * 0.8
        );
        gradient.addColorStop(0, `hsla(${hue}, 100%, 60%, ${glowAlpha})`);
        gradient.addColorStop(0.5, `hsla(${(hue + 60) % 360}, 100%, 50%, ${glowAlpha * 0.6})`);
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Add expanding ring effect
        if (progress < 0.5) {
            const ringProgress = progress / 0.5;
            const ringRadius = ringProgress * this.canvas.width * 0.8;
            const ringAlpha = (1 - ringProgress) * 0.6;

            this.ctx.strokeStyle = `hsla(${hue}, 100%, 70%, ${ringAlpha})`;
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, ringRadius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }

    drawZenRecoveryEffect() {
        const elapsed = Date.now() - this.game.zenRecoveryEffect.timestamp;
        const duration = 1500; // 1.5 seconds for gentle effect
        const progress = elapsed / duration;

        if (progress >= 1) {
            this.game.zenRecoveryEffect.active = false;
            return;
        }

        // Gentle pulsing effect with calming colors
        const pulseProgress = Math.sin(progress * Math.PI * 2) * 0.5 + 0.5;
        const alpha = (1 - progress) * 0.4 * pulseProgress;

        // Soft blue-green gradient for calming effect
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width * 0.7
        );
        gradient.addColorStop(0, `rgba(135, 206, 250, ${alpha})`); // Light sky blue
        gradient.addColorStop(0.5, `rgba(152, 251, 152, ${alpha * 0.7})`); // Pale green
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Add gentle expanding waves
        const waveCount = 3;
        for (let i = 0; i < waveCount; i++) {
            const waveDelay = i * 0.2;
            const waveProgress = Math.max(0, Math.min(1, (progress - waveDelay) / (1 - waveDelay)));

            if (waveProgress > 0) {
                const waveRadius = waveProgress * this.canvas.width * 0.6;
                const waveAlpha = (1 - waveProgress) * 0.3;

                this.ctx.strokeStyle = `rgba(135, 206, 250, ${waveAlpha})`;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, waveRadius, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        }

        // Add calming text overlay
        if (progress < 0.7) {
            const textAlpha = progress < 0.3 ? progress / 0.3 : (progress < 0.5 ? 1 : (0.7 - progress) / 0.2);

            this.ctx.save();
            this.ctx.globalAlpha = textAlpha * 0.8;
            this.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('✨ Board Cleared ✨', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.restore();
        }
    }

    drawComboNotification() {
        const notification = this.game.comboNotification;
        const elapsed = Date.now() - notification.timestamp;
        const duration = 2500; // Increased to 2.5 seconds for better readability
        const progress = elapsed / duration;

        if (progress >= 1) return; // Notification expired

        // Calculate animation properties with smoother easing
        const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
        const alpha = Math.max(0, progress < 0.8 ? 1 : (1 - (progress - 0.8) / 0.2)); // Fade only in last 20%
        const scale = 1 + (1 - easeOut) * 0.3; // Smoother scale animation
        const y = this.canvas.height * 0.3 - easeOut * 40; // Smoother float upward

        this.ctx.save();

        // Position and scale
        this.ctx.translate(this.canvas.width / 2, y);
        this.ctx.scale(scale, scale);
        this.ctx.globalAlpha = alpha;

        // Determine if this is a special notification (T-Spin, B2B, Perfect Clear)
        const isSpecial = notification.text && notification.text !== null;
        const isB2B = notification.text && notification.text.includes('B2B');
        const isPerfectClear = notification.text && notification.text.includes('PERFECT CLEAR');
        const isTSpin = notification.text && notification.text.includes('T-SPIN');

        // Background glow - different color for special notifications
        if (isPerfectClear) {
            // Epic rainbow glow for perfect clear
            const hue = (elapsed * 0.3) % 360;
            this.ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${alpha * 0.6})`;
            this.ctx.fillRect(-160, -65, 320, 130);

            // Add extra sparkle effect with smoother animation
            const sparkleScale = 1 + Math.sin(elapsed * 0.008) * 0.1;
            this.ctx.scale(sparkleScale, sparkleScale);
        } else if (isB2B) {
            // Red glow for back-to-back
            this.ctx.fillStyle = `rgba(255, 107, 107, ${alpha * 0.5})`;
            this.ctx.fillRect(-130, -55, 260, 110);

            // Add pulsing effect for B2B with smoother animation
            const pulseScale = 1 + Math.sin(elapsed * 0.006) * 0.08;
            this.ctx.scale(pulseScale, pulseScale);
        } else if (isTSpin) {
            // Purple/magenta glow for T-Spin
            this.ctx.fillStyle = `rgba(186, 85, 211, ${alpha * 0.5})`;
            this.ctx.fillRect(-130, -55, 260, 110);
        } else if (isSpecial) {
            // Gold glow for other special moves
            this.ctx.fillStyle = `rgba(255, 215, 0, ${alpha * 0.5})`;
            this.ctx.fillRect(-130, -55, 260, 110);
        } else {
            // Standard glow for fruit combos
            this.ctx.fillStyle = `rgba(255, 215, 0, ${alpha * 0.4})`;
            this.ctx.fillRect(-110, -45, 220, 90);
        }

        // Main text
        this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        this.ctx.font = isPerfectClear ? 'bold 34px Arial' : 'bold 26px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        if (isSpecial) {
            // Show custom text (T-Spin, B2B, Perfect Clear, etc.)
            if (isPerfectClear) {
                // Epic styling for perfect clear
                const hue = (elapsed * 0.3) % 360;
                this.ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${alpha})`;
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                this.ctx.lineWidth = 3;
                this.ctx.strokeText(notification.text, 0, -20);
                this.ctx.fillText(notification.text, 0, -20);

                // Add sparkle emoji with animation
                this.ctx.font = '42px Arial';
                const sparkleOffset = Math.sin(elapsed * 0.01) * 5;
                this.ctx.fillText('✨', -85 + sparkleOffset, -20);
                this.ctx.fillText('✨', 85 - sparkleOffset, -20);
            } else if (isB2B) {
                // Special styling for B2B
                this.ctx.fillStyle = `rgba(255, 107, 107, ${alpha})`;
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                this.ctx.lineWidth = 2;
                this.ctx.strokeText(notification.text, 0, -15);
                this.ctx.fillText(notification.text, 0, -15);
            } else if (isTSpin) {
                // Special styling for T-Spin
                this.ctx.fillStyle = `rgba(186, 85, 211, ${alpha})`;
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                this.ctx.lineWidth = 2;
                this.ctx.strokeText(notification.text, 0, -15);
                this.ctx.fillText(notification.text, 0, -15);
            } else {
                this.ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
                this.ctx.lineWidth = 1.5;
                this.ctx.strokeText(notification.text, 0, -15);
                this.ctx.fillText(notification.text, 0, -15);
            }
        } else {
            // Standard fruit combo text
            this.ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
            this.ctx.lineWidth = 1;
            this.ctx.strokeText(`FRUIT COMBO!`, 0, -15);
            this.ctx.fillText(`FRUIT COMBO!`, 0, -15);
        }

        // Bonus points
        this.ctx.font = isPerfectClear ? 'bold 26px Arial' : 'bold 20px Arial';
        if (isPerfectClear) {
            const hue = (elapsed * 0.3 + 180) % 360;
            this.ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${alpha})`;
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
            this.ctx.lineWidth = 2;
            this.ctx.strokeText(`+${notification.bonus} points`, 0, 18);
            this.ctx.fillText(`+${notification.bonus} points`, 0, 18);
        } else if (isB2B || isTSpin) {
            this.ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
            this.ctx.strokeStyle = isB2B ? `rgba(255, 107, 107, ${alpha})` : `rgba(186, 85, 211, ${alpha})`;
            this.ctx.lineWidth = 1.5;
            this.ctx.strokeText(`+${notification.bonus} points`, 0, 12);
            this.ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
            this.ctx.fillText(`+${notification.bonus} points`, 0, 12);
        } else {
            this.ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
            this.ctx.fillText(`+${notification.bonus} points`, 0, 12);
        }

        // Additional info (combo size/multiplier for fruit combos)
        if (!isSpecial && notification.size > 0) {
            this.ctx.font = '16px Arial';
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
            this.ctx.fillText(`${notification.size} fruits × ${notification.multiplier.toFixed(1)}x`, 0, 35);
        }

        this.ctx.restore();
    }

    renderHoldPiece() {
        // Clear canvas
        this.holdCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.holdCtx.fillRect(0, 0, this.holdCanvas.width, this.holdCanvas.height);

        if (this.game.heldPiece) {
            this.holdCtx.save();
            if (!this.game.canHold) {
                this.holdCtx.globalAlpha = 0.5; // Dim if cannot hold
            }
            this.drawPiecePreview(this.holdCtx, this.game.heldPiece, this.holdCanvas.width / 2, this.holdCanvas.height / 2);
            this.holdCtx.restore();
        }
    }

    renderNextPieces() {
        // Clear canvas
        this.nextCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);

        // Draw next 3 pieces
        for (let i = 0; i < Math.min(3, this.game.nextPieces.length); i++) {
            const piece = this.game.nextPieces[i];
            const y = (i + 0.5) * (this.nextCanvas.height / 3);
            this.drawPiecePreview(this.nextCtx, piece, this.nextCanvas.width / 2, y);
        }
    }

    drawPiecePreview(ctx, piece, centerX, centerY) {
        const shape = piece.getCurrentShape();
        const blockSize = 20;

        // Find bounding box
        let minX = 4, maxX = -1, minY = 4, maxY = -1;
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y);
                }
            }
        }

        // Calculate offset to center the piece
        const width = (maxX - minX + 1) * blockSize;
        const height = (maxY - minY + 1) * blockSize;
        const offsetX = centerX - width / 2;
        const offsetY = centerY - height / 2;

        // Draw piece blocks
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const pixelX = offsetX + (x - minX) * blockSize;
                    const pixelY = offsetY + (y - minY) * blockSize;

                    // Draw block background
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                    ctx.fillRect(pixelX, pixelY, blockSize, blockSize);

                    // Draw emoji
                    ctx.fillStyle = 'white';
                    ctx.fillText(
                        piece.emoji,
                        pixelX + blockSize / 2,
                        pixelY + blockSize / 2
                    );

                    // Draw border
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(pixelX, pixelY, blockSize, blockSize);
                }
            }
        }
    }
}

// Initialize the application
let tetrisApp;

// Start the application when the page loads
window.addEventListener('load', () => {
    tetrisApp = new TetrisApp();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (tetrisApp) {
        tetrisApp.destroy();
    }
});

// Handle window resize
window.addEventListener('resize', debounce(() => {
    if (tetrisApp && tetrisApp.renderer) {
        tetrisApp.renderer.setupCanvases();
    }
}, 250));

// Prevent space bar from scrolling the page
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
    }
});
