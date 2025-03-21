/**
 * Game Constants
 */

// Element IDs
export const ELEMENT_IDS = {
  FIELD: 'field',
  SCOREBOARD: 'scoreboard',
  LEVELINFO: 'levelinfo',
  WRAPPER: 'wrapper',
  RESTART: 'restart'
};

// CSS Classes
export const CSS_CLASSES = {
  GEM: 'gem',
  CHOSEN: 'chosen',
  DEAD: 'dead',
  DRAGGING: 'dragging',
  DRAG_TARGET: 'drag-target'
};

// Game States
export enum GemState {
  ALIVE = 'alive',
  DEAD = 'dead'
}

// Data Attributes
export const DATA_ATTRIBUTES = {
  J: 'data-j',
  K: 'data-k',
  COLOR: 'data-color'
};

// Game Settings
export const DEFAULT_SETTINGS = {
  INITIAL_SIZE: 18,
  MIN_LINE: 3,
  INITIAL_COLORS: 6,
  INITIAL_TIME: 60,
  FIELD_SIZE: 500, // pixels
  ANIMATION_DELAY: 200, // milliseconds
  SWAP_DELAY: 200, // milliseconds
  KILL_DELAY: 450, // milliseconds - adjusted to match faster animation
  LEVEL_START_DELAY: 500, // milliseconds
  COUNTDOWN_INTERVAL: 1000, // milliseconds
  SCORE_MULTIPLIER: 36
};

// Gem Symbols
export const GEM_SYMBOLS = ['⚜', '☣', '♗', '♆', '♞', '♙', '☄', '❦', '♨', '♟'];

// Match Chain Actions
export enum MatchAction {
  CHECK = 'check'
}
