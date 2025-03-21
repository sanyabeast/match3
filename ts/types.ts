import { GemState, GameMode as GameModeEnum } from './constants';

export interface GemPosition {
  j: number;
  k: number;
}

export interface Gem {
  elem: HTMLElement;
  state: GemState;
  color: number;
  kill: () => void;
  place: () => void;
}

export interface LevelInfo {
  diagonal: string;
  nodiagonal: string;
  cluster: string;
  nocluster: string;
}

export type GameMode = GameModeEnum;
