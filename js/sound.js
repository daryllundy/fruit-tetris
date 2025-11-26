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

            // Store generated sounds with improved timing and frequencies
            this.generatedSounds = {
                rotate: this.createBeep(240, 0.08, 'square'),
                move: this.createBeep(160, 0.04, 'sine'),
                drop: this.createBeep(110, 0.12, 'sawtooth'),
                lineClear: this.createBeep(480, 0.25, 'triangle'),
                levelUp: this.createMelody([262, 330, 392, 523], 0.18),
                gameOver: this.createBeep(80, 1.0, 'sawtooth'),
                combo: this.createMelody([349, 440, 554, 698], 0.14), // Happy combo sound (F-A-C#-F)
                tetris: this.createMelody([523, 659, 784, 1047], 0.22), // Tetris celebration (C-E-G-C)
                tSpin: this.createMelody([466, 587, 698, 932], 0.16), // T-Spin sound (Bb-D-F-Bb)
                perfectClear: this.createMelody([523, 659, 784, 1047, 1319, 1568, 2093], 0.16), // Epic perfect clear (C major scale up)
                success: this.createMelody([523, 659, 784, 1047, 1319, 1568, 2093, 2637], 0.15), // Victory fanfare
                zenRecovery: this.createMelody([392, 440, 494, 523], 0.20) // Gentle recovery sound (G-A-B-C)
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
                    this.createBeep(freq, noteDuration * 0.9, 'sine')(); // Use sine wave for gentle sound
                }, index * noteDuration * 1000 * 0.75);
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
            bgMusic.volume = this.volume * 0.3;
            bgMusic.playbackRate = 1.0;
            
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
    
    adjustMusicSpeed(dangerLevel) {
        if (!this.sounds.background || this.muted) return;
        
        const minSpeed = 1.0;
        const maxSpeed = 1.5;
        const speedMultiplier = Math.pow(dangerLevel, 2);
        const playbackRate = minSpeed + (maxSpeed - minSpeed) * speedMultiplier;
        
        try {
            const currentRate = this.sounds.background.playbackRate;
            const targetRate = Math.max(minSpeed, Math.min(maxSpeed, playbackRate));
            const smoothRate = currentRate + (targetRate - currentRate) * 0.3;
            this.sounds.background.playbackRate = smoothRate;
            
            const intensityBoost = 1 + (dangerLevel * 0.2);
            if (this.sounds.background) {
                this.sounds.background.volume = Math.min(1, this.volume * 0.3 * intensityBoost);
            }
        } catch (error) {
            console.warn('Error adjusting music speed:', error);
        }
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        Storage.set('tetris-volume', this.volume);
        
        Object.values(this.sounds).forEach(sound => {
            if (sound) sound.volume = this.volume;
        });
        
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
    playTSpin() { this.play('tSpin'); }
    playPerfectClear() { this.play('perfectClear'); }
    playSuccess() { this.play('success'); }
    playZenRecovery() { this.play('zenRecovery'); }

    // Use existing hit sound for piece locking
    playPieceLock() { this.play('hit'); }

    // Use existing success sound for hold
    playHold() { this.play('hit'); }
}

// Create global sound manager instance
window.soundManager = new SoundManager();
