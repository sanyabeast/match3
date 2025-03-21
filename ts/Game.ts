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

  constructor() {
    this.field = document.getElementById(ELEMENT_IDS.FIELD) as HTMLElement;
    this.scoreboard = document.getElementById(ELEMENT_IDS.SCOREBOARD) as HTMLElement;

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
      } else {
        // Second gem selection (attempting to swap)
        this.chosen = false;
        
        // Remove highlight from first gem
        this.board.getGem(this.chosenJ, this.chosenK).elem.classList.remove(CSS_CLASSES.CHOSEN);
        
        // Try to swap gems if it's a valid move
        if (this.board.isCorrectTurn(this.chosenJ, this.chosenK, j, k)) {
          // Swap the gems
          this.board.swap(this.chosenJ, this.chosenK, j, k);
          this.board.getGem(this.chosenJ, this.chosenK).place();
          this.board.getGem(j, k).place();
          
          // Check for matches
          this.cluster = this.board.matchChain(this.chosenJ, this.chosenK);
          this.cluster = this.cluster.concat(this.board.matchChain(j, k));
          
          if (this.cluster.length === 0) {
            // No matches found, swap back
            setTimeout(() => {
              this.board.swap(j, k, this.chosenJ, this.chosenK);
              this.board.getGem(this.chosenJ, this.chosenK).place();
              this.board.getGem(j, k).place();
            }, DEFAULT_SETTINGS.SWAP_DELAY);
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
    
    // Process matched gems
    this.processMatchedGems(cluster);
  }
  
  /**
   * Updates score based on matched gems
   */
  private updateScoreForMatches(cluster: GemPosition[]): void {
    this.score += cluster.length * DEFAULT_SETTINGS.SCORE_MULTIPLIER;
    this.updateScoreboard();
  }
  
  /**
   * Processes matched gems (killing them and checking for new matches)
   */
  private processMatchedGems(cluster: GemPosition[]): void {
    // Kill all gems in the cluster
    for (const pos of cluster) {
      this.board.getGem(pos.j, pos.k).kill();
    }
    
    // After a delay, shift gems down and check for new matches
    setTimeout(() => this.shiftDown(), DEFAULT_SETTINGS.KILL_DELAY);
  }
  
  /**
   * Shifts gems down to fill empty spaces
   */
  private shiftDown(): void {
    let shifted = false;
    
    // Iterate through the board from bottom to top
    for (let j = this.board.size - 2; j >= 0; j--) {
      for (let k = 0; k < this.board.size; k++) {
        // If current gem is alive and the one below is dead, shift down
        if (
          this.board.getGem(j, k).state === GemState.ALIVE && 
          this.board.getGem(j + 1, k).state === GemState.DEAD
        ) {
          // Swap the gems
          this.board.swap(j, k, j + 1, k);
          shifted = true;
        }
      }
    }
    
    // If any gems were shifted, continue checking
    if (shifted) {
      setTimeout(() => this.shiftDown(), DEFAULT_SETTINGS.ANIMATION_DELAY);
    } else {
      // No more shifts needed, fill empty spaces and check for new matches
      this.board.fillMap();
      setTimeout(() => this.findAndProcessNewMatches(), DEFAULT_SETTINGS.ANIMATION_DELAY);
    }
  }
  
  /**
   * Finds and processes new matches after shifting
   */
  private findAndProcessNewMatches(): void {
    let newCluster: GemPosition[] = [];
    
    // Check each position for new matches
    for (let j = 0; j < this.board.size; j++) {
      for (let k = 0; k < this.board.size; k++) {
        if (this.board.getGem(j, k).state === GemState.ALIVE) {
          newCluster = newCluster.concat(this.board.matchChain(j, k));
        }
      }
    }
    
    // If new matches found, kill them
    if (newCluster.length > 0) {
      this.kill(newCluster);
    } else {
      // No new matches, resume gameplay
      this.pause = false;
    }
  }
}
