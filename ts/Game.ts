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

    // Initialize the board with default settings - always use 10x10 grid
    this.board = new Board(
      this.field, 
      DEFAULT_SETTINGS.INITIAL_SIZE, 
      DEFAULT_SETTINGS.MIN_LINE, 
      DEFAULT_SETTINGS.INITIAL_COLORS
    );

    this.initEventListeners();
    this.setupAudioContext();
    this.startLevel(this.level);
  }

  private initEventListeners(): void {
    // Variables to track drag operations
    let isDragging = false;
    let startGem: HTMLElement | null = null;
    let startJ = -1;
    let startK = -1;
    let dragThreshold = 10; // Minimum pixels to consider a drag
    let startX = 0;
    let startY = 0;
    
    // Handle touch start and mouse down
    const handleStart = (event: MouseEvent | TouchEvent) => {
      // Game must not be paused
      if (this.pause) return;
      
      // Get the target element
      const target = (event.target as HTMLElement);
      
      // Only process events on gem elements
      if (!target.classList.contains(CSS_CLASSES.GEM)) return;
      
      // Get the starting coordinates
      if (event instanceof MouseEvent) {
        startX = event.clientX;
        startY = event.clientY;
      } else {
        // Touch event
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
      }
      
      // Record the starting gem
      startGem = target;
      startJ = parseInt(target.getAttribute(DATA_ATTRIBUTES.J) || '0', 10);
      startK = parseInt(target.getAttribute(DATA_ATTRIBUTES.K) || '0', 10);
      
      // Add visual feedback
      this.board.getGem(startJ, startK).elem.classList.add(CSS_CLASSES.CHOSEN);
      this.soundManager.play(SoundManager.SOUND_EFFECTS.TURN);
      
      // Start dragging
      isDragging = true;
    };
    
    // Handle touch move and mouse move
    const handleMove = (event: MouseEvent | TouchEvent) => {
      // Only process if we're dragging
      if (!isDragging || !startGem) return;
      
      // Prevent default behavior (scrolling, etc.)
      event.preventDefault();
      
      // Get current coordinates
      let currentX: number, currentY: number;
      
      if (event instanceof MouseEvent) {
        currentX = event.clientX;
        currentY = event.clientY;
      } else {
        // Touch event
        currentX = event.touches[0].clientX;
        currentY = event.touches[0].clientY;
      }
      
      // Calculate the distance moved
      const deltaX = currentX - startX;
      const deltaY = currentY - startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Add dragging class for visual feedback
      if (distance > dragThreshold / 2) {
        startGem.classList.add(CSS_CLASSES.DRAGGING);
      }
      
      // If we've moved enough to consider it a drag
      if (distance > dragThreshold) {
        // Determine the predominant direction (horizontal or vertical)
        const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
        
        // Calculate the target position based on direction
        let targetJ = startJ;
        let targetK = startK;
        
        if (isHorizontal) {
          // Horizontal movement
          targetK = startK + (deltaX > 0 ? 1 : -1);
        } else {
          // Vertical movement
          targetJ = startJ + (deltaY > 0 ? 1 : -1);
        }
        
        // Check if the target position is valid
        if (
          targetJ >= 0 && targetJ < this.board.size &&
          targetK >= 0 && targetK < this.board.size &&
          this.board.isCorrectTurn(startJ, startK, targetJ, targetK)
        ) {
          // End the drag operation
          isDragging = false;
          
          // Remove visual feedback classes
          startGem.classList.remove(CSS_CLASSES.DRAGGING);
          this.board.getGem(startJ, startK).elem.classList.remove(CSS_CLASSES.CHOSEN);
          
          // Temporarily disable further interactions
          this.pause = true;
          
          // Swap the gems
          this.board.swap(startJ, startK, targetJ, targetK);
          
          // Place gems immediately for visual feedback
          this.board.getGem(startJ, startK).place();
          this.board.getGem(targetJ, targetK).place();
          this.soundManager.play(SoundManager.SOUND_EFFECTS.SWAP);
          
          // Check for matches
          this.cluster = this.board.matchChain(startJ, startK);
          this.cluster = this.cluster.concat(this.board.matchChain(targetJ, targetK));
          
          if (this.cluster.length === 0) {
            // No matches found, swap back with shorter delay
            setTimeout(() => {
              this.board.swap(targetJ, targetK, startJ, startK);
              this.board.getGem(startJ, startK).place();
              this.board.getGem(targetJ, targetK).place();
              // Re-enable interactions
              this.pause = false;
            }, DEFAULT_SETTINGS.SWAP_DELAY / 2);
          } else {
            // Matches found, remove them
            this.kill(this.cluster);
          }
        }
      }
    };
    
    // Handle touch end and mouse up
    const handleEnd = () => {
      // Only process if we were dragging
      if (!isDragging || !startGem) return;
      
      // End the drag operation
      isDragging = false;
      
      // Remove visual feedback classes
      startGem.classList.remove(CSS_CLASSES.DRAGGING);
      
      // Remove highlight if we didn't complete a swap
      if (this.board.getGem(startJ, startK).elem.classList.contains(CSS_CLASSES.CHOSEN)) {
        this.board.getGem(startJ, startK).elem.classList.remove(CSS_CLASSES.CHOSEN);
      }
      
      // Reset starting values
      startGem = null;
      startJ = -1;
      startK = -1;
    };
    
    // Add event listeners for mouse interactions
    this.field.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    
    // Add event listeners for touch interactions
    this.field.addEventListener('touchstart', handleStart, { passive: false });
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
    
    // Keep the original click handler for backward compatibility
    // but with modified behavior to work with the new drag system
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

  /**
   * Sets up audio context after user interaction
   */
  private setupAudioContext(): void {
    // Add a one-time event listener to enable audio after first user interaction
    const enableAudio = () => {
      // Notify sound manager that user interaction has occurred
      this.soundManager.userInteractionOccurred();
      
      // Remove event listeners after first interaction
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('touchstart', enableAudio);
      document.removeEventListener('keydown', enableAudio);
    };
    
    // Add event listeners for common user interactions
    document.addEventListener('click', enableAudio);
    document.addEventListener('touchstart', enableAudio);
    document.addEventListener('keydown', enableAudio);
  }

  public startLevel(level: number): void {
    // Skip if board is not initialized
    if (!this.board) return;
    
    // Calculate target score based on level using constants
    this.target = Math.floor(DEFAULT_SETTINGS.TARGET_SCORE_FACTOR(level) * DEFAULT_SETTINGS.TARGET_SCORE_BASE);
    
    // Always use 10x10 grid
    const size = DEFAULT_SETTINGS.INITIAL_SIZE;
    
    // Increase color variety as levels progress (max 10)
    const colors = Math.min(DEFAULT_SETTINGS.INITIAL_COLORS + level - 1, 10);
    
    // Determine game mode features based on level
    this.determineGameModeForLevel(level);
    
    // Display level information
    this.displayLevelInfo(level);
    
    // Set time limit based on level using constants
    this.time = DEFAULT_SETTINGS.INITIAL_TIME + Math.floor(level * DEFAULT_SETTINGS.TIME_INCREASE_PER_LEVEL);
    
    // Try to play background music (will only work after user interaction)
    this.soundManager.playBackgroundMusic();
    
    // Initialize the game board after a delay
    setTimeout(() => {
      // Create a new board with the fixed 10x10 size and settings
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
    this.soundManager.pauseBackgroundMusic();
    
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
    
    // Check the entire board for matches
    for (let j = 0; j < this.board.size; j++) {
      for (let k = 0; k < this.board.size; k++) {
        const gem = this.board.getGem(j, k);
        if (gem.state === GemState.ALIVE) {
          const matches = this.board.matchChain(j, k);
          if (matches.length > 0) {
            // Add unique matches to the cluster
            for (const match of matches) {
              // Check if this position is already in the cluster
              const isDuplicate = newCluster.some(
                pos => pos.j === match.j && pos.k === match.k
              );
              
              if (!isDuplicate) {
                newCluster.push(match);
              }
            }
          }
        }
      }
    }
    
    // If new matches found, kill them and continue the cascade
    if (newCluster.length > 0) {
      console.log(`Found ${newCluster.length} new matches in cascade`);
      // Process these matches, which will trigger another round of
      // shiftDown and findAndProcessNewMatches when complete
      this.kill(newCluster);
    } else {
      // No new matches, resume gameplay
      this.pause = false;
    }
  }
}
