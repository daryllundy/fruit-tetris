# Requirements Document

## Introduction

This document specifies the requirements for an advanced audio system for Fruit Tetris that provides a polished, professional audio experience. The system includes menu background music, selectable gameplay background music tracks, smooth crossfade transitions, persistent volume controls, and proper audio unlocking for browser autoplay policies. The audio system enhances player immersion through dynamic music management while respecting user preferences and browser constraints.

## Glossary

- **Audio System**: The complete audio management subsystem responsible for music playback, transitions, and volume control
- **Menu BGM**: Background music track that plays during menu screens
- **Game BGM**: Background music track that plays during active gameplay (bgm_1, bgm_2, or bgm_3)
- **Crossfade**: A smooth audio transition where one track fades out while another fades in simultaneously
- **Audio Unlock**: The browser requirement that audio playback must be initiated by a user gesture
- **GainNode**: Web Audio API node that controls volume/gain of audio signals
- **Audio Context**: Web Audio API interface for managing and playing audio
- **Preload**: Loading audio files into memory before they are needed for playback
- **Lazy Load**: Deferring the loading of audio files until they are actually needed
- **Audio Preferences**: User-configurable settings for music volume, SFX volume, and selected BGM track
- **localStorage**: Browser API for persisting data across sessions

## Requirements

### Requirement 1

**User Story:** As a player, I want the audio system to respect browser autoplay policies, so that I can enjoy music without browser blocking or errors.

#### Acceptance Criteria

1. WHEN the game loads THEN the Audio System SHALL NOT attempt to play any audio before a user gesture occurs
2. WHEN a user performs their first interaction (click, tap, or keypress) THEN the Audio System SHALL unlock the audio context and enable playback
3. WHEN audio unlock succeeds THEN the Audio System SHALL apply persisted volume preferences to all audio tracks
4. WHEN audio unlock fails THEN the Audio System SHALL log the error and continue without audio playback

### Requirement 2

**User Story:** As a player, I want menu background music to play while I'm navigating menus, so that the game feels polished and engaging.

#### Acceptance Criteria

1. WHEN the audio context is unlocked and the player is in a menu screen THEN the Audio System SHALL play the menu BGM track in a continuous loop
2. WHEN the menu BGM track reaches its end THEN the Audio System SHALL restart the track seamlessly without gaps
3. WHEN the player navigates between different menu screens THEN the Audio System SHALL continue playing the menu BGM without interruption
4. WHEN the player mutes music THEN the Audio System SHALL stop the menu BGM playback

### Requirement 3

**User Story:** As a player, I want to select which background music plays during gameplay, so that I can customize my gaming experience.

#### Acceptance Criteria

1. WHEN the player is on the Select Mode screen THEN the Audio System SHALL display three BGM options (bgm_1, bgm_2, bgm_3) for selection
2. WHEN the player selects a BGM option THEN the Audio System SHALL store the selection in localStorage under the key audioPrefs.v1
3. WHEN the player starts a new game session THEN the Audio System SHALL load the previously selected BGM from localStorage
4. WHERE no BGM selection exists in localStorage THEN the Audio System SHALL default to bgm_1

### Requirement 4

**User Story:** As a player, I want smooth music transitions when starting a game, so that the audio experience feels professional and seamless.

#### Acceptance Criteria

1. WHEN the player starts a game from the menu THEN the Audio System SHALL initiate a crossfade transition between menu BGM and the selected game BGM
2. WHILE performing a crossfade THEN the Audio System SHALL fade out the menu BGM over 500 milliseconds
3. WHILE performing a crossfade THEN the Audio System SHALL fade in the selected game BGM over 500 milliseconds simultaneously with the menu BGM fade out
4. WHEN the crossfade completes THEN the Audio System SHALL stop the menu BGM track and continue playing only the game BGM
5. WHEN implementing crossfades with Web Audio API THEN the Audio System SHALL use GainNode volume control for smooth transitions
6. WHERE Web Audio API is unavailable THEN the Audio System SHALL implement crossfades using 60 FPS stepped volume adjustments with HTML5 audio elements

### Requirement 5

**User Story:** As a player, I want the gameplay background music to loop continuously and respond to game state, so that the audio matches my gameplay experience.

#### Acceptance Criteria

1. WHEN a game BGM track is playing and reaches its end THEN the Audio System SHALL restart the track seamlessly in a continuous loop
2. WHEN the player pauses the game THEN the Audio System SHALL pause the game BGM within 100 milliseconds
3. WHEN the player resumes the game THEN the Audio System SHALL resume the game BGM from its paused position within 100 milliseconds
4. WHEN the game ends and returns to menu THEN the Audio System SHALL crossfade from game BGM back to menu BGM using the same 500 millisecond transition

### Requirement 6

**User Story:** As a player, I want to control music and sound effect volumes independently, so that I can balance audio to my preference.

#### Acceptance Criteria

1. WHEN the player is in the settings or menu screen THEN the Audio System SHALL display two volume sliders: one for Music and one for SFX
2. WHEN the player adjusts the Music volume slider THEN the Audio System SHALL set the music volume to the selected percentage (0-100%) immediately
3. WHEN the player adjusts the SFX volume slider THEN the Audio System SHALL set the sound effects volume to the selected percentage (0-100%) immediately
4. WHEN the player changes volume settings THEN the Audio System SHALL persist both Music and SFX volume values to localStorage under the key audioPrefs.v1
5. WHEN the game loads and audio is unlocked THEN the Audio System SHALL restore Music and SFX volume settings from localStorage
6. WHERE no volume settings exist in localStorage THEN the Audio System SHALL default to 70% for Music and 80% for SFX

### Requirement 7

**User Story:** As a player, I want audio files to load efficiently without delaying game startup, so that I can start playing quickly.

#### Acceptance Criteria

1. WHEN the game initializes THEN the Audio System SHALL preload the menu BGM track before the first menu screen displays
2. WHEN the game initializes THEN the Audio System SHALL preload the last-selected game BGM track to avoid playback delays
3. WHERE the total initial audio load would exceed 5 MB or delay startup beyond 3 seconds THEN the Audio System SHALL lazy-load the remaining game BGM tracks
4. WHEN a player selects a BGM that has not been loaded THEN the Audio System SHALL load that track before starting gameplay
5. WHEN lazy-loading a BGM track THEN the Audio System SHALL display a loading indicator if the load takes longer than 500 milliseconds

### Requirement 8

**User Story:** As a player, I want the audio system to handle errors gracefully, so that audio issues don't break my gameplay experience.

#### Acceptance Criteria

1. WHEN an audio file fails to load THEN the Audio System SHALL log the error and continue without that audio track
2. WHEN the Web Audio API is unavailable THEN the Audio System SHALL fall back to HTML5 audio elements
3. WHEN audio playback encounters an error during gameplay THEN the Audio System SHALL continue game execution without audio
4. WHEN the browser blocks audio playback THEN the Audio System SHALL display a user-friendly message prompting for interaction
