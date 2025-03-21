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
    this._state = GemState.DEAD;
    this._elem.classList.add(CSS_CLASSES.DEAD);
    this._elem.style.left = Math.random() * DEFAULT_SETTINGS.FIELD_SIZE + 'px';
    this._elem.style.top = '250px';
  }

  /**
   * Places the gem at its correct position on the board
   */
  place(): void {
    const j = parseInt(this._elem.getAttribute(DATA_ATTRIBUTES.J) || '0', 10);
    const k = parseInt(this._elem.getAttribute(DATA_ATTRIBUTES.K) || '0', 10);
    this._elem.style.top = j * DEFAULT_SETTINGS.FIELD_SIZE / this._boardSize + 'px';
    this._elem.style.left = k * DEFAULT_SETTINGS.FIELD_SIZE / this._boardSize + 'px';
  }
}
