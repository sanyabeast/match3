import { Gem, GemPosition, LevelInfo, GameMode } from './types';
import { 
  ELEMENT_IDS, 
  CSS_CLASSES, 
  GemState, 
  LEVEL_INFO, 
  DATA_ATTRIBUTES, 
  DEFAULT_SETTINGS,
  GEM_SYMBOLS,
  MatchAction
} from './constants';

export class Game {
  private gems: Gem[][] = [];
  private cluster: GemPosition[] = [];
  private size: number = DEFAULT_SETTINGS.INITIAL_SIZE;
  private minLine: number = DEFAULT_SETTINGS.MIN_LINE;
  private colors: number = DEFAULT_SETTINGS.INITIAL_COLORS;
  private chosen: boolean = false;
  private diagonal: boolean = true;
  private field: HTMLElement;
  private pause: boolean = true;
  private linesOnly: boolean = false;
  private score: number = 0;
  private target: number = 0;
  private time: number = DEFAULT_SETTINGS.INITIAL_TIME;
  private scoreboard: HTMLElement;
  private level: number = 1;
  private levelInfo: LevelInfo;
  private chosenJ: number = -1;
  private chosenK: number = -1;
  private countdownInterval: number | null = null;

  constructor() {
    this.field = document.getElementById(ELEMENT_IDS.FIELD) as HTMLElement;
    this.scoreboard = document.getElementById(ELEMENT_IDS.SCOREBOARD) as HTMLElement;
    this.levelInfo = {
      diagonal: LEVEL_INFO.DIAGONAL,
      nodiagonal: LEVEL_INFO.NO_DIAGONAL,
      cluster: LEVEL_INFO.CLUSTER,
      nocluster: LEVEL_INFO.NO_CLUSTER
    };

    this.initEventListeners();
    this.startLevel(this.level);
  }

  private initEventListeners(): void {
    this.field.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      if (!target.classList.contains(CSS_CLASSES.GEM)) return;
      
      if (!this.chosen && !this.pause) {
        this.chosen = true;
        this.chosenJ = parseInt(target.getAttribute(DATA_ATTRIBUTES.J) || '0', 10);
        this.chosenK = parseInt(target.getAttribute(DATA_ATTRIBUTES.K) || '0', 10);
        console.log(`${this.chosenJ}x${this.chosenK}, ${this.gems[this.chosenJ][this.chosenK].color}, ${this.gems[this.chosenJ][this.chosenK].state}`);
        this.gems[this.chosenJ][this.chosenK].elem.classList.add(CSS_CLASSES.CHOSEN);
      } else if (!this.pause) {
        this.chosen = false;
        const dj = parseInt(target.getAttribute(DATA_ATTRIBUTES.J) || '0', 10);
        const dk = parseInt(target.getAttribute(DATA_ATTRIBUTES.K) || '0', 10);
        
        if (this.isCorrectTurn(this.chosenJ, this.chosenK, dj, dk)) {
          this.gems[this.chosenJ][this.chosenK].elem.classList.remove(CSS_CLASSES.CHOSEN);
          this.swap(this.chosenJ, this.chosenK, dj, dk);
          this.gems[this.chosenJ][this.chosenK].place();
          this.gems[dj][dk].place();
          
          this.cluster = this.matchChain(this.chosenJ, this.chosenK);
          this.cluster = this.cluster.concat(this.matchChain(dj, dk));
          
          if (this.cluster.length === 0) {
            setTimeout(() => {
              this.swap(dj, dk, this.chosenJ, this.chosenK);
              this.gems[this.chosenJ][this.chosenK].place();
              this.gems[dj][dk].place();
            }, DEFAULT_SETTINGS.SWAP_DELAY);
          } else {
            this.kill(this.cluster);
          }
        } else {
          this.gems[this.chosenJ][this.chosenK].elem.classList.remove(CSS_CLASSES.CHOSEN);
        }
      }
    });
  }

  public startLevel(level: number): void {
    this.target = Math.floor(Math.sqrt(level) * 5000);
    this.size = Math.floor(Math.random() * 5) + 12;
    
    if (this.colors !== 10) {
      this.colors++;
    }
    
    if (level >= 2) {
      const r = Math.random() * 2;
      this.linesOnly = r !== 1;
    }
    
    if (level >= 3) {
      const r = Math.random() * 2;
      this.diagonal = r === 1;
    }
    
    this.field.innerHTML = `Level ${level}`;
    
    if (this.linesOnly) {
      this.field.innerHTML += this.levelInfo.nocluster;
    } else {
      this.field.innerHTML += this.levelInfo.cluster;
    }
    
    if (this.diagonal) {
      this.field.innerHTML += this.levelInfo.diagonal;
    } else {
      this.field.innerHTML += this.levelInfo.nodiagonal;
    }
    
    this.time = DEFAULT_SETTINGS.INITIAL_TIME + Math.floor((level * 5) / 2);
    
    setTimeout(() => this.init(this.size, this.minLine, this.colors), DEFAULT_SETTINGS.LEVEL_START_DELAY);
    
    // Start countdown
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    
    this.countdownInterval = window.setInterval(() => {
      if (this.time === 0 && this.score < this.target) {
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
        }
        this.field.innerHTML = 'Game over';
        this.scoreboard.innerHTML = `${this.score}/${this.target} | <span> 0 </span>`;
      } else if (this.time === 0 && this.score >= this.target) {
        this.level++;
        this.score = 0;
        this.startLevel(this.level);
      } else {
        this.time -= 1;
        this.scoreboard.innerHTML = `${this.score}/${this.target} | ${this.time}`;
      }
    }, DEFAULT_SETTINGS.COUNTDOWN_INTERVAL);
  }

  private init(size: number, minLine: number, colors: number): void {
    this.field.innerHTML = '';
    this.chosen = false;
    this.createMap(size, colors);
    this.fillMap();
  }

  private createMap(size: number, colors: number): void {
    if (size > 1 && ((this.linesOnly && colors > 1) || (!this.linesOnly && colors > 1)) && this.minLine > 1) {
      // Initialize the gems array
      this.gems = [];
      for (let i = 0; i < size; i++) {
        this.gems[i] = [];
        for (let j = 0; j < size; j++) {
          this.gems[i][j] = {} as Gem; // Temporary initialization
        }
      }

      // Create gem elements
      for (let j = 0; j < size; j++) {
        for (let k = 0; k < size; k++) {
          const gemElement = document.createElement('div');
          gemElement.className = CSS_CLASSES.GEM;
          gemElement.setAttribute(DATA_ATTRIBUTES.J, j.toString());
          gemElement.setAttribute(DATA_ATTRIBUTES.K, k.toString());
          gemElement.setAttribute(DATA_ATTRIBUTES.COLOR, '');
          
          this.field.appendChild(gemElement);
          
          this.gems[j][k] = {
            elem: gemElement,
            state: GemState.DEAD,
            color: 0,
            kill: function(this: Gem): void {
              this.state = GemState.DEAD;
              this.elem.classList.add(CSS_CLASSES.DEAD);
              this.elem.style.left = Math.random() * DEFAULT_SETTINGS.FIELD_SIZE + 'px';
              this.elem.style.top = '250px';
            },
            place: function(this: Gem): void {
              const j = parseInt(this.elem.getAttribute(DATA_ATTRIBUTES.J) || '0', 10);
              const k = parseInt(this.elem.getAttribute(DATA_ATTRIBUTES.K) || '0', 10);
              this.elem.style.top = j * DEFAULT_SETTINGS.FIELD_SIZE / size + 'px';
              this.elem.style.left = k * DEFAULT_SETTINGS.FIELD_SIZE / size + 'px';
            }
          };
        }
      }

      const gemElements = document.querySelectorAll(`.${CSS_CLASSES.GEM}`);
      gemElements.forEach(gemElem => {
        const gem = gemElem as HTMLElement;
        gem.style.width = DEFAULT_SETTINGS.FIELD_SIZE / size - 1 + 'px';
        gem.style.height = DEFAULT_SETTINGS.FIELD_SIZE / size - 1 + 'px';
        gem.style.fontSize = DEFAULT_SETTINGS.FIELD_SIZE / (size * 2) + 'px';
      });
    } else {
      this.field.innerHTML = `A field with the following parameters: size: ${size}, colors: ${colors}, min. line length: ${this.minLine}, cannot be generated.`;
    }
  }

  private fillMap(): void {
    this.pause = true;
    
    for (let j = 0; j < this.size; j++) {
      for (let k = 0; k < this.size; k++) {
        if (this.gems[j][k].state === GemState.DEAD) {
          this.gems[j][k].state = GemState.ALIVE;
          this.gems[j][k].elem.classList.remove(CSS_CLASSES.DEAD);
          
          let randColor: number;
          do {
            randColor = Math.floor(Math.random() * this.colors);
            this.gems[j][k].color = randColor;
            this.cluster = this.matchChain(j, k, MatchAction.CHECK);
          } while (this.cluster.length !== 0);
          
          this.gems[j][k].elem.setAttribute(DATA_ATTRIBUTES.COLOR, String(this.gems[j][k].color));
          this.gems[j][k].elem.style.left = k * DEFAULT_SETTINGS.FIELD_SIZE / this.size + 'px';
          this.gems[j][k].elem.style.top = -1 * ((this.size - j) * DEFAULT_SETTINGS.FIELD_SIZE / this.size) - 50 + 'px';
          
          this.gems[j][k].elem.innerHTML = GEM_SYMBOLS[randColor];
        }
      }
    }
    
    setTimeout(() => this.placeAll(), DEFAULT_SETTINGS.ANIMATION_DELAY);
    this.pause = false;
  }

  private placeAll(): void {
    for (let i = this.size - 1; i >= 0; i--) {
      for (let j = this.size - 1; j >= 0; j--) {
        this.gems[i][j].place();
      }
    }
  }

  private kill(cluster: GemPosition[]): void {
    const fnCluster = [...cluster];
    this.cluster = [];
    
    if (fnCluster.length !== 0) {
      this.score += (fnCluster.length) * (fnCluster.length) * DEFAULT_SETTINGS.SCORE_MULTIPLIER;
      console.log(this.score);
      this.pause = true;
      
      setTimeout(() => {
        for (let i = 0; i < fnCluster.length; i++) {
          this.gems[fnCluster[i].j][fnCluster[i].k].kill();
        }
      }, DEFAULT_SETTINGS.KILL_DELAY);
      
      setTimeout(() => {
        for (let i = 0; i < fnCluster.length; i++) {
          this.shiftDown(fnCluster[i].j, fnCluster[i].k);
        }
      }, DEFAULT_SETTINGS.ANIMATION_DELAY);
      
      setTimeout(() => {
        for (let j = 0; j < this.size; j++) {
          for (let k = 0; k < this.size; k++) {
            this.cluster = this.cluster.concat(this.matchChain(j, k));
          }
        }
        this.kill(this.cluster);
      }, DEFAULT_SETTINGS.ANIMATION_DELAY);
    } else {
      setTimeout(() => this.fillMap(), DEFAULT_SETTINGS.ANIMATION_DELAY);
      this.pause = false;
    }
  }

  private shiftDown(j: number, k: number): void {
    for (let m = 0; m <= j; m++) {
      for (let l = j; l > 0; l--) {
        if (this.gems[l][k].state === GemState.DEAD) {
          this.swap(l, k, l - 1, k);
          this.gems[l - 1][k].place();
          this.gems[l][k].place();
        }
      }
    }
  }

  private swap(j: number, k: number, dj: number, dk: number): void {
    const buffer = this.gems[j][k];
    this.gems[j][k] = this.gems[dj][dk];
    this.gems[dj][dk] = buffer;
    
    this.gems[dj][dk].elem.setAttribute(DATA_ATTRIBUTES.J, dj.toString());
    this.gems[dj][dk].elem.setAttribute(DATA_ATTRIBUTES.K, dk.toString());
    
    this.gems[j][k].elem.setAttribute(DATA_ATTRIBUTES.J, j.toString());
    this.gems[j][k].elem.setAttribute(DATA_ATTRIBUTES.K, k.toString());
  }

  private isCorrectTurn(j: number, k: number, dj: number, dk: number): boolean {
    let result = false;
    
    if (j !== this.chosenJ && dk !== this.chosenK) {
      result = true;
    }
    
    if (j === dj + 1 && k === dk) {
      result = true;
    }
    
    if (j === dj - 1 && k === dk) {
      result = true;
    }
    
    if (j === dj && k === dk + 1) {
      result = true;
    }
    
    if (j === dj && k === dk - 1) {
      result = true;
    }
    
    if (this.diagonal) {
      if (j === dj + 1 && k === dk + 1) {
        result = true;
      }
      
      if (j === dj - 1 && k === dk - 1) {
        result = true;
      }
      
      if (j === dj - 1 && k === dk + 1) {
        result = true;
      }
      
      if (j === dj + 1 && k === dk - 1) {
        result = true;
      }
    }
    
    if (this.gems[j][k].color === this.gems[dj][dk].color) {
      result = false;
    }
    
    return result;
  }

  private matchChain(j: number, k: number, action?: string): GemPosition[] {
    const chain: GemPosition[] = [];
    const horiz: GemPosition[] = [];
    const vrtcl: GemPosition[] = [];
    
    if (this.gems[j][k].state !== GemState.DEAD) {
      this.gems[j][k].state = GemState.DEAD;
      
      if (!this.linesOnly) {
        chain.push({
          j: j,
          k: k
        });
        
        for (let i = 0; i < chain.length; i++) {
          // Check up
          if (chain[i].j > 0) {
            if (this.gems[chain[i].j - 1][chain[i].k].color === this.gems[chain[i].j][chain[i].k].color && 
                this.gems[chain[i].j - 1][chain[i].k].state !== GemState.DEAD) {
              chain.push({
                j: chain[i].j - 1,
                k: chain[i].k
              });
              this.gems[chain[i].j - 1][chain[i].k].state = GemState.DEAD;
            }
          }
          
          // Check left
          if (chain[i].k > 0) {
            if (this.gems[chain[i].j][chain[i].k - 1].color === this.gems[chain[i].j][chain[i].k].color && 
                this.gems[chain[i].j][chain[i].k - 1].state !== GemState.DEAD) {
              chain.push({
                j: chain[i].j,
                k: chain[i].k - 1
              });
              this.gems[chain[i].j][chain[i].k - 1].state = GemState.DEAD;
            }
          }
          
          // Check down
          if (chain[i].j < this.size - 1) {
            if (this.gems[chain[i].j + 1][chain[i].k].color === this.gems[chain[i].j][chain[i].k].color && 
                this.gems[chain[i].j + 1][chain[i].k].state !== GemState.DEAD) {
              chain.push({
                j: chain[i].j + 1,
                k: chain[i].k
              });
              this.gems[chain[i].j + 1][chain[i].k].state = GemState.DEAD;
            }
          }
          
          // Check right
          if (chain[i].k < this.size - 1) {
            if (this.gems[chain[i].j][chain[i].k + 1].color === this.gems[chain[i].j][chain[i].k].color && 
                this.gems[chain[i].j][chain[i].k + 1].state !== GemState.DEAD) {
              chain.push({
                j: chain[i].j,
                k: chain[i].k + 1
              });
              this.gems[chain[i].j][chain[i].k + 1].state = GemState.DEAD;
            }
          }
        }
      } else {
        // Lines only mode
        horiz.push({
          j: j,
          k: k
        });
        
        vrtcl.push({
          j: j,
          k: k
        });
        
        // Check horizontal matches
        for (let i = 0; i < horiz.length; i++) {
          // Check left
          if (horiz[i].k > 0) {
            if (this.gems[horiz[i].j][horiz[i].k - 1].color === this.gems[horiz[i].j][horiz[i].k].color && 
                this.gems[horiz[i].j][horiz[i].k - 1].state !== GemState.DEAD) {
              horiz.push({
                j: horiz[i].j,
                k: horiz[i].k - 1
              });
              this.gems[horiz[i].j][horiz[i].k - 1].state = GemState.DEAD;
            }
          }
          
          // Check right
          if (horiz[i].k < this.size - 1) {
            if (this.gems[horiz[i].j][horiz[i].k + 1].color === this.gems[horiz[i].j][horiz[i].k].color && 
                this.gems[horiz[i].j][horiz[i].k + 1].state !== GemState.DEAD) {
              horiz.push({
                j: horiz[i].j,
                k: horiz[i].k + 1
              });
              this.gems[horiz[i].j][horiz[i].k + 1].state = GemState.DEAD;
            }
          }
        }
        
        // Check vertical matches
        for (let i = 0; i < vrtcl.length; i++) {
          // Check up
          if (vrtcl[i].j > 0) {
            if (this.gems[vrtcl[i].j - 1][vrtcl[i].k].color === this.gems[vrtcl[i].j][vrtcl[i].k].color && 
                this.gems[vrtcl[i].j - 1][vrtcl[i].k].state !== GemState.DEAD) {
              vrtcl.push({
                j: vrtcl[i].j - 1,
                k: vrtcl[i].k
              });
              this.gems[vrtcl[i].j - 1][vrtcl[i].k].state = GemState.DEAD;
            }
          }
          
          // Check down
          if (vrtcl[i].j < this.size - 1) {
            if (this.gems[vrtcl[i].j + 1][vrtcl[i].k].color === this.gems[vrtcl[i].j][vrtcl[i].k].color && 
                this.gems[vrtcl[i].j + 1][vrtcl[i].k].state !== GemState.DEAD) {
              vrtcl.push({
                j: vrtcl[i].j + 1,
                k: vrtcl[i].k
              });
              this.gems[vrtcl[i].j + 1][vrtcl[i].k].state = GemState.DEAD;
            }
          }
        }
      }
      
      // Check if matches meet minimum line requirement
      if (chain.length < this.minLine) {
        for (let i = 0; i < chain.length; i++) {
          this.gems[chain[i].j][chain[i].k].state = GemState.ALIVE;
        }
        chain.length = 0;
      }
      
      if (horiz.length < this.minLine) {
        for (let i = 0; i < horiz.length; i++) {
          this.gems[horiz[i].j][horiz[i].k].state = GemState.ALIVE;
        }
        horiz.length = 0;
      }
      
      if (vrtcl.length < this.minLine) {
        for (let i = 0; i < vrtcl.length; i++) {
          this.gems[vrtcl[i].j][vrtcl[i].k].state = GemState.ALIVE;
        }
        vrtcl.length = 0;
      }
      
      if (this.linesOnly) {
        chain.push(...horiz, ...vrtcl);
      }
      
      if (action === MatchAction.CHECK) {
        for (let i = 0; i < chain.length; i++) {
          this.gems[chain[i].j][chain[i].k].state = GemState.ALIVE;
        }
      }
    }
    
    return chain;
  }
}
