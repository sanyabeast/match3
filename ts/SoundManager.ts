/**
 * Sound manager for the Match3 game
 * Handles loading and playing sound effects
 */
export class SoundManager {
  private static instance: SoundManager;
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;

  // Sound effect names
  public static readonly SOUND_EFFECTS = {
    EXPLOSION: 'explosion',
    EXPLOSION_BIG: 'explosion_big',
    FAIL: 'fail',
    FILL: 'fill',
    SWAP: 'swap',
    TURN: 'turn',
    YES: 'yes'
  };

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    this.loadSounds();
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
    this.loadSound(SoundManager.SOUND_EFFECTS.EXPLOSION_BIG, 'Explosion8.mp3');
    this.loadSound(SoundManager.SOUND_EFFECTS.FAIL, 'fail.mp3');
    this.loadSound(SoundManager.SOUND_EFFECTS.FILL, 'fill.mp3');
    this.loadSound(SoundManager.SOUND_EFFECTS.SWAP, 'swap.mp3');
    this.loadSound(SoundManager.SOUND_EFFECTS.TURN, 'turn.mp3');
    this.loadSound(SoundManager.SOUND_EFFECTS.YES, 'yes.mp3');
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
   * Enable or disable all sounds
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Toggle sound on/off
   */
  public toggleSound(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  /**
   * Check if sound is enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }
}
