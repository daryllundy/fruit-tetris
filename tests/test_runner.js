
// Load vanilla JS files first (they set up globals)
await import('../js/utils.js');
await import('../js/tetromino.js');
await import('../js/tetris.js');

// Now load effects and tests
import { Particle, ParticleSystem, ScreenShake, CelebrationManager } from '../js/effects.js';
import * as tests from './effects_tests.js';

console.log('Running Visual Effects Property Tests...');

let passed = 0;
let failed = 0;

async function runTests() {
    for (const [name, testFn] of Object.entries(tests)) {
        try {
            console.log(`Running ${name}...`);
            await testFn({ 
                Particle, 
                ParticleSystem, 
                ScreenShake, 
                CelebrationManager,
                TetrisGame: globalThis.TetrisGame,
                Tetromino: globalThis.Tetromino
            });
            console.log(`✅ ${name} PASSED`);
            passed++;
        } catch (error) {
            console.error(`❌ ${name} FAILED`);
            console.error(error);
            failed++;
        }
    }

    console.log('\nTest Summary:');
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);

    if (failed > 0) {
        process.exit(1);
    }
}

runTests();
