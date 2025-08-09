// Input handling for keyboard and touch controls

class InputManager {
    constructor(game) {
        this.game = game;
        this.keys = {};
        this.keyRepeat = {};
        this.touchStartPos = null;
        this.lastTap = 0;
        this.tapDelay = 300; // Double tap detection
        this.swipeThreshold = 50; // Minimum distance for swipe
        
        // Key repeat settings
        this.repeatDelay = 150; // Initial delay before repeat
        this.repeatRate = 50;   // Rate of repeat
        
        this.bindEvents();
    }
    
    bindEvents() {
        // Keyboard events
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
        
        // Touch events
        const gameCanvas = document.getElementById('game-canvas');
        if (gameCanvas) {
            gameCanvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
            gameCanvas.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
            gameCanvas.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });
            
            // Prevent context menu on long press
            gameCanvas.addEventListener('contextmenu', (e) => e.preventDefault());
        }
        
        // Mobile button events
        this.bindMobileButtons();
        
        // Prevent default behavior for game keys
        document.addEventListener('keydown', (e) => {
            const gameKeys = ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Space', 'KeyZ', 'KeyX', 'KeyC', 'KeyP'];
            if (gameKeys.includes(e.code)) {
                e.preventDefault();
            }
        });
    }
    
    bindMobileButtons() {
        const rotateBtn = document.getElementById('mobile-rotate');
        const holdBtn = document.getElementById('mobile-hold');
        const dropBtn = document.getElementById('mobile-drop');
        
        if (rotateBtn) {
            rotateBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.game.rotatePiece();
            });
        }
        
        if (holdBtn) {
            holdBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.game.holdPiece();
            });
        }
        
        if (dropBtn) {
            dropBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.game.hardDrop();
            });
        }
    }
    
    onKeyDown(event) {
        const key = event.code;
        
        // Ignore if already pressed (for repeat)
        if (this.keys[key]) return;
        
        this.keys[key] = true;
        
        // Handle immediate actions
        this.handleKeyPress(key);
        
        // Set up key repeat for movement keys
        if (this.shouldRepeat(key)) {
            this.keyRepeat[key] = setTimeout(() => {
                this.startKeyRepeat(key);
            }, this.repeatDelay);
        }
    }
    
    onKeyUp(event) {
        const key = event.code;
        this.keys[key] = false;
        
        // Clear repeat timer
        if (this.keyRepeat[key]) {
            clearTimeout(this.keyRepeat[key]);
            clearInterval(this.keyRepeat[key]);
            delete this.keyRepeat[key];
        }
    }
    
    shouldRepeat(key) {
        return ['ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(key);
    }
    
    startKeyRepeat(key) {
        this.keyRepeat[key] = setInterval(() => {
            if (this.keys[key]) {
                this.handleKeyPress(key);
            }
        }, this.repeatRate);
    }
    
    handleKeyPress(key) {
        if (!this.game || this.game.state !== 'playing') return;
        
        switch (key) {
            case 'ArrowLeft':
                this.game.movePiece(-1, 0);
                break;
            case 'ArrowRight':
                this.game.movePiece(1, 0);
                break;
            case 'ArrowDown':
                this.game.softDrop();
                break;
            case 'ArrowUp':
            case 'KeyX':
                this.game.rotatePiece(true); // Clockwise
                break;
            case 'KeyZ':
                this.game.rotatePiece(false); // Counter-clockwise
                break;
            case 'Space':
                this.game.hardDrop();
                break;
            case 'KeyC':
                this.game.holdPiece();
                break;
            case 'KeyP':
                this.game.togglePause();
                break;
        }
    }
    
    onTouchStart(event) {
        if (!this.game || this.game.state !== 'playing') return;
        
        event.preventDefault();
        const touch = event.touches[0];
        this.touchStartPos = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now()
        };
        
        // Handle double tap for hard drop
        const currentTime = Date.now();
        if (currentTime - this.lastTap < this.tapDelay) {
            this.game.hardDrop();
            this.lastTap = 0; // Reset to prevent triple tap
        } else {
            this.lastTap = currentTime;
        }
    }
    
    onTouchMove(event) {
        event.preventDefault();
        // Prevent scrolling while playing
    }
    
    onTouchEnd(event) {
        if (!this.game || this.game.state !== 'playing' || !this.touchStartPos) return;
        
        event.preventDefault();
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - this.touchStartPos.x;
        const deltaY = touch.clientY - this.touchStartPos.y;
        const deltaTime = Date.now() - this.touchStartPos.time;
        
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        
        // Determine gesture type
        if (absX > this.swipeThreshold || absY > this.swipeThreshold) {
            // Swipe gesture
            if (absX > absY) {
                // Horizontal swipe
                if (deltaX > 0) {
                    this.game.movePiece(1, 0); // Swipe right
                } else {
                    this.game.movePiece(-1, 0); // Swipe left
                }
            } else {
                // Vertical swipe
                if (deltaY > 0) {
                    this.game.softDrop(); // Swipe down
                }
                // Swipe up could be used for hard drop, but double-tap is better
            }
        } else if (deltaTime < 200) {
            // Quick tap - rotate piece
            // Only if not part of a double-tap sequence
            setTimeout(() => {
                if (Date.now() - this.lastTap > this.tapDelay) {
                    this.game.rotatePiece();
                }
            }, this.tapDelay);
        }
        
        this.touchStartPos = null;
    }
    
    // Check if a key is currently pressed
    isKeyPressed(key) {
        return !!this.keys[key];
    }
    
    // Handle menu navigation
    handleMenuInput(event) {
        const key = event.code;
        
        switch (key) {
            case 'Enter':
            case 'Space':
                // Activate focused button
                const activeElement = document.activeElement;
                if (activeElement && activeElement.tagName === 'BUTTON') {
                    activeElement.click();
                }
                break;
            case 'Escape':
                // Go back or quit
                if (this.game && this.game.state === 'playing') {
                    this.game.togglePause();
                }
                break;
        }
    }
    
    // Cleanup method
    destroy() {
        document.removeEventListener('keydown', this.onKeyDown.bind(this));
        document.removeEventListener('keyup', this.onKeyUp.bind(this));
        
        // Clear all repeat timers
        Object.values(this.keyRepeat).forEach(timer => {
            clearTimeout(timer);
            clearInterval(timer);
        });
        this.keyRepeat = {};
    }
}

// Global input manager instance
let inputManager = null;

// Initialize input manager when game is created
function initializeInput(game) {
    if (inputManager) {
        inputManager.destroy();
    }
    inputManager = new InputManager(game);
    return inputManager;
}
