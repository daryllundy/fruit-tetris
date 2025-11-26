# Implementation Plan

- [ ] 1. Set up audio preferences schema and persistence
  - Create PreferenceManager class to handle audioPrefs.v1 schema
  - Implement save/load methods for localStorage persistence
  - Add migration logic from old tetris-muted and tetris-volume keys
  - Set defaults: musicVolume: 70, sfxVolume: 80, selectedBGM: 'bgm_1'
  - _Requirements: 3.2, 3.4, 6.4, 6.6_

- [ ] 1.1 Write property test for BGM selection persistence
  - **Property 6: BGM selection persists**
  - **Validates: Requirements 3.2**

- [ ] 1.2 Write property test for BGM selection round-trip
  - **Property 7: BGM selection round-trip**
  - **Validates: Requirements 3.3**

- [ ] 1.3 Write property test for volume settings persistence
  - **Property 15: Volume settings persistence**
  - **Validates: Requirements 6.4**

- [ ] 1.4 Write property test for volume settings round-trip
  - **Property 16: Volume settings round-trip**
  - **Validates: Requirements 6.5**

- [ ] 1.5 Write unit test for default BGM selection
  - Verify bgm_1 is selected when no preference exists
  - _Requirements: 3.4_

- [ ] 1.6 Write unit test for default volume values
  - Verify 70% music and 80% SFX when no preference exists
  - _Requirements: 6.6_

- [ ] 2. Implement VolumeController with GainNode management
  - Create VolumeController class with AudioContext integration
  - Implement createMusicGainNode and createSFXGainNode methods
  - Add setMusicGain and setSFXGain methods with 0-100% range
  - Implement percentageToGain and gainToPercentage conversion utilities
  - _Requirements: 6.2, 6.3, 4.5_

- [ ] 2.1 Write property test for music volume adjustment
  - **Property 13: Music volume adjustment**
  - **Validates: Requirements 6.2**

- [ ] 2.2 Write property test for SFX volume adjustment
  - **Property 14: SFX volume adjustment**
  - **Validates: Requirements 6.3**

- [ ] 2.3 Write unit test for GainNode usage
  - Verify GainNodes are used when Web Audio API is available
  - _Requirements: 4.5_

- [ ] 3. Create AudioLoader for efficient track loading
  - Implement AudioLoader class with preload and lazy-load methods
  - Add track loading state management (loaded, loading, failed)
  - Implement budget checking (5 MB / 3 second threshold)
  - Add progress tracking for loading indicators
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 3.1 Write property test for smart BGM preloading
  - **Property 17: Smart BGM preloading**
  - **Validates: Requirements 7.2**

- [ ] 3.2 Write property test for on-demand BGM loading
  - **Property 18: On-demand BGM loading**
  - **Validates: Requirements 7.4**

- [ ] 3.3 Write unit test for preload menu BGM
  - Verify menu BGM loads during initialization
  - _Requirements: 7.1_

- [ ] 3.4 Write unit test for lazy load threshold
  - Verify lazy loading when size/time exceeds budget
  - _Requirements: 7.3_

- [ ] 3.5 Write unit test for loading indicator
  - Verify indicator shows after 500ms load time
  - _Requirements: 7.5_

- [ ] 4. Implement BGMController for music playback and transitions
  - Create BGMController class with track management
  - Implement play, pause, resume, and stop methods
  - Add track loading and state tracking (isPlaying, isPaused)
  - Connect to VolumeController for volume management
  - _Requirements: 2.1, 2.2, 5.1, 5.2, 5.3_

- [ ] 4.1 Write property test for menu BGM in all menu states
  - **Property 3: Menu BGM plays in all menu states**
  - **Validates: Requirements 2.1**

- [ ] 4.2 Write property test for menu BGM navigation persistence
  - **Property 4: Menu BGM persists across navigation**
  - **Validates: Requirements 2.3**

- [ ] 4.3 Write property test for game BGM pause responsiveness
  - **Property 10: Game BGM pause responsiveness**
  - **Validates: Requirements 5.2**

- [ ] 4.4 Write property test for game BGM resume with position
  - **Property 11: Game BGM resume with position**
  - **Validates: Requirements 5.3**

- [ ] 4.5 Write unit test for menu BGM looping
  - Verify loop property is set and track restarts
  - _Requirements: 2.2_

- [ ] 4.6 Write unit test for game BGM looping
  - Verify loop property is set and track restarts
  - _Requirements: 5.1_

- [ ] 5. Add crossfade transition system
  - Implement crossfade method in BGMController using GainNodes
  - Add fadeOut and fadeIn helper methods with 500ms duration
  - Implement HTML5 audio fallback with 60 FPS stepped volume
  - Add crossfade state tracking to prevent overlapping transitions
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6, 5.4_

- [ ] 5.1 Write property test for game start crossfade
  - **Property 8: Game start triggers crossfade**
  - **Validates: Requirements 4.1**

- [ ] 5.2 Write property test for crossfade completion state
  - **Property 9: Crossfade completion state**
  - **Validates: Requirements 4.4**

- [ ] 5.3 Write property test for game end crossfade
  - **Property 12: Game end crossfade**
  - **Validates: Requirements 5.4**

- [ ] 5.4 Write unit test for crossfade timing
  - Verify 500ms fade duration for both tracks
  - _Requirements: 4.2, 4.3_

- [ ] 5.5 Write unit test for simultaneous crossfade
  - Verify both tracks fade at the same time
  - _Requirements: 4.3_

- [ ] 5.6 Write unit test for HTML5 audio fallback
  - Verify fallback when Web Audio API is unavailable
  - _Requirements: 4.6_

- [ ] 6. Create main AudioManager orchestrator
  - Implement AudioManager class integrating all subsystems
  - Add audio unlock detection and handling for user gestures
  - Implement playMenuBGM, playGameBGM, pauseGameBGM, resumeGameBGM methods
  - Add crossfadeToGame and crossfadeToMenu convenience methods
  - Integrate with PreferenceManager for settings persistence
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.4, 5.4_

- [ ] 6.1 Write property test for user gesture unlock
  - **Property 1: User gesture unlocks audio**
  - **Validates: Requirements 1.2**

- [ ] 6.2 Write property test for volume preferences restored
  - **Property 2: Volume preferences restored after unlock**
  - **Validates: Requirements 1.3**

- [ ] 6.3 Write property test for mute stops menu BGM
  - **Property 5: Mute stops menu BGM**
  - **Validates: Requirements 2.4**

- [ ] 6.4 Write unit test for audio unlock on first gesture
  - Verify unlock occurs on click, tap, and keypress
  - _Requirements: 1.2_

- [ ] 6.5 Write unit test for no audio before gesture
  - Verify no audio plays before user gesture
  - _Requirements: 1.1_

- [ ] 7. Add error handling and fallback mechanisms
  - Implement graceful handling for audio file load failures
  - Add Web Audio API availability detection and HTML5 fallback
  - Handle playback errors during gameplay without breaking game
  - Add user-friendly messaging for blocked audio
  - _Requirements: 1.4, 8.1, 8.2, 8.3, 8.4_

- [ ] 7.1 Write property test for graceful load failure
  - **Property 19: Graceful load failure**
  - **Validates: Requirements 8.1**

- [ ] 7.2 Write property test for graceful playback errors
  - **Property 20: Graceful playback errors**
  - **Validates: Requirements 8.3**

- [ ] 7.3 Write unit test for blocked audio message
  - Verify user-friendly message on autoplay block
  - _Requirements: 8.4_

- [ ] 8. Create BGM selection UI on Select Mode screen
  - Add three BGM option buttons (bgm_1, bgm_2, bgm_3) to mode selection screen
  - Implement selection highlighting for currently selected BGM
  - Add preview playback when hovering/clicking BGM options
  - Connect selection to PreferenceManager for persistence
  - _Requirements: 3.1, 3.2_

- [ ] 8.1 Write unit test for BGM selection UI
  - Verify three BGM options are displayed
  - _Requirements: 3.1_

- [ ] 9. Add volume control sliders to settings UI
  - Create two range sliders: Music (0-100%) and SFX (0-100%)
  - Display current volume percentage next to each slider
  - Implement real-time volume adjustment on slider change
  - Connect sliders to AudioManager volume methods
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 9.1 Write unit test for volume slider UI
  - Verify two sliders are displayed
  - _Requirements: 6.1_

- [ ] 10. Integrate AudioManager with TetrisApp game flow
  - Replace existing SoundManager with AudioManager in main.js
  - Add audio unlock on first user interaction in TetrisApp
  - Trigger playMenuBGM when showing menu screens
  - Trigger crossfadeToGame when starting gameplay
  - Trigger pauseGameBGM/resumeGameBGM on game pause/resume
  - Trigger crossfadeToMenu when returning to menu from game over
  - _Requirements: 1.2, 2.1, 2.3, 4.1, 5.2, 5.3, 5.4_

- [ ] 11. Migrate existing SoundManager SFX to new system
  - Preserve existing SFX methods (playMove, playRotate, playDrop, etc.)
  - Connect SFX playback to SFX volume control from VolumeController
  - Update all SFX calls to use new volume system
  - Remove old background music methods (playBackgroundMusic, adjustMusicSpeed)
  - _Requirements: 6.3_

- [ ] 12. Add audio assets for menu and game BGM tracks
  - Create or source menu_bgm.mp3 for menu background music
  - Create or source bgm_1.mp3, bgm_2.mp3, bgm_3.mp3 for gameplay
  - Place audio files in client/public/sounds/ directory
  - Update BGM_TRACKS configuration with correct file paths
  - Verify audio files are under 5 MB total for initial load
  - _Requirements: 2.1, 3.1, 7.1, 7.3_

- [ ] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Test complete audio flow end-to-end
  - Verify audio unlock on first interaction
  - Test menu BGM plays and loops correctly
  - Test BGM selection and persistence across page reloads
  - Test crossfade transitions from menu to game and back
  - Test pause/resume maintains BGM position
  - Test volume controls affect music and SFX independently
  - Test lazy loading for non-preloaded BGM tracks
  - Test error handling with missing audio files
  - _Requirements: All_

- [ ] 14.1 Write integration test for full crossfade flow
  - Test complete transition from menu to game and back
  - _Requirements: 4.1, 4.4, 5.4_

- [ ] 14.2 Write integration test for volume persistence across sessions
  - Test save/load cycle with page reload simulation
  - _Requirements: 6.4, 6.5_
