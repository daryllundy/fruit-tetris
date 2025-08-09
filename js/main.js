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
        
        // Initialize renderer
        this.renderer = new TetrisRenderer(this.game);
        
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
        // Main menu buttons
        const playBtn = document.getElementById('play-btn');
        const instructionsBtn = document.getElementById('instructions-btn');
        const muteBtn = document.getElementById('mute-btn');
        
        if (playBtn) {
            playBtn.addEventListener('click', () => this.startGame());
        }
        
        if (instructionsBtn) {
            instructionsBtn.addEventListener('click', () => this.showInstructions());
        }
        
        if (muteBtn) {
            muteBtn.addEventListener('click', () => this.toggleMute());
        }
        
        // Instructions back button
        const backBtn = document.getElementById('back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.showScreen('main-menu'));
        }
        
        // Game control buttons
        const pauseBtn = document.getElementById('pause-btn');
        const quitBtn = document.getElementById('quit-btn');
        const restartBtn = document.getElementById('restart-btn');
        const menuBtn = document.getElementById('menu-btn');
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.game.togglePause());
        }
        
        if (quitBtn) {
            quitBtn.addEventListener('click', () => this.quitToMenu());
        }
        
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restartGame());
        }
        
        if (menuBtn) {
            menuBtn.addEventListener('click', () => this.quitToMenu());
        }
        
        // Update mute button text
        this.updateMuteButton();
    }
    
    startGame() {
        this.showScreen('game-screen');
        this.game.start();
        this.updateUI();
    }
    
    restartGame() {
        this.game.start();
        this.hideGameOverlay();
        this.updateUI();
    }
    
    quitToMenu() {
        this.game.state = 'menu';
        window.soundManager.stopBackgroundMusic();
        this.showScreen('main-menu');
        this.hideGameOverlay();
    }
    
    showInstructions() {
        this.showScreen('instructions');
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
                screen.classList.remove('hidden');
            } else {
                screen.classList.add('hidden');
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
                this.renderer.render();
            }
            
            this.animationId = requestAnimFrame(gameLoop);
        };
        
        this.animationId = requestAnimFrame(gameLoop);
    }
    
    updateGameState() {
        // Update UI based on game state
        this.updateUI();
        
        // Store previous state to avoid unnecessary updates
        if (this.previousGameState === this.game.state) {
            return;
        }
        this.previousGameState = this.game.state;
        
        // Handle game state changes
        if (this.game.state === 'paused') {
            console.log('Game state: paused - showing pause screen');
            this.showGameOverlay('pause-screen');
        } else if (this.game.state === 'gameOver') {
            console.log('Game state: gameOver - showing game over screen');
            this.showGameOverlay('game-over-screen');
            this.updateFinalScore();
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
    
    updateFinalScore() {
        const finalScoreElement = document.getElementById('final-score');
        if (finalScoreElement) {
            finalScoreElement.textContent = formatScore(this.game.score);
        }
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
    constructor(game) {
        this.game = game;
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.holdCanvas = document.getElementById('hold-canvas');
        this.holdCtx = this.holdCanvas.getContext('2d');
        this.nextCanvas = document.getElementById('next-canvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.blockSize = 30;
        
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
    
    render() {
        this.renderMainGame();
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
        const alpha = Math.sin(progress * Math.PI * 4) * 0.5 + 0.5; // Flashing effect
        
        this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        
        this.game.clearingLines.forEach(lineY => {
            this.ctx.fillRect(0, lineY * this.blockSize, this.canvas.width, this.blockSize);
        });
    }
    
    renderHoldPiece() {
        // Clear canvas
        this.holdCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.holdCtx.fillRect(0, 0, this.holdCanvas.width, this.holdCanvas.height);
        
        if (this.game.heldPiece) {
            this.drawPiecePreview(this.holdCtx, this.game.heldPiece, this.holdCanvas.width / 2, this.holdCanvas.height / 2);
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
