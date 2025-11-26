// Load vanilla JS files first (they set up globals)
await import('../js/utils.js');
await import('../js/tetromino.js');

import * as effectsTests from './effects_tests.js';
import * as advancedTests from './advanced_features_tests.js';
import { TetrisGame } from '../js/tetris.js';
import { ParticleSystem, ScreenShake, CelebrationManager } from '../js/effects.js';

// Mock window and document for Node.js environment
if (typeof window === 'undefined') {
    global.window = {
        soundManager: {
            playCombo: () => { },
            playDrop: () => { },
            playMove: () => { },
            playRotate: () => { },
            playClear: () => { },
            playHold: () => { }, // Add playHold mock
            playBackgroundMusic: () => { }, // Add mock
            stopBackgroundMusic: () => { },  // Add mock
            adjustMusicSpeed: () => { }, // Add mock
            playGameOver: () => { }, // Add mock
            playTSpin: () => { }, // Add mock
            playLevelUp: () => { }, // Add mock
            playPerfectClear: () => { }, // Add mock
            playPieceLock: () => { }, // Add mock
            playLineClear: () => { }, // Add mock
            playTetris: () => { } // Add mock
        }
    };
    global.document = {
        getElementById: () => ({
            getContext: () => ({
                save: () => { },
                restore: () => { },
                translate: () => { },
                fillRect: () => { },
                fillStyle: '',
                font: '',
                fillText: () => { },
                measureText: () => ({ width: 0 })
            })
        })
    };
    
    // Mock localStorage for testing
    const localStorageMock = (() => {
        let store = {};
        return {
            getItem: (key) => store[key] || null,
            setItem: (key, value) => { store[key] = value.toString(); },
            removeItem: (key) => { delete store[key]; },
            clear: () => { store = {}; }
        };
    })();
    global.localStorage = localStorageMock;
}

async function runTests() {
    const allTests = { ...effectsTests, ...advancedTests };
    const context = {
        TetrisGame,
        ParticleSystem,
        ScreenShake,
        CelebrationManager,
        Particle: (await import('../js/effects.js')).Particle, // Import Particle
        Tetromino: globalThis.Tetromino, // Access global Tetromino
        Storage: globalThis.Storage // Access global Storage
    };

    let passed = 0;
    let failed = 0;

    console.log('Running Property Tests...');

    for (const [name, testFn] of Object.entries(allTests)) {
        if (name.startsWith('test')) {
            try {
                console.log(`Running ${name}...`);
                await testFn(context);
                console.log(`✅ ${name} PASSED`);
                passed++;
            } catch (error) {
                console.error(`❌ ${name} FAILED`);
                console.error(error);
                failed++;
            }
        }
    }

    console.log('\nTest Summary:');
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);

    if (failed > 0) process.exit(1);
}

runTests();
