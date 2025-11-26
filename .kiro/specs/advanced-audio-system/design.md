# Design Document: Advanced Audio System

## Overview

The Advanced Audio System provides a professional-grade audio experience for Fruit Tetris with menu background music, selectable gameplay BGM tracks, smooth crossfade transitions, and persistent user preferences. The system is built on Web Audio API with HTML5 audio fallback, ensuring broad browser compatibility while respecting autoplay policies.

The design extends the existing `SoundManager` class to support multiple BGM tracks, crossfade transitions, volume controls for music and SFX separately, and efficient audio loading strategies. The system maintains backward compatibility with existing sound effects while adding sophisticated music management capabilities.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      TetrisApp                               │
│  (Game State Management & Screen Navigation)                 │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ controls audio state
                 │
┌────────────────▼────────────────────────────────────────────┐
│                   AudioManager                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  BGMController                                        │   │
│  │  - Menu BGM playback                                  │   │
│  │  - Game BGM selection & playback                      │   │
│  │  - Crossfade transitions                              │   │
│  │  - Pause/Resume management                            │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  VolumeController                                     │   │
│  │  - Music volume (0-100%)                              │   │
│  │  - SFX volume (0-100%)                                │   │
│  │  - GainNode management                                │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  AudioLoader                                          │   │
│  │  - Preload priority tracks                            │   │
│  │  - Lazy load remaining tracks                         │   │
│  │  - Loading state management                           │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PreferenceManager                                    │   │
│  │  - localStorage persistence                           │   │
│  │  - audioPrefs.v1 schema                               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                 │
                 │ uses
                 │
┌────────────────▼────────────────────────────────────────────┐
│              Web Audio API / HTML5 Audio                     │
│  - AudioContext                                              │
│  - GainNodes for volume control                              │
│  - Audio elements for playback                               │
└─────────────────────────────────────────────────────────────┘
```

### Audio State Machine

```
┌──────────────┐
│  Locked      │ (Initial state, no audio allowed)
└──────┬───────┘
       │ user gesture
       ▼
┌──────────────┐
│  Unlocked    │ (Audio context active)
└──────┬───────┘
       │ navigate to menu
       ▼
┌──────────────┐
│  Menu BGM    │ (menu_bgm looping)
└──────┬───────┘
       │ start game
       ▼
┌──────────────┐
│  Crossfade   │ (500ms transition)
└──────┬───────┘
       │ transition complete
       ▼
┌──────────────┐
│  Game BGM    │ (selected BGM looping)
└──────┬───────┘
       │ pause game
       ▼
┌──────────────┐
│  Paused      │ (BGM paused, position saved)
└──────┬───────┘
       │ resume game
       ▼
┌──────────────┐
│  Game BGM    │ (resume from saved position)
└──────┬───────┘
       │ game over
       ▼
┌──────────────┐
│  Crossfade   │ (500ms transition back)
└──────┬───────┘
       │ transition complete
       ▼
┌──────────────┐
│  Menu BGM    │ (menu_bgm looping)
└──────────────┘
```

## Components and Interfaces

### AudioManager

The main orchestrator that manages all audio subsystems.

```javascript
class AudioManager {
  constructor()
  
  // Initialization
  async initialize()
  unlockAudio()
  
  // BGM Control
  playMenuBGM()
  playGameBGM(trackId)
  crossfadeToGame(trackId, duration = 500)
  crossfadeToMenu(duration = 500)
  pauseGameBGM()
  resumeGameBGM()
  
  // Volume Control
  setMusicVolume(percentage)
  setSFXVolume(percentage)
  getMusicVolume()
  getSFXVolume()
  
  // State
  isUnlocked()
  getCurrentBGM()
  isLoading()
}
```

### BGMController

Manages background music playback and transitions.

```javascript
class BGMController {
  constructor(audioContext, volumeController)
  
  // Track Management
  loadTrack(trackId)
  async preloadTrack(trackId)
  isTrackLoaded(trackId)
  
  // Playback
  play(trackId, loop = true)
  pause()
  resume()
  stop()
  
  // Transitions
  async crossfade(fromTrackId, toTrackId, duration)
  fadeOut(trackId, duration)
  fadeIn(trackId, duration)
  
  // State
  getCurrentTrack()
  isPlaying()
  isPaused()
}
```

### VolumeController

Manages volume levels using GainNodes.

```javascript
class VolumeController {
  constructor(audioContext)
  
  // GainNode Management
  createMusicGainNode()
  createSFXGainNode()
  
  // Volume Control
  setMusicGain(value)
  setSFXGain(value)
  getMusicGain()
  getSFXGain()
  
  // Utilities
  percentageToGain(percentage)
  gainToPercentage(gain)
}
```

### AudioLoader

Handles efficient loading of audio files.

```javascript
class AudioLoader {
  constructor()
  
  // Loading
  async preload(trackIds)
  async lazyLoad(trackId)
  
  // State
  isLoaded(trackId)
  getLoadProgress(trackId)
  getTotalSize()
  
  // Budget Management
  shouldLazyLoad()
  estimateLoadTime(trackId)
}
```

### PreferenceManager

Persists and restores user audio preferences.

```javascript
class PreferenceManager {
  constructor()
  
  // Persistence
  save(preferences)
  load()
  
  // Preferences Schema
  getDefaultPreferences()
  validatePreferences(prefs)
}
```

## Data Models

### Audio Preferences Schema

Stored in localStorage under key `audioPrefs.v1`:

```javascript
{
  version: 1,
  musicVolume: 70,        // 0-100
  sfxVolume: 80,          // 0-100
  selectedBGM: 'bgm_1',   // 'bgm_1' | 'bgm_2' | 'bgm_3'
  muted: false            // backward compatibility
}
```

### BGM Track Configuration

```javascript
const BGM_TRACKS = {
  menu_bgm: {
    id: 'menu_bgm',
    path: 'client/public/sounds/menu_bgm.mp3',
    priority: 'high',      // preload immediately
    loop: true,
    defaultVolume: 0.3
  },
  bgm_1: {
    id: 'bgm_1',
    path: 'client/public/sounds/bgm_1.mp3',
    priority: 'high',      // preload if last selected
    loop: true,
    defaultVolume: 0.4
  },
  bgm_2: {
    id: 'bgm_2',
    path: 'client/public/sounds/bgm_2.mp3',
    priority: 'low',       // lazy load
    loop: true,
    defaultVolume: 0.4
  },
  bgm_3: {
    id: 'bgm_3',
    path: 'client/public/sounds/bgm_3.mp3',
    priority: 'low',       // lazy load
    loop: true,
    defaultVolume: 0.4
  }
}
```

### Audio State

```javascript
{
  unlocked: false,
  currentBGM: null,       // 'menu_bgm' | 'bgm_1' | 'bgm_2' | 'bgm_3'
  isPlaying: false,
  isPaused: false,
  isCrossfading: false,
  loadedTracks: Set(),
  loadingTracks: Set()
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: User gesture unlocks audio

*For any* user gesture type (click, tap, keypress), triggering the gesture should transition the audio context state from 'suspended' to 'running' and enable playback capabilities.
**Validates: Requirements 1.2**

### Property 2: Volume preferences restored after unlock

*For any* valid music and SFX volume values (0-100%), if they are persisted to localStorage and then audio is unlocked, the applied volumes should match the persisted values.
**Validates: Requirements 1.3**

### Property 3: Menu BGM plays in all menu states

*For any* menu screen state (main menu, mode selection, instructions), when the audio context is unlocked and the player is in that menu state, the menu BGM should be playing in a loop.
**Validates: Requirements 2.1**

### Property 4: Menu BGM persists across navigation

*For any* sequence of menu screen navigations, the menu BGM should continue playing without stopping or restarting.
**Validates: Requirements 2.3**

### Property 5: Mute stops menu BGM

*For any* playing menu BGM, when the player mutes music, the menu BGM playback should stop.
**Validates: Requirements 2.4**

### Property 6: BGM selection persists

*For any* BGM selection (bgm_1, bgm_2, or bgm_3), when the player selects it, the selection should be stored in localStorage under audioPrefs.v1 with the correct trackId.
**Validates: Requirements 3.2**

### Property 7: BGM selection round-trip

*For any* BGM selection, if it is selected and saved, then when a new game session loads, the same BGM should be loaded from localStorage.
**Validates: Requirements 3.3**

### Property 8: Game start triggers crossfade

*For any* selected game BGM, when the player starts a game from the menu, a crossfade transition should be initiated from menu BGM to the selected game BGM.
**Validates: Requirements 4.1**

### Property 9: Crossfade completion state

*For any* completed crossfade from menu to game, the menu BGM should be stopped and only the game BGM should be playing.
**Validates: Requirements 4.4**

### Property 10: Game BGM pause responsiveness

*For any* playing game BGM, when the player pauses the game, the BGM should pause within 100 milliseconds.
**Validates: Requirements 5.2**

### Property 11: Game BGM resume with position

*For any* paused game BGM, when the player resumes the game, the BGM should resume from its paused position within 100 milliseconds.
**Validates: Requirements 5.3**

### Property 12: Game end crossfade

*For any* playing game BGM, when the game ends and returns to menu, a crossfade transition should occur from game BGM back to menu BGM.
**Validates: Requirements 5.4**

### Property 13: Music volume adjustment

*For any* volume percentage value (0-100%), when the player adjusts the Music volume slider to that value, the music volume should be set to that percentage immediately.
**Validates: Requirements 6.2**

### Property 14: SFX volume adjustment

*For any* volume percentage value (0-100%), when the player adjusts the SFX volume slider to that value, the SFX volume should be set to that percentage immediately.
**Validates: Requirements 6.3**

### Property 15: Volume settings persistence

*For any* music and SFX volume changes, when the player changes the volumes, both values should be persisted to localStorage under audioPrefs.v1.
**Validates: Requirements 6.4**

### Property 16: Volume settings round-trip

*For any* music and SFX volume values, if they are set and saved, then when the game loads and audio is unlocked, the restored volumes should match the saved values.
**Validates: Requirements 6.5**

### Property 17: Smart BGM preloading

*For any* last-selected game BGM track, when the game initializes, that track should be preloaded along with the menu BGM.
**Validates: Requirements 7.2**

### Property 18: On-demand BGM loading

*For any* unloaded BGM selection, when the player selects that BGM, the track should be loaded before gameplay starts.
**Validates: Requirements 7.4**

### Property 19: Graceful load failure

*For any* audio file that fails to load, the system should log the error and continue execution without that track.
**Validates: Requirements 8.1**

### Property 20: Graceful playback errors

*For any* audio playback error during gameplay, the game should continue executing without audio.
**Validates: Requirements 8.3**

## Error Handling

### Audio Context Unlock Failures

- **Detection**: Monitor AudioContext.state after user gesture
- **Recovery**: Display user-friendly message: "Click anywhere to enable audio"
- **Fallback**: Continue game without audio if unlock fails after 3 attempts

### Audio File Loading Errors

- **Detection**: Monitor load events and error events on audio elements
- **Recovery**: Log error with track ID and continue without that track
- **Fallback**: Use silent placeholder for failed tracks to prevent crashes

### Web Audio API Unavailability

- **Detection**: Check for AudioContext constructor availability
- **Recovery**: Fall back to HTML5 audio elements with stepped volume
- **Limitation**: Crossfades will be less smooth (60 FPS steps vs continuous)

### Playback Errors During Gameplay

- **Detection**: Catch exceptions from play() promises
- **Recovery**: Log error and continue game loop
- **User Feedback**: Optional: Show small icon indicating audio is unavailable

### localStorage Unavailability

- **Detection**: Try-catch around localStorage access
- **Recovery**: Use in-memory preferences that reset on page reload
- **Fallback**: Default to bgm_1, 70% music, 80% SFX

### Crossfade Timing Issues

- **Detection**: Monitor crossfade completion callbacks
- **Recovery**: Force-complete crossfade after timeout (1000ms)
- **Cleanup**: Ensure old track is stopped even if fade doesn't complete smoothly

## Testing Strategy

### Unit Testing

The testing strategy uses standard unit tests for specific examples and edge cases:

- **Audio unlock on first gesture**: Verify unlock occurs on click, tap, and keypress
- **Default BGM selection**: Verify bgm_1 is selected when no preference exists
- **Default volume values**: Verify 70% music and 80% SFX when no preference exists
- **Crossfade timing**: Verify 500ms fade duration for both tracks
- **Simultaneous crossfade**: Verify both tracks fade at the same time
- **GainNode usage**: Verify GainNodes are used when Web Audio API is available
- **HTML5 audio fallback**: Verify fallback when Web Audio API is unavailable
- **Menu BGM looping**: Verify loop property is set and track restarts
- **Game BGM looping**: Verify loop property is set and track restarts
- **UI elements**: Verify BGM selection UI shows three options
- **Volume slider UI**: Verify two sliders are displayed
- **Preload menu BGM**: Verify menu BGM loads during initialization
- **Lazy load threshold**: Verify lazy loading when size/time exceeds budget
- **Loading indicator**: Verify indicator shows after 500ms load time
- **Blocked audio message**: Verify user-friendly message on autoplay block

### Property-Based Testing

The testing strategy uses **fast-check** (JavaScript property-based testing library) to verify universal properties across many randomly generated inputs:

**Configuration**: Each property-based test will run a minimum of 100 iterations to ensure thorough coverage of the input space.

**Property Tests**:

1. **User gesture unlocks audio** (Property 1)
   - Generate: Random gesture types (click, tap, keypress)
   - Verify: Audio context transitions to 'running' state

2. **Volume preferences restored** (Property 2)
   - Generate: Random volume values (0-100% for music and SFX)
   - Verify: Persisted volumes match applied volumes after unlock

3. **Menu BGM plays in all menu states** (Property 3)
   - Generate: Random menu screen states
   - Verify: Menu BGM is playing when in menu state

4. **Menu BGM persists across navigation** (Property 4)
   - Generate: Random sequences of menu navigations
   - Verify: Menu BGM continues without stopping

5. **Mute stops menu BGM** (Property 5)
   - Generate: Random menu BGM playing states
   - Verify: Mute action stops playback

6. **BGM selection persists** (Property 6)
   - Generate: Random BGM selections (bgm_1, bgm_2, bgm_3)
   - Verify: Selection is stored in localStorage correctly

7. **BGM selection round-trip** (Property 7)
   - Generate: Random BGM selections
   - Verify: Save then load produces same selection

8. **Game start triggers crossfade** (Property 8)
   - Generate: Random selected game BGMs
   - Verify: Crossfade is initiated on game start

9. **Crossfade completion state** (Property 9)
   - Generate: Random crossfade scenarios
   - Verify: Only game BGM plays after completion

10. **Game BGM pause responsiveness** (Property 10)
    - Generate: Random game BGM playing states
    - Verify: Pause occurs within 100ms

11. **Game BGM resume with position** (Property 11)
    - Generate: Random paused positions
    - Verify: Resume from correct position within 100ms

12. **Game end crossfade** (Property 12)
    - Generate: Random game BGM playing states
    - Verify: Crossfade to menu BGM on game end

13. **Music volume adjustment** (Property 13)
    - Generate: Random volume percentages (0-100%)
    - Verify: Music volume matches slider value immediately

14. **SFX volume adjustment** (Property 14)
    - Generate: Random volume percentages (0-100%)
    - Verify: SFX volume matches slider value immediately

15. **Volume settings persistence** (Property 15)
    - Generate: Random volume changes
    - Verify: Both values saved to localStorage

16. **Volume settings round-trip** (Property 16)
    - Generate: Random volume values
    - Verify: Save then load produces same volumes

17. **Smart BGM preloading** (Property 17)
    - Generate: Random last-selected BGM tracks
    - Verify: That track is preloaded on initialization

18. **On-demand BGM loading** (Property 18)
    - Generate: Random unloaded BGM selections
    - Verify: Track loads before gameplay starts

19. **Graceful load failure** (Property 19)
    - Generate: Random audio file load failures
    - Verify: System continues without that track

20. **Graceful playback errors** (Property 20)
    - Generate: Random playback errors
    - Verify: Game continues executing

### Test Utilities

**Mock Audio Context**: Create a mock AudioContext for testing without actual audio playback

**Mock localStorage**: Create an in-memory localStorage implementation for testing persistence

**Time Mocking**: Use fake timers to test crossfade timing without waiting

**Audio State Inspector**: Utility to inspect current audio state for assertions

### Integration Testing

- **Full crossfade flow**: Test complete transition from menu to game and back
- **Volume persistence across sessions**: Test save/load cycle with page reload
- **Lazy loading under budget**: Test that lazy loading activates correctly
- **Error recovery**: Test that errors don't break game functionality

## Implementation Notes

### Web Audio API vs HTML5 Audio

The system will primarily use Web Audio API for superior control and performance:

- **Advantages**: Precise timing, GainNode volume control, better crossfades
- **Fallback**: HTML5 audio elements when Web Audio API is unavailable
- **Detection**: Check for `window.AudioContext || window.webkitAudioContext`

### Crossfade Implementation

Using Web Audio API GainNodes:

```javascript
// Fade out old track
oldGainNode.gain.setValueAtTime(currentVolume, now);
oldGainNode.gain.linearRampToValueAtTime(0, now + 0.5);

// Fade in new track
newGainNode.gain.setValueAtTime(0, now);
newGainNode.gain.linearRampToValueAtTime(targetVolume, now + 0.5);
```

Using HTML5 audio fallback:

```javascript
// 60 FPS = ~16.67ms per frame
const steps = 30; // 500ms / 16.67ms
const volumeStep = targetVolume / steps;

let currentStep = 0;
const interval = setInterval(() => {
  oldAudio.volume -= volumeStep;
  newAudio.volume += volumeStep;
  currentStep++;
  
  if (currentStep >= steps) {
    clearInterval(interval);
    oldAudio.pause();
  }
}, 16.67);
```

### Performance Considerations

- **Preload Strategy**: Load menu_bgm + last-selected BGM immediately
- **Lazy Load Threshold**: 5 MB total or 3 second load time
- **Memory Management**: Unload unused BGM tracks after 5 minutes of inactivity
- **Crossfade Optimization**: Use requestAnimationFrame for smooth fallback fades

### Browser Compatibility

- **Modern Browsers**: Full Web Audio API support with GainNodes
- **Safari**: Requires user gesture for AudioContext.resume()
- **Mobile Browsers**: May have stricter autoplay policies
- **Legacy Browsers**: HTML5 audio fallback with stepped volume

### Backward Compatibility

The existing `SoundManager` will be refactored to use the new `AudioManager`:

- **Preserve**: Existing SFX methods (playMove, playRotate, etc.)
- **Migrate**: Volume and mute settings to new audioPrefs.v1 schema
- **Deprecate**: Old background music methods in favor of BGM system
- **Maintain**: Existing localStorage keys for migration period
