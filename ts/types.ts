import $ from 'jquery';

export interface GemPosition {
  j: number;
  k: number;
}

export interface Gem {
  elem: JQuery<HTMLElement>;
  state: 'alive' | 'dead';
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

export type GameMode = 'cluster' | 'lines';
