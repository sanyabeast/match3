/**
 * Sound manager for the Match3 game
 * Handles loading and playing sound effects
 */
export class SoundManager {
  private static instance: SoundManager;
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;
  private backgroundMusic: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private hasUserInteraction: boolean = false;

  // Sound effect names
  public static readonly SOUND_EFFECTS = {
    EXPLOSION: 'explosion',
    EXPLOSION_BIG: 'explosion_big',
    FAIL: 'fail',
    FILL: 'fill',
    SWAP: 'swap',
    TURN: 'turn',
    YES: 'yes',
    BG_THEME: 'bg_theme'
  };

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    this.loadSounds();
    this.initBackgroundMusic();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /**
   * Load all sound effects
   */
  private loadSounds(): void {
    this.loadSound(SoundManager.SOUND_EFFECTS.EXPLOSION, 'explosion.mp3');
    this.loadSound(SoundManager.SOUND_EFFECTS.FAIL, 'fail.mp3');
    this.loadSound(SoundManager.SOUND_EFFECTS.FILL, 'fill.mp3');
    this.loadSound(SoundManager.SOUND_EFFECTS.SWAP, 'swap.mp3');
    this.loadSound(SoundManager.SOUND_EFFECTS.TURN, 'turn.mp3');
  }

  /**
   * Initialize background music
   */
  private initBackgroundMusic(): void {
    this.backgroundMusic = new Audio('audio/bg_theme.mp3');
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = 0.3; // Lower volume for background music
    
    // Create audio context for better control
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported in this browser');
    }
  }

  /**
   * Load a single sound effect
   */
  private loadSound(name: string, filename: string): void {
    const audio = new Audio(`audio/${filename}`);
    audio.preload = 'auto';
    this.sounds.set(name, audio);
  }

  /**
   * Play a sound effect
   */
  public play(name: string): void {
    if (!this.enabled) return;
    
    const sound = this.sounds.get(name);
    if (sound) {
      // Clone the audio element to allow overlapping sounds
      const soundClone = sound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.5; // Set volume to 50%
      soundClone.play().catch(error => {
        console.warn(`Error playing sound ${name}:`, error);
      });
    }
  }

  /**
   * Start playing background music
   */
  public playBackgroundMusic(): void {
    if (!this.enabled || !this.backgroundMusic) return;
    
    // Only play if not already playing
    if (this.backgroundMusic.paused) {
      // Resume audio context if it exists and is suspended
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(error => {
          console.warn('Error resuming AudioContext:', error);
        });
      }
      
      // Play the background music
      this.backgroundMusic.play().catch(error => {
        // If autoplay was prevented, we'll wait for user interaction
        console.warn('Error playing background music (likely autoplay restriction):', error);
      });
    }
  }

  /**
   * Pause background music
   */
  public pauseBackgroundMusic(): void {
    if (this.backgroundMusic && !this.backgroundMusic.paused) {
      this.backgroundMusic.pause();
    }
  }

  /**
   * Enable or disable all sounds
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    
    // Handle background music based on enabled state
    if (!enabled) {
      this.pauseBackgroundMusic();
    } else if (this.backgroundMusic) {
      this.playBackgroundMusic();
    }
  }

  /**
   * Toggle sound on/off
   */
  public toggleSound(): boolean {
    this.enabled = !this.enabled;
    
    // Handle background music based on new enabled state
    if (!this.enabled) {
      this.pauseBackgroundMusic();
    } else {
      this.playBackgroundMusic();
    }
    
    return this.enabled;
  }

  /**
   * Check if sound is enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Mark that user interaction has occurred
   */
  public userInteractionOccurred(): void {
    this.hasUserInteraction = true;
    
    // Resume audio context if it was suspended
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(error => {
        console.warn('Error resuming AudioContext:', error);
      });
    }
    
    // Try to play background music now that we have user interaction
    if (this.enabled) {
      this.playBackgroundMusic();
    }
  }
}
