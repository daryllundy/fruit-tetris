// Sound management for Tetris game

class SoundManager {
    constructor() {
        this.sounds = {};
        this.muted = Storage.get('tetris-muted', false);
        this.volume = Storage.get('tetris-volume', 0.7);
        this.initialized = false;
        
        // Initialize sounds
        this.initSounds();
    }
    
    async initSounds() {
        try {
            // Use existing sound assets
            const soundFiles = {
                background: 'client/public/sounds/background.mp3',
                hit: 'client/public/sounds/hit.mp3',
                success: 'client/public/sounds/success.mp3'
            };
            
            // Create audio elements
            for (const [name, path] of Object.entries(soundFiles)) {
                const audio = new Audio(path);
                audio.volume = this.volume;
                audio.preload = 'auto';
                
                // Handle loading errors gracefully
                audio.onerror = () => {
                    console.warn(`Could not load sound: ${path}`);
                    this.sounds[name] = null;
                };
                
                audio.oncanplaythrough = () => {
                    console.log(`Sound loaded: ${name}`);
                };
                
                this.sounds[name] = audio;
            }
            
            // Create additional game-specific sounds using Web Audio API
            this.createGameSounds();
            
            this.initialized = true;
        } catch (error) {
            console.warn('Sound initialization failed:', error);
            this.initialized = false;
        }
    }
    
    createGameSounds() {
        // Create simple beep sounds using Web Audio API for game events
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Store generated sounds
            this.generatedSounds = {
                rotate: this.createBeep(220, 0.1, 'square'),
                move: this.createBeep(150, 0.05, 'sine'),
                drop: this.createBeep(100, 0.15, 'sawtooth'),
                lineClear: this.createBeep(440, 0.3, 'triangle'),
                levelUp: this.createMelody([262, 330, 392, 523], 0.2),
                gameOver: this.createBeep(80, 1.0, 'sawtooth'),
                combo: this.createMelody([330, 392, 523, 659], 0.15), // Happy combo sound
                tetris: this.createMelody([523, 659, 784, 1047], 0.25) // Tetris celebration
            };
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            this.generatedSounds = {};
        }
    }
    
    createBeep(frequency, duration, type = 'sine') {
        return () => {
            if (!this.audioContext || this.muted) return;
            
            try {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.value = frequency;
                oscillator.type = type;
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration);
            } catch (error) {
                console.warn('Error playing beep:', error);
            }
        };
    }
    
    createMelody(frequencies, noteDuration) {
        return () => {
            if (!this.audioContext || this.muted) return;
            
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    this.createBeep(freq, noteDuration)();
                }, index * noteDuration * 1000 * 0.8);
            });
        };
    }
    
    play(soundName, options = {}) {
        if (this.muted) return;
        
        try {
            // Try generated sounds first
            if (this.generatedSounds && this.generatedSounds[soundName]) {
                this.generatedSounds[soundName]();
                return;
            }
            
            // Fall back to audio files
            if (this.sounds[soundName]) {
                const sound = this.sounds[soundName];
                sound.currentTime = 0;
                sound.volume = (options.volume || 1) * this.volume;
                
                const playPromise = sound.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.warn(`Sound play failed for ${soundName}:`, error);
                    });
                }
            }
        } catch (error) {
            console.warn(`Error playing sound ${soundName}:`, error);
        }
    }
    
    playBackgroundMusic() {
        if (this.muted || !this.sounds.background) return;
        
        try {
            const bgMusic = this.sounds.background;
            bgMusic.loop = true;
            bgMusic.volume = this.volume * 0.3; // Background music should be quieter
            
            const playPromise = bgMusic.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn('Background music play failed:', error);
                });
            }
        } catch (error) {
            console.warn('Error playing background music:', error);
        }
    }
    
    stopBackgroundMusic() {
        if (this.sounds.background) {
            this.sounds.background.pause();
            this.sounds.background.currentTime = 0;
        }
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        Storage.set('tetris-volume', this.volume);
        
        // Update all sound volumes
        Object.values(this.sounds).forEach(sound => {
            if (sound) sound.volume = this.volume;
        });
        
        // Update background music volume
        if (this.sounds.background) {
            this.sounds.background.volume = this.volume * 0.3;
        }
    }
    
    toggleMute() {
        this.muted = !this.muted;
        Storage.set('tetris-muted', this.muted);
        
        if (this.muted) {
            this.stopBackgroundMusic();
        } else {
            // Resume audio context if it was suspended
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        }
        
        return this.muted;
    }
    
    isMuted() {
        return this.muted;
    }
    
    // Game-specific sound methods
    playMove() { this.play('move'); }
    playRotate() { this.play('rotate'); }
    playDrop() { this.play('drop'); }
    playLineClear() { this.play('lineClear'); }
    playCombo() { this.play('combo'); }
    playTetris() { this.play('tetris'); }
    playLevelUp() { this.play('levelUp'); }
    playGameOver() { this.play('gameOver'); }
    
    // Use existing hit sound for piece locking
    playPieceLock() { this.play('hit'); }
    
    // Use existing success sound for tetris (4 lines)
    playTetris() { this.play('success'); }
}

// Create global sound manager instance
window.soundManager = new SoundManager();
