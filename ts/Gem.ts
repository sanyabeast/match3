import { CSS_CLASSES, DATA_ATTRIBUTES, DEFAULT_SETTINGS, GemState } from './constants';

/**
 * Represents a gem in the Match3 game
 */
export class Gem {
  private _elem: HTMLElement;
  private _state: GemState;
  private _color: number;
  private _boardSize: number;

  constructor(element: HTMLElement, boardSize: number) {
    this._elem = element;
    this._state = GemState.DEAD;
    this._color = 0;
    this._boardSize = boardSize;
    
    // Add CSS transition for smoother animations
    this._elem.style.transition = 'top 0.15s ease-in, left 0.15s ease-in, transform 0.15s ease-out, opacity 0.15s ease-out';
  }

  /**
   * Gets the HTML element representing the gem
   */
  get elem(): HTMLElement {
    return this._elem;
  }

  /**
   * Gets the current state of the gem
   */
  get state(): GemState {
    return this._state;
  }

  /**
   * Sets the current state of the gem
   */
  set state(value: GemState) {
    this._state = value;
  }

  /**
   * Gets the color of the gem
   */
  get color(): number {
    return this._color;
  }

  /**
   * Sets the color of the gem
   */
  set color(value: number) {
    this._color = value;
    this._elem.innerHTML = value >= 0 ? `${value}` : '';
  }

  /**
   * Updates the board size reference
   */
  updateBoardSize(size: number): void {
    this._boardSize = size;
  }

  /**
   * Kills the gem (marks it as dead and animates it off the board)
   * The DOM element will be removed by the Board class after animation
   */
  kill(): void {
    this._state = GemState.DEAD;
    this._elem.classList.add(CSS_CLASSES.DEAD);
    
    // Create a more dramatic exit animation
    // Random direction and scale down
    const randomX = Math.random() * 100 - 50; // -50 to 50px
    const randomY = Math.random() * 50 + 100; // 100 to 150px down
    
    // Use transform for better performance
    this._elem.style.transform = `translate(${randomX}px, ${randomY}px) scale(0.1) rotate(${Math.random() * 360}deg)`;
    this._elem.style.opacity = '0';
  }

  /**
   * Places the gem at its correct position on the board
   */
  place(): void {
    const j = parseInt(this._elem.getAttribute(DATA_ATTRIBUTES.J) || '0', 10);
    const k = parseInt(this._elem.getAttribute(DATA_ATTRIBUTES.K) || '0', 10);
    
    // Reset transform and opacity
    this._elem.style.transform = '';
    this._elem.style.opacity = '1';
    
    // Position the gem
    this._elem.style.top = j * DEFAULT_SETTINGS.FIELD_SIZE / this._boardSize + 'px';
    this._elem.style.left = k * DEFAULT_SETTINGS.FIELD_SIZE / this._boardSize + 'px';
  }
}
