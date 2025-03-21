import { CSS_CLASSES, DATA_ATTRIBUTES, DEFAULT_SETTINGS, GemState, GEM_SYMBOLS } from './constants';
import { Gem } from './Gem';
import { GemPosition } from './types';

/**
 * Represents the game board in the Match3 game
 */
export class Board {
  private _gems: Gem[][] = [];
  private _size: number;
  private _element: HTMLElement;
  private _minLine: number;
  private _colors: number;

  constructor(element: HTMLElement, size: number, minLine: number, colors: number) {
    this._element = element;
    this._size = size;
    this._minLine = minLine;
    this._colors = colors;
    
    this.createMap(size, minLine, colors);
  }

  /**
   * Gets the size of the board
   */
  get size(): number {
    return this._size;
  }

  /**
   * Gets the minimum line length for matches
   */
  get minLine(): number {
    return this._minLine;
  }

  /**
   * Gets the number of colors used in the board
   */
  get colors(): number {
    return this._colors;
  }

  /**
   * Gets a gem at the specified position
   */
  getGem(j: number, k: number): Gem {
    return this._gems[j][k];
  }

  /**
   * Creates the game board with the specified parameters
   */
  createMap(size: number, minLine: number, colors: number): boolean {
    // Validate game configuration
    if (!this.isValidGameConfiguration(size, colors)) {
      this.displayInvalidConfigurationMessage(size, colors);
      return false;
    }
    
    // Clear the field
    this.clearField();
    
    // Initialize gems array
    this.initializeGemsArray(size);
    
    // Create gem elements
    this.createGemElements();
    
    // Set gem sizes
    this.setGemElementSizes();
    
    // Fill the board with gems
    this.fillMap();
    
    return true;
  }

  /**
   * Checks if the game configuration is valid
   */
  private isValidGameConfiguration(size: number, colors: number): boolean {
    return size > 1 && colors > 1 && this._minLine > 1;
  }

  /**
   * Displays an error message when configuration is invalid
   */
  private displayInvalidConfigurationMessage(size: number, colors: number): void {
    this._element.innerHTML = `A field with the following parameters: size: ${size}, colors: ${colors}, min. line length: ${this._minLine}, cannot be generated.`;
  }

  /**
   * Clears the field element
   */
  private clearField(): void {
    this._element.innerHTML = '';
  }

  /**
   * Initializes the gems array with the given size
   */
  private initializeGemsArray(size: number): void {
    this._gems = [];
    for (let i = 0; i < size; i++) {
      this._gems[i] = [];
    }
  }

  /**
   * Creates gem elements and adds them to the board
   */
  private createGemElements(): void {
    for (let j = 0; j < this._size; j++) {
      for (let k = 0; k < this._size; k++) {
        const gemElement = document.createElement('div');
        gemElement.className = CSS_CLASSES.GEM;
        gemElement.setAttribute(DATA_ATTRIBUTES.J, j.toString());
        gemElement.setAttribute(DATA_ATTRIBUTES.K, k.toString());
        gemElement.setAttribute(DATA_ATTRIBUTES.COLOR, '');
        
        this._element.appendChild(gemElement);
        
        this._gems[j][k] = new Gem(gemElement, this._size);
      }
    }
  }

  /**
   * Sets the size of gem elements
   */
  private setGemElementSizes(): void {
    const gemElements = document.querySelectorAll(`.${CSS_CLASSES.GEM}`);
    gemElements.forEach(gemElem => {
      const gem = gemElem as HTMLElement;
      gem.style.width = DEFAULT_SETTINGS.FIELD_SIZE / this._size - 1 + 'px';
      gem.style.height = DEFAULT_SETTINGS.FIELD_SIZE / this._size - 1 + 'px';
      gem.style.fontSize = DEFAULT_SETTINGS.FIELD_SIZE / (this._size * 2) + 'px';
    });
  }

  /**
   * Fills the board with gems
   */
  fillMap(): void {
    // Create new gems for each empty position
    for (let j = 0; j < this._size; j++) {
      for (let k = 0; k < this._size; k++) {
        if (this._gems[j][k].state === GemState.DEAD) {
          this.createNewGem(j, k);
        }
      }
    }
    
    // Animate all gems into place
    this.placeAll();
  }

  /**
   * Creates a new gem at the specified position
   */
  private createNewGem(j: number, k: number): void {
    // Set the gem to alive state
    this._gems[j][k].state = GemState.ALIVE;
    this._gems[j][k].elem.classList.remove(CSS_CLASSES.DEAD);
    
    // Find a valid color that doesn't create matches
    let color;
    do {
      color = Math.floor(Math.random() * this._colors);
    } while (this.willCreateMatch(j, k, color));
    
    // Set the gem color
    this._gems[j][k].color = color;
    this._gems[j][k].elem.setAttribute(DATA_ATTRIBUTES.COLOR, String(color));
    this._gems[j][k].elem.innerHTML = GEM_SYMBOLS[color];
  }

  /**
   * Checks if placing a gem with the given color at the specified position will create a match
   */
  private willCreateMatch(j: number, k: number, color: number): boolean {
    // Check horizontal matches
    let count = 1;
    let l = k - 1;
    while (l >= 0 && this._gems[j][l].state === GemState.ALIVE && this._gems[j][l].color === color) {
      count++;
      l--;
    }
    l = k + 1;
    while (l < this._size && this._gems[j][l].state === GemState.ALIVE && this._gems[j][l].color === color) {
      count++;
      l++;
    }
    if (count >= this._minLine) return true;
    
    // Check vertical matches
    count = 1;
    l = j - 1;
    while (l >= 0 && this._gems[l][k].state === GemState.ALIVE && this._gems[l][k].color === color) {
      count++;
      l--;
    }
    l = j + 1;
    while (l < this._size && this._gems[l][k].state === GemState.ALIVE && this._gems[l][k].color === color) {
      count++;
      l++;
    }
    if (count >= this._minLine) return true;
    
    return false;
  }

  /**
   * Places all gems on the board
   */
  placeAll(): void {
    for (let j = 0; j < this._size; j++) {
      for (let k = 0; k < this._size; k++) {
        this._gems[j][k].place();
      }
    }
  }

  /**
   * Swaps two gems on the board
   */
  swap(j1: number, k1: number, j2: number, k2: number): void {
    // Update gem positions in the DOM
    this._gems[j1][k1].elem.setAttribute(DATA_ATTRIBUTES.J, j2.toString());
    this._gems[j1][k1].elem.setAttribute(DATA_ATTRIBUTES.K, k2.toString());
    this._gems[j2][k2].elem.setAttribute(DATA_ATTRIBUTES.J, j1.toString());
    this._gems[j2][k2].elem.setAttribute(DATA_ATTRIBUTES.K, k1.toString());
    
    // Swap gems in the array
    const temp = this._gems[j1][k1];
    this._gems[j1][k1] = this._gems[j2][k2];
    this._gems[j2][k2] = temp;
  }

  /**
   * Checks if a move between two positions is valid
   */
  isCorrectTurn(j1: number, k1: number, j2: number, k2: number): boolean {
    // Check if both gems are alive
    if (this._gems[j1][k1].state !== GemState.ALIVE || this._gems[j2][k2].state !== GemState.ALIVE) {
      return false;
    }
    
    // Check if positions are adjacent
    const rowDiff = Math.abs(j1 - j2);
    const colDiff = Math.abs(k1 - k2);
    
    // Orthogonal move (horizontal or vertical)
    if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
      return true;
    }
    
    return false;
  }

  /**
   * Finds matches starting from the specified position
   */
  matchChain(j: number, k: number): GemPosition[] {
    // Return empty array if the gem is dead
    if (this._gems[j][k].state !== GemState.ALIVE) {
      return [];
    }
    
    const color = this._gems[j][k].color;
    let chain: GemPosition[] = [];
    
    // Define directions to check (horizontal and vertical)
    const directions = [
      { dj: 0, dk: 1 },  // right
      { dj: 1, dk: 0 },  // down
    ];
    
    // Check each direction for matches
    for (const dir of directions) {
      let currentChain: GemPosition[] = [{ j, k }];
      
      // Check in positive direction
      this.checkDirection(j, k, dir.dj, dir.dk, color, currentChain);
      
      // Check in negative direction
      this.checkDirection(j, k, -dir.dj, -dir.dk, color, currentChain);
      
      // If we found a valid chain, add it to our results
      if (currentChain.length >= this._minLine) {
        chain = chain.concat(currentChain);
      }
    }
    
    // Remove duplicates from the chain
    return this.removeDuplicates(chain);
  }

  /**
   * Checks for matches in a specific direction
   */
  private checkDirection(j: number, k: number, dj: number, dk: number, color: number, chain: GemPosition[]): void {
    let currentJ = j + dj;
    let currentK = k + dk;
    
    while (
      currentJ >= 0 && currentJ < this._size &&
      currentK >= 0 && currentK < this._size &&
      this._gems[currentJ][currentK].state === GemState.ALIVE &&
      this._gems[currentJ][currentK].color === color
    ) {
      chain.push({ j: currentJ, k: currentK });
      currentJ += dj;
      currentK += dk;
    }
  }

  /**
   * Removes duplicate positions from a chain
   */
  private removeDuplicates(chain: GemPosition[]): GemPosition[] {
    const uniquePositions: GemPosition[] = [];
    const seen = new Set<string>();
    
    for (const pos of chain) {
      const key = `${pos.j},${pos.k}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniquePositions.push(pos);
      }
    }
    
    return uniquePositions;
  }
}
