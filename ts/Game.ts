import { GemPosition } from './types';
import { 
  ELEMENT_IDS, 
  CSS_CLASSES, 
  GemState, 
  DATA_ATTRIBUTES, 
  DEFAULT_SETTINGS,
  GEM_SYMBOLS,
  MatchAction
} from './constants';
import { Board } from './Board';
import { Gem } from './Gem';
import { SoundManager } from './SoundManager';

export class Game {
  private board: Board;
  private cluster: GemPosition[] = [];
  private chosen: boolean = false;
  private field: HTMLElement;
  private pause: boolean = true;
  private score: number = 0;
  private target: number = 0;
  private time: number = DEFAULT_SETTINGS.INITIAL_TIME;
  private scoreboard: HTMLElement;
  private level: number = 1;
  private chosenJ: number = -1;
  private chosenK: number = -1;
  private countdownInterval: number | null = null;
  private soundManager: SoundManager;

  constructor() {
    this.field = document.getElementById(ELEMENT_IDS.FIELD) as HTMLElement;
    this.scoreboard = document.getElementById(ELEMENT_IDS.SCOREBOARD) as HTMLElement;
    this.soundManager = SoundManager.getInstance();

    // Initialize the board with default settings
    this.board = new Board(
      this.field, 
      DEFAULT_SETTINGS.INITIAL_SIZE, 
      DEFAULT_SETTINGS.MIN_LINE, 
      DEFAULT_SETTINGS.INITIAL_COLORS
    );

    this.initEventListeners();
    this.startLevel(this.level);
  }

  private initEventListeners(): void {
    this.field.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Only process clicks on gem elements
      if (!target.classList.contains(CSS_CLASSES.GEM)) return;
      
      // Game must not be paused
      if (this.pause) return;
      
      // Get gem coordinates
      const j = parseInt(target.getAttribute(DATA_ATTRIBUTES.J) || '0', 10);
      const k = parseInt(target.getAttribute(DATA_ATTRIBUTES.K) || '0', 10);
      
      if (!this.chosen) {
        // First gem selection
        this.chosen = true;
        this.chosenJ = j;
        this.chosenK = k;
        console.log(`Selected gem: ${j}x${k}, color: ${this.board.getGem(j, k).color}, state: ${this.board.getGem(j, k).state}`);
        this.board.getGem(j, k).elem.classList.add(CSS_CLASSES.CHOSEN);
        this.soundManager.play(SoundManager.SOUND_EFFECTS.TURN);
      } else {
        // Second gem selection (attempting to swap)
        this.chosen = false;
        
        // Remove highlight from first gem
        this.board.getGem(this.chosenJ, this.chosenK).elem.classList.remove(CSS_CLASSES.CHOSEN);
        
        // Try to swap gems if it's a valid move
        if (this.board.isCorrectTurn(this.chosenJ, this.chosenK, j, k)) {
          // Temporarily disable further clicks to prevent multiple swaps
          this.pause = true;
          
          // Swap the gems
          this.board.swap(this.chosenJ, this.chosenK, j, k);
          
          // Place gems immediately for visual feedback
          this.board.getGem(this.chosenJ, this.chosenK).place();
          this.board.getGem(j, k).place();
          this.soundManager.play(SoundManager.SOUND_EFFECTS.SWAP);
          
          // Check for matches immediately
          this.cluster = this.board.matchChain(this.chosenJ, this.chosenK);
          this.cluster = this.cluster.concat(this.board.matchChain(j, k));
          
          if (this.cluster.length === 0) {
            // No matches found, swap back with shorter delay
            setTimeout(() => {
              this.board.swap(j, k, this.chosenJ, this.chosenK);
              this.board.getGem(this.chosenJ, this.chosenK).place();
              this.board.getGem(j, k).place();
              // Re-enable clicks
              this.pause = false;
            }, DEFAULT_SETTINGS.SWAP_DELAY / 2);
          } else {
            // Matches found, remove them
            this.kill(this.cluster);
          }
        }
      }
    });
  }

  public startLevel(level: number): void {
    // Calculate target score based on level
    this.target = Math.floor(Math.sqrt(level) * 5000);
    
    // Set board size (random between 12-16)
    const size = Math.floor(Math.random() * 5) + 12;
    
    // Increase color variety as levels progress (max 10)
    const colors = Math.min(DEFAULT_SETTINGS.INITIAL_COLORS + level - 1, 10);
    
    // Determine game mode features based on level
    this.determineGameModeForLevel(level);
    
    // Display level information
    this.displayLevelInfo(level);
    
    // Set time limit based on level
    this.time = DEFAULT_SETTINGS.INITIAL_TIME + Math.floor((level * 5) / 2);
    
    // Initialize the game board after a delay
    setTimeout(() => {
      // Create a new board with the new size and settings
      this.board = new Board(this.field, size, DEFAULT_SETTINGS.MIN_LINE, colors);
      
      // Reset game state
      this.pause = false;
      this.score = 0;
      this.updateScoreboard();
    }, DEFAULT_SETTINGS.LEVEL_START_DELAY);
    
    // Start the countdown timer
    this.startCountdownTimer();
  }
  
  /**
   * Determines game mode features based on level
   */
  private determineGameModeForLevel(level: number): void {
    // No special game modes - only horizontal and vertical matches
  }
  
  /**
   * Displays level information in the field element
   */
  private displayLevelInfo(level: number): void {
    this.field.innerHTML = `Level ${level}`;
  }
  
  /**
   * Starts or restarts the countdown timer
   */
  private startCountdownTimer(): void {
    // Clear any existing timer
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    
    // Set up the new timer
    this.countdownInterval = window.setInterval(() => {
      if (this.time === 0) {
        if (this.score < this.target) {
          // Game over - player didn't reach target score
          this.handleGameOver();
        } else {
          // Level completed - advance to next level
          this.handleLevelComplete();
        }
      } else {
        // Update time and display
        this.time -= 1;
        this.updateScoreboard();
      }
    }, DEFAULT_SETTINGS.COUNTDOWN_INTERVAL);
  }
  
  /**
   * Updates the scoreboard with current score and time
   */
  private updateScoreboard(): void {
    this.scoreboard.innerHTML = `${this.score}/${this.target} | ${this.time}`;
  }
  
  /**
   * Handles game over state
   */
  private handleGameOver(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.pause = true;
    this.field.innerHTML = 'GAME OVER';
    this.soundManager.play(SoundManager.SOUND_EFFECTS.FAIL);
    
    // Add restart button
    const restartButton = document.createElement('div');
    restartButton.id = ELEMENT_IDS.RESTART;
    restartButton.innerHTML = 'RESTART';
    restartButton.addEventListener('click', () => {
      this.level = 1;
      this.startLevel(this.level);
    });
    this.field.appendChild(restartButton);
  }
  
  /**
   * Handles level complete state
   */
  private handleLevelComplete(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.pause = true;
    this.level++;
    this.field.innerHTML = 'LEVEL COMPLETE';
    this.soundManager.play(SoundManager.SOUND_EFFECTS.YES);
    
    // Add next level button
    const nextLevelButton = document.createElement('div');
    nextLevelButton.id = ELEMENT_IDS.RESTART;
    nextLevelButton.innerHTML = 'NEXT LEVEL';
    nextLevelButton.addEventListener('click', () => {
      this.startLevel(this.level);
    });
    this.field.appendChild(nextLevelButton);
  }

  /**
   * Removes matched gems and updates score
   */
  private kill(cluster: GemPosition[]): void {
    this.pause = true;
    
    // Update score based on matches
    this.updateScoreForMatches(cluster);
    
    // Process matched gems in batches for better performance
    this.processMatchedGems(cluster);
  }
  
  /**
   * Updates score based on matched gems
   */
  private updateScoreForMatches(cluster: GemPosition[]): void {
    // Apply bonus multiplier for larger matches
    const sizeMultiplier = cluster.length > 4 ? 1.5 : 1;
    this.score += Math.floor(cluster.length * DEFAULT_SETTINGS.SCORE_MULTIPLIER * sizeMultiplier);
    this.updateScoreboard();
    
    // Play explosion sound based on cluster size
    if (cluster.length >= 5) {
      this.soundManager.play(SoundManager.SOUND_EFFECTS.EXPLOSION_BIG);
    } else {
      this.soundManager.play(SoundManager.SOUND_EFFECTS.EXPLOSION);
    }
  }
  
  /**
   * Processes matched gems (killing them and checking for new matches)
   */
  private processMatchedGems(cluster: GemPosition[]): void {
    // Kill all gems in the cluster simultaneously
    const batchSize = 5;
    const processBatch = (startIndex: number) => {
      const endIndex = Math.min(startIndex + batchSize, cluster.length);
      
      // Process current batch
      for (let i = startIndex; i < endIndex; i++) {
        const pos = cluster[i];
        // Kill the gem (this triggers the exit animation)
        this.board.getGem(pos.j, pos.k).kill();
      }
      
      // Process next batch or move to next step
      if (endIndex < cluster.length) {
        // Process next batch after a very short delay
        setTimeout(() => processBatch(endIndex), 10);
      } else {
        // All gems processed, wait for kill animation to complete
        // then shift gems down
        setTimeout(() => this.shiftDown(), DEFAULT_SETTINGS.KILL_DELAY);
      }
    };
    
    // Start processing the first batch
    processBatch(0);
  }
  
  /**
   * Shifts gems down to fill empty spaces
   */
  private shiftDown(): void {
    let shifted = false;
    
    // Process all columns in parallel for better performance
    for (let j = this.board.size - 2; j >= 0; j--) {
      for (let k = 0; k < this.board.size; k++) {
        // If current gem is alive and the one below is dead, shift down
        if (
          this.board.getGem(j, k).state === GemState.ALIVE && 
          this.board.getGem(j + 1, k).state === GemState.DEAD
        ) {
          // Swap the gems
          this.board.swap(j, k, j + 1, k);
          this.board.getGem(j + 1, k).place(); // Place only the moved gem for efficiency
          shifted = true;
        }
      }
    }
    
    // If any gems were shifted, continue checking with a shorter delay
    if (shifted) {
      setTimeout(() => this.shiftDown(), DEFAULT_SETTINGS.ANIMATION_DELAY / 2);
    } else {
      // No more shifts needed, fill empty spaces and check for new matches
      this.board.fillMap();
      // Use a shorter delay for better responsiveness
      setTimeout(() => this.findAndProcessNewMatches(), DEFAULT_SETTINGS.ANIMATION_DELAY / 2);
    }
  }
  
  /**
   * Finds and processes new matches after shifting
   */
  private findAndProcessNewMatches(): void {
    let newCluster: GemPosition[] = [];
    
    // Use a more efficient approach to check for matches
    // Only check positions that have gems above them (potential new matches)
    for (let j = 0; j < this.board.size; j++) {
      for (let k = 0; k < this.board.size; k++) {
        const gem = this.board.getGem(j, k);
        if (gem.state === GemState.ALIVE) {
          // Only check for matches if this gem was recently placed
          // (This optimization assumes newly placed gems are more likely to form matches)
          if (j === 0 || this.board.getGem(j-1, k).state === GemState.DEAD) {
            const matches = this.board.matchChain(j, k);
            if (matches.length > 0) {
              newCluster = newCluster.concat(matches);
            }
          }
        }
      }
    }
    
    // If new matches found, kill them with a shorter delay
    if (newCluster.length > 0) {
      this.kill(newCluster);
    } else {
      // No new matches, resume gameplay immediately
      this.pause = false;
    }
  }
}
