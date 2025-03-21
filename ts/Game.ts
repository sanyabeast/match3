import { Gem, GemPosition, LevelInfo, GameMode } from './types';
import { 
  ELEMENT_IDS, 
  CSS_CLASSES, 
  GemState, 
  LEVEL_INFO, 
  DATA_ATTRIBUTES, 
  DEFAULT_SETTINGS,
  GEM_SYMBOLS,
  MatchAction
} from './constants';

export class Game {
  private gems: Gem[][] = [];
  private cluster: GemPosition[] = [];
  private size: number = DEFAULT_SETTINGS.INITIAL_SIZE;
  private minLine: number = DEFAULT_SETTINGS.MIN_LINE;
  private colors: number = DEFAULT_SETTINGS.INITIAL_COLORS;
  private chosen: boolean = false;
  private diagonal: boolean = true;
  private field: HTMLElement;
  private pause: boolean = true;
  private linesOnly: boolean = false;
  private score: number = 0;
  private target: number = 0;
  private time: number = DEFAULT_SETTINGS.INITIAL_TIME;
  private scoreboard: HTMLElement;
  private level: number = 1;
  private levelInfo: LevelInfo;
  private chosenJ: number = -1;
  private chosenK: number = -1;
  private countdownInterval: number | null = null;

  constructor() {
    this.field = document.getElementById(ELEMENT_IDS.FIELD) as HTMLElement;
    this.scoreboard = document.getElementById(ELEMENT_IDS.SCOREBOARD) as HTMLElement;
    this.levelInfo = {
      diagonal: LEVEL_INFO.DIAGONAL,
      nodiagonal: LEVEL_INFO.NO_DIAGONAL,
      cluster: LEVEL_INFO.CLUSTER,
      nocluster: LEVEL_INFO.NO_CLUSTER
    };

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
        console.log(`Selected gem: ${j}x${k}, color: ${this.gems[j][k].color}, state: ${this.gems[j][k].state}`);
        this.gems[j][k].elem.classList.add(CSS_CLASSES.CHOSEN);
      } else {
        // Second gem selection (attempting to swap)
        this.chosen = false;
        
        // Remove highlight from first gem
        this.gems[this.chosenJ][this.chosenK].elem.classList.remove(CSS_CLASSES.CHOSEN);
        
        // Try to swap gems if it's a valid move
        if (this.isCorrectTurn(this.chosenJ, this.chosenK, j, k)) {
          // Swap the gems
          this.swap(this.chosenJ, this.chosenK, j, k);
          this.gems[this.chosenJ][this.chosenK].place();
          this.gems[j][k].place();
          
          // Check for matches
          this.cluster = this.matchChain(this.chosenJ, this.chosenK);
          this.cluster = this.cluster.concat(this.matchChain(j, k));
          
          if (this.cluster.length === 0) {
            // No matches found, swap back
            setTimeout(() => {
              this.swap(j, k, this.chosenJ, this.chosenK);
              this.gems[this.chosenJ][this.chosenK].place();
              this.gems[j][k].place();
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
    this.size = Math.floor(Math.random() * 5) + 12;
    
    // Increase color variety as levels progress (max 10)
    if (this.colors < 10) {
      this.colors++;
    }
    
    // Determine game mode features based on level
    this.determineGameModeForLevel(level);
    
    // Display level information
    this.displayLevelInfo(level);
    
    // Set time limit based on level
    this.time = DEFAULT_SETTINGS.INITIAL_TIME + Math.floor((level * 5) / 2);
    
    // Initialize the game board after a delay
    setTimeout(() => this.init(this.size, this.minLine, this.colors), DEFAULT_SETTINGS.LEVEL_START_DELAY);
    
    // Start the countdown timer
    this.startCountdownTimer();
  }
  
  /**
   * Determines game mode features (linesOnly, diagonal) based on level
   */
  private determineGameModeForLevel(level: number): void {
    // Level 2+ may disable cluster mode
    if (level >= 2) {
      this.linesOnly = Math.random() >= 0.5;
    }
    
    // Level 3+ may disable diagonal moves
    if (level >= 3) {
      this.diagonal = Math.random() >= 0.5;
    }
  }
  
  /**
   * Displays level information in the field element
   */
  private displayLevelInfo(level: number): void {
    this.field.innerHTML = `Level ${level}`;
    
    // Add cluster/no-cluster image
    this.field.innerHTML += this.linesOnly ? 
      this.levelInfo.nocluster : 
      this.levelInfo.cluster;
    
    // Add diagonal/no-diagonal image
    this.field.innerHTML += this.diagonal ? 
      this.levelInfo.diagonal : 
      this.levelInfo.nodiagonal;
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
    this.field.innerHTML = 'Game over';
    this.scoreboard.innerHTML = `${this.score}/${this.target} | <span> 0 </span>`;
  }
  
  /**
   * Handles level completion
   */
  private handleLevelComplete(): void {
    this.level++;
    this.score = 0;
    this.startLevel(this.level);
  }

  private init(size: number, minLine: number, colors: number): void {
    this.clearField();
    this.resetGame();
    this.createMap(size, colors);
    this.fillMap();
  }

  private clearField(): void {
    this.field.innerHTML = '';
  }

  private resetGame(): void {
    this.chosen = false;
  }

  private createMap(size: number, colors: number): void {
    // Validate that we can create a valid game map
    if (!this.isValidGameConfiguration(size, colors)) {
      this.displayInvalidConfigurationMessage(size, colors);
      return;
    }

    // Initialize the gems array
    this.initializeGemsArray(size);
    
    // Create gem elements and add them to the field
    this.createGemElements(size);
    
    // Set the size of gem elements
    this.setGemElementSizes(size);
  }
  
  /**
   * Checks if the game configuration is valid
   */
  private isValidGameConfiguration(size: number, colors: number): boolean {
    return size > 1 && 
           ((this.linesOnly && colors > 1) || (!this.linesOnly && colors > 1)) && 
           this.minLine > 1;
  }
  
  /**
   * Displays an error message when configuration is invalid
   */
  private displayInvalidConfigurationMessage(size: number, colors: number): void {
    this.field.innerHTML = `A field with the following parameters: size: ${size}, colors: ${colors}, min. line length: ${this.minLine}, cannot be generated.`;
  }
  
  /**
   * Initializes the gems array with the given size
   */
  private initializeGemsArray(size: number): void {
    this.gems = [];
    for (let i = 0; i < size; i++) {
      this.gems[i] = [];
      for (let j = 0; j < size; j++) {
        this.gems[i][j] = {} as Gem; // Temporary initialization
      }
    }
  }
  
  /**
   * Creates gem elements and adds them to the field
   */
  private createGemElements(size: number): void {
    for (let j = 0; j < size; j++) {
      for (let k = 0; k < size; k++) {
        const gemElement = document.createElement('div');
        gemElement.className = CSS_CLASSES.GEM;
        gemElement.setAttribute(DATA_ATTRIBUTES.J, j.toString());
        gemElement.setAttribute(DATA_ATTRIBUTES.K, k.toString());
        gemElement.setAttribute(DATA_ATTRIBUTES.COLOR, '');
        
        this.field.appendChild(gemElement);
        
        this.gems[j][k] = {
          elem: gemElement,
          state: GemState.DEAD,
          color: 0,
          kill: function(this: Gem): void {
            this.state = GemState.DEAD;
            this.elem.classList.add(CSS_CLASSES.DEAD);
            this.elem.style.left = Math.random() * DEFAULT_SETTINGS.FIELD_SIZE + 'px';
            this.elem.style.top = '250px';
          },
          place: function(this: Gem): void {
            const j = parseInt(this.elem.getAttribute(DATA_ATTRIBUTES.J) || '0', 10);
            const k = parseInt(this.elem.getAttribute(DATA_ATTRIBUTES.K) || '0', 10);
            this.elem.style.top = j * DEFAULT_SETTINGS.FIELD_SIZE / size + 'px';
            this.elem.style.left = k * DEFAULT_SETTINGS.FIELD_SIZE / size + 'px';
          }
        };
      }
    }
  }
  
  /**
   * Sets the size of gem elements based on the board size
   */
  private setGemElementSizes(size: number): void {
    const gemElements = document.querySelectorAll(`.${CSS_CLASSES.GEM}`);
    gemElements.forEach(gemElem => {
      const gem = gemElem as HTMLElement;
      gem.style.width = DEFAULT_SETTINGS.FIELD_SIZE / size - 1 + 'px';
      gem.style.height = DEFAULT_SETTINGS.FIELD_SIZE / size - 1 + 'px';
      gem.style.fontSize = DEFAULT_SETTINGS.FIELD_SIZE / (size * 2) + 'px';
    });
  }

  private fillMap(): void {
    this.pause = true;
    
    // Create new gems for each empty position
    for (let j = 0; j < this.size; j++) {
      for (let k = 0; k < this.size; k++) {
        if (this.gems[j][k].state === GemState.DEAD) {
          this.createNewGem(j, k);
        }
      }
    }
    
    // Animate all gems into place after a delay
    setTimeout(() => this.placeAll(), DEFAULT_SETTINGS.ANIMATION_DELAY);
    this.pause = false;
  }
  
  /**
   * Creates a new gem at the specified position
   */
  private createNewGem(j: number, k: number): void {
    // Set the gem to alive state
    this.gems[j][k].state = GemState.ALIVE;
    this.gems[j][k].elem.classList.remove(CSS_CLASSES.DEAD);
    
    // Find a valid color that doesn't create matches
    let randColor: number;
    do {
      randColor = Math.floor(Math.random() * this.colors);
      this.gems[j][k].color = randColor;
      this.cluster = this.matchChain(j, k, MatchAction.CHECK);
    } while (this.cluster.length !== 0);
    
    // Set visual properties
    this.gems[j][k].elem.setAttribute(DATA_ATTRIBUTES.COLOR, String(this.gems[j][k].color));
    this.gems[j][k].elem.style.left = k * DEFAULT_SETTINGS.FIELD_SIZE / this.size + 'px';
    this.gems[j][k].elem.style.top = -1 * ((this.size - j) * DEFAULT_SETTINGS.FIELD_SIZE / this.size) - 50 + 'px';
    
    // Set the gem symbol
    this.gems[j][k].elem.innerHTML = GEM_SYMBOLS[randColor];
  }

  private placeAll(): void {
    // Place all gems from bottom to top, right to left
    for (let i = this.size - 1; i >= 0; i--) {
      for (let j = this.size - 1; j >= 0; j--) {
        this.gems[i][j].place();
      }
    }
  }

  private kill(cluster: GemPosition[]): void {
    // Make a copy of the cluster to avoid modifying the original
    const matchedGems = [...cluster];
    this.cluster = [];
    
    if (matchedGems.length === 0) {
      // No matches, just fill the map
      setTimeout(() => this.fillMap(), DEFAULT_SETTINGS.ANIMATION_DELAY);
      this.pause = false;
      return;
    }
    
    // Calculate score based on the number of matched gems
    this.updateScoreForMatches(matchedGems.length);
    
    // Pause the game during animations
    this.pause = true;
    
    // Process the matched gems in sequence with appropriate delays
    this.processMatchedGems(matchedGems);
  }
  
  /**
   * Updates the score based on the number of matched gems
   */
  private updateScoreForMatches(matchCount: number): void {
    // Score increases quadratically with the number of matches
    this.score += matchCount * matchCount * DEFAULT_SETTINGS.SCORE_MULTIPLIER;
    console.log(this.score);
    this.updateScoreboard();
  }
  
  /**
   * Processes matched gems with appropriate animations and delays
   */
  private processMatchedGems(matchedGems: GemPosition[]): void {
    // First kill all matched gems
    setTimeout(() => {
      for (const pos of matchedGems) {
        this.gems[pos.j][pos.k].kill();
      }
    }, DEFAULT_SETTINGS.KILL_DELAY);
    
    // Then shift gems down to fill gaps
    setTimeout(() => {
      for (const pos of matchedGems) {
        this.shiftDown(pos.j, pos.k);
      }
    }, DEFAULT_SETTINGS.ANIMATION_DELAY);
    
    // Check for new matches after shifting
    setTimeout(() => {
      this.findAndProcessNewMatches();
    }, DEFAULT_SETTINGS.ANIMATION_DELAY);
  }
  
  /**
   * Finds and processes any new matches after gems have shifted
   */
  private findAndProcessNewMatches(): void {
    // Check the entire board for new matches
    for (let j = 0; j < this.size; j++) {
      for (let k = 0; k < this.size; k++) {
        this.cluster = this.cluster.concat(this.matchChain(j, k));
      }
    }
    
    // Process any new matches found
    this.kill(this.cluster);
  }

  private shiftDown(j: number, k: number): void {
    // For each column with a dead gem, shift all gems above it down
    for (let m = 0; m <= j; m++) {
      for (let l = j; l > 0; l--) {
        if (this.gems[l][k].state === GemState.DEAD) {
          this.swap(l, k, l - 1, k);
          this.gems[l - 1][k].place();
          this.gems[l][k].place();
        }
      }
    }
  }

  private swap(j: number, k: number, dj: number, dk: number): void {
    // Swap the gem objects
    const buffer = this.gems[j][k];
    this.gems[j][k] = this.gems[dj][dk];
    this.gems[dj][dk] = buffer;
    
    // Update data attributes to reflect new positions
    this.updateGemPosition(this.gems[dj][dk], dj, dk);
    this.updateGemPosition(this.gems[j][k], j, k);
  }
  
  /**
   * Updates a gem's position attributes
   */
  private updateGemPosition(gem: Gem, j: number, k: number): void {
    gem.elem.setAttribute(DATA_ATTRIBUTES.J, j.toString());
    gem.elem.setAttribute(DATA_ATTRIBUTES.K, k.toString());
  }

  private isCorrectTurn(j: number, k: number, dj: number, dk: number): boolean {
    // Check if the gems have the same color - if so, can't swap
    if (this.gems[j][k].color === this.gems[dj][dk].color) {
      return false;
    }
    
    // Check if the move is adjacent (orthogonal or diagonal if allowed)
    const isOrthogonal = 
      (j === dj && Math.abs(k - dk) === 1) || // Horizontal move
      (k === dk && Math.abs(j - dj) === 1);   // Vertical move
      
    const isDiagonal = this.diagonal && 
      Math.abs(j - dj) === 1 && 
      Math.abs(k - dk) === 1;
      
    return isOrthogonal || isDiagonal;
  }

  private matchChain(j: number, k: number, action?: string): GemPosition[] {
    // If the gem is already dead, no matches
    if (this.gems[j][k].state === GemState.DEAD) {
      return [];
    }
    
    const chain: GemPosition[] = [];
    const horiz: GemPosition[] = [];
    const vrtcl: GemPosition[] = [];
    
    // Mark the current gem as temporarily dead to avoid infinite recursion
    this.gems[j][k].state = GemState.DEAD;
    
    if (!this.linesOnly) {
      // Cluster mode - check in all directions
      chain.push({ j, k });
      
      // Directions to check: up, left, down, right
      const directions = [
        { dj: -1, dk: 0 }, // up
        { dj: 0, dk: -1 }, // left
        { dj: 1, dk: 0 },  // down
        { dj: 0, dk: 1 }   // right
      ];
      
      // Process each gem in the chain, potentially adding more as we go
      for (let i = 0; i < chain.length; i++) {
        const currentJ = chain[i].j;
        const currentK = chain[i].k;
        
        // Check all four directions
        for (const dir of directions) {
          const newJ = currentJ + dir.dj;
          const newK = currentK + dir.dk;
          
          // Check if the position is valid and the gem has the same color and is alive
          if (
            newJ >= 0 && newJ < this.size && 
            newK >= 0 && newK < this.size &&
            this.gems[newJ][newK].color === this.gems[currentJ][currentK].color && 
            this.gems[newJ][newK].state !== GemState.DEAD
          ) {
            chain.push({ j: newJ, k: newK });
            this.gems[newJ][newK].state = GemState.DEAD;
          }
        }
      }
    } else {
      // Lines only mode - check horizontal and vertical lines separately
      horiz.push({ j, k });
      vrtcl.push({ j, k });
      
      // Process horizontal matches
      for (let i = 0; i < horiz.length; i++) {
        const currentJ = horiz[i].j;
        const currentK = horiz[i].k;
        
        // Check left and right
        const horizontalDirs = [{ dk: -1 }, { dk: 1 }];
        
        for (const dir of horizontalDirs) {
          const newK = currentK + dir.dk;
          
          if (
            newK >= 0 && newK < this.size &&
            this.gems[currentJ][newK].color === this.gems[currentJ][currentK].color && 
            this.gems[currentJ][newK].state !== GemState.DEAD
          ) {
            horiz.push({ j: currentJ, k: newK });
            this.gems[currentJ][newK].state = GemState.DEAD;
          }
        }
      }
      
      // Process vertical matches
      for (let i = 0; i < vrtcl.length; i++) {
        const currentJ = vrtcl[i].j;
        const currentK = vrtcl[i].k;
        
        // Check up and down
        const verticalDirs = [{ dj: -1 }, { dj: 1 }];
        
        for (const dir of verticalDirs) {
          const newJ = currentJ + dir.dj;
          
          if (
            newJ >= 0 && newJ < this.size &&
            this.gems[newJ][currentK].color === this.gems[currentJ][currentK].color && 
            this.gems[newJ][currentK].state !== GemState.DEAD
          ) {
            vrtcl.push({ j: newJ, k: currentK });
            this.gems[newJ][currentK].state = GemState.DEAD;
          }
        }
      }
    }
    
    // Check if matches meet minimum line requirement
    const resetChainIfTooSmall = (chainArray: GemPosition[]): GemPosition[] => {
      if (chainArray.length < this.minLine) {
        // Reset all gems in this chain to alive
        for (const pos of chainArray) {
          this.gems[pos.j][pos.k].state = GemState.ALIVE;
        }
        return [];
      }
      return chainArray;
    };
    
    // Apply minimum line check to all chains
    const validChain = !this.linesOnly ? resetChainIfTooSmall(chain) : [];
    const validHoriz = resetChainIfTooSmall(horiz);
    const validVrtcl = resetChainIfTooSmall(vrtcl);
    
    // Combine results based on game mode
    const result = this.linesOnly ? 
      [...validHoriz, ...validVrtcl] : 
      validChain;
    
    // If this is just a check (not an actual match), reset all gems to alive
    if (action === MatchAction.CHECK) {
      for (const pos of result) {
        this.gems[pos.j][pos.k].state = GemState.ALIVE;
      }
    }
    
    return result;
  }
}
