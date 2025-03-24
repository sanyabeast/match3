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
  INITIAL_SIZE: 12, // Fixed grid size to 10x10 for better gameplay
  MIN_LINE: 3,
  INITIAL_COLORS: 4,
  INITIAL_TIME: 180,
  FIELD_SIZE: 500, // pixels
  ANIMATION_DELAY: 150, // milliseconds - reduced from 200ms
  SWAP_DELAY: 150, // milliseconds - reduced from 200ms
  KILL_DELAY: 300, // milliseconds - reduced from 450ms
  LEVEL_START_DELAY: 500, // milliseconds
  COUNTDOWN_INTERVAL: 1000, // milliseconds
  SCORE_MULTIPLIER: 36,
  // Animation settings
  FALL_DELAY_PER_ROW: 15, // milliseconds delay per row - reduced from 30ms
  FALL_ANIMATION_DURATION: 250, // milliseconds - reduced from 400ms
  BOUNCE_DELAY: 100, // milliseconds - reduced from 150ms (though no longer used)
  // Target score calculation constants
  TARGET_SCORE_BASE: 10000,
  TARGET_SCORE_FACTOR: Math.sqrt, // Function to apply to level number
  // Time settings
  TIME_INCREASE_PER_LEVEL: 2.5 // Additional seconds per level (level * 5 / 2)
};

// Gem Symbols
export const GEM_SYMBOLS = ['⚜', '☄', '♗', '♆', '♙', '❦', '☣', '♞', '♨', '♟'];

// Match Chain Actions
export enum MatchAction {
  CHECK = 'check'
}
