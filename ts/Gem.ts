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
    this._elem.style.transition = 'top 0.3s cubic-bezier(0.215, 0.610, 0.355, 1.000), left 0.15s ease-in, transform 0.2s ease-out, opacity 0.15s ease-out';
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
   */
  kill(): void {
    // Mark the gem as dead
    this._state = GemState.DEAD;
    
    // Add the dead class to apply CSS styles
    this._elem.classList.add(CSS_CLASSES.DEAD);
    
    // Make sure transitions are reset
    this._elem.style.transition = 'none';
    this._elem.style.transform = 'none';
    this._elem.style.opacity = '1';
    
    // Force a reflow to ensure the reset is applied
    void this._elem.offsetWidth;
    
    // Set up the animation - make it faster (0.4s instead of 0.6s)
    this._elem.style.transition = 'transform 0.4s ease-in, opacity 0.4s ease-in';
    
    // Direct falling down animation
    this._elem.style.transform = 'translateY(100%) scale(0.8)';
    this._elem.style.opacity = '0';
  }

  /**
   * Places the gem at its correct position on the board
   */
  place(): void {
    const j = parseInt(this._elem.getAttribute(DATA_ATTRIBUTES.J) || '0', 10);
    const k = parseInt(this._elem.getAttribute(DATA_ATTRIBUTES.K) || '0', 10);
    
    // Use linear transition for smoother falling
    this._elem.style.transition = `top ${DEFAULT_SETTINGS.FALL_ANIMATION_DURATION/1000}s linear, left 0.15s linear, transform 0.15s ease-out, opacity 0.15s ease-out`;
    
    // Simplify the transform - no bounce effect for smoother animation
    this._elem.style.transform = 'scale(1)';
    this._elem.style.opacity = '1';
    
    // Position the gem
    this._elem.style.top = `${j * (100/this._boardSize)}%`;
    this._elem.style.left = `${k * (100/this._boardSize)}%`;
  }
}
