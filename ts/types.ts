import { GemState } from './constants';

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
