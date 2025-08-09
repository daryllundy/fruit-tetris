// Utility functions for the Tetris game

/**
 * Create a 2D array filled with a default value
 */
function create2DArray(width, height, defaultValue = 0) {
    return Array.from({ length: height }, () => 
        Array.from({ length: width }, () => defaultValue)
    );
}

/**
 * Deep clone a 2D array
 */
function clone2DArray(array) {
    return array.map(row => [...row]);
}

/**
 * Check if a coordinate is within bounds
 */
function isInBounds(x, y, width, height) {
    return x >= 0 && x < width && y >= 0 && y < height;
}

/**
 * Generate a random integer between min and max (inclusive)
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Format a number with commas
 */
function formatScore(score) {
    return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Debounce function to limit function calls
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function to limit function calls
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

/**
 * Local storage helpers
 */
const Storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('Error reading from localStorage:', e);
            return defaultValue;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn('Error writing to localStorage:', e);
            return false;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.warn('Error removing from localStorage:', e);
            return false;
        }
    }
};

/**
 * Check if device is mobile
 */
function isMobile() {
    return window.innerWidth <= 768 || 'ontouchstart' in window;
}

/**
 * Add event listener with automatic cleanup
 */
function addEventListenerWithCleanup(element, event, handler, options = {}) {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler, options);
}

/**
 * Request animation frame with fallback
 */
const requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           function(callback) {
               window.setTimeout(callback, 1000 / 60);
           };
})();

/**
 * Performance timing utility
 */
class Timer {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.startTime = performance.now();
        return this;
    }
    
    elapsed() {
        return performance.now() - this.startTime;
    }
    
    elapsedSeconds() {
        return this.elapsed() / 1000;
    }
}

/**
 * Color utilities
 */
const Colors = {
    // Convert hex to rgba
    hexToRgba(hex, alpha = 1) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },
    
    // Lighten a color
    lighten(color, amount) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * amount);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
};

/**
 * Vector2 utility class
 */
class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    
    clone() {
        return new Vector2(this.x, this.y);
    }
    
    add(other) {
        return new Vector2(this.x + other.x, this.y + other.y);
    }
    
    subtract(other) {
        return new Vector2(this.x - other.x, this.y - other.y);
    }
    
    equals(other) {
        return this.x === other.x && this.y === other.y;
    }
}
