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
  DEAD: 'dead'
};

// Game States
export enum GemState {
  ALIVE = 'alive',
  DEAD = 'dead'
}

// Game Modes
export enum GameMode {
  CLUSTER = 'cluster',
  LINES = 'lines'
}

// Image Paths
export const IMAGES = {
  DIAGONAL: 'img/diagonal.png',
  NO_DIAGONAL: 'img/no-diagonal.png',
  CLUSTER: 'img/cluster.png',
  NO_CLUSTER: 'img/no-cluster.png',
  STARS: 'img/stars.png',
  GRASS: 'img/grass.png'
};

// Level Info HTML
export const LEVEL_INFO = {
  DIAGONAL: `<img src="${IMAGES.DIAGONAL}">`,
  NO_DIAGONAL: `<img src="${IMAGES.NO_DIAGONAL}">`,
  CLUSTER: `<img src="${IMAGES.CLUSTER}">`,
  NO_CLUSTER: `<img src="${IMAGES.NO_CLUSTER}">`
};

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
  ANIMATION_DELAY: 600, // milliseconds
  SWAP_DELAY: 500, // milliseconds
  KILL_DELAY: 300, // milliseconds
  LEVEL_START_DELAY: 1000, // milliseconds
  COUNTDOWN_INTERVAL: 1000, // milliseconds
  SCORE_MULTIPLIER: 36
};

// Gem Symbols
export const GEM_SYMBOLS = ['⚜', '☣', '♗', '♆', '♞', '♙', '☄', '❦', '♨', '♟'];

// Match Chain Actions
export enum MatchAction {
  CHECK = 'check'
}
