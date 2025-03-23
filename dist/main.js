(()=>{"use strict";var t,e="restart",n="gem",i="chosen",s="dragging";!function(t){t.ALIVE="alive",t.DEAD="dead"}(t||(t={}));var o,r="data-j",a="data-k",c="data-color",u=500,h=["⚜","☣","♗","♆","♞","♙","☄","❦","♨","♟"];!function(t){t.CHECK="check"}(o||(o={}));var l=function(){function e(e,n){this._elem=e,this._state=t.DEAD,this._color=0,this._boardSize=n,this._elem.style.transition="top 0.15s ease-in, left 0.15s ease-in, transform 0.15s ease-out, opacity 0.15s ease-out"}return Object.defineProperty(e.prototype,"elem",{get:function(){return this._elem},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"state",{get:function(){return this._state},set:function(t){this._state=t},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"color",{get:function(){return this._color},set:function(t){this._color=t,this._elem.innerHTML=t>=0?"".concat(t):""},enumerable:!1,configurable:!0}),e.prototype.updateBoardSize=function(t){this._boardSize=t},e.prototype.kill=function(){this._state=t.DEAD,this._elem.classList.add("dead"),this._elem.style.transition="none",this._elem.style.transform="none",this._elem.style.opacity="1",this._elem.offsetWidth,this._elem.style.transition="transform 0.4s ease-in, opacity 0.4s ease-in",this._elem.style.transform="translateY(100%) scale(0.8)",this._elem.style.opacity="0"},e.prototype.place=function(){var t=parseInt(this._elem.getAttribute(r)||"0",10),e=parseInt(this._elem.getAttribute(a)||"0",10);this._elem.style.transform="",this._elem.style.opacity="1",this._elem.style.top=t*u/this._boardSize+"px",this._elem.style.left=e*u/this._boardSize+"px"},e}(),d=function(){function t(){this.sounds=new Map,this.enabled=!0,this.backgroundMusic=null,this.audioContext=null,this.hasUserInteraction=!1,this.loadSounds(),this.initBackgroundMusic()}return t.getInstance=function(){return t.instance||(t.instance=new t),t.instance},t.prototype.loadSounds=function(){this.loadSound(t.SOUND_EFFECTS.EXPLOSION,"explosion.mp3"),this.loadSound(t.SOUND_EFFECTS.EXPLOSION_BIG,"Explosion8.mp3"),this.loadSound(t.SOUND_EFFECTS.FAIL,"fail.mp3"),this.loadSound(t.SOUND_EFFECTS.FILL,"fill.mp3"),this.loadSound(t.SOUND_EFFECTS.SWAP,"swap.mp3"),this.loadSound(t.SOUND_EFFECTS.TURN,"turn.mp3"),this.loadSound(t.SOUND_EFFECTS.YES,"yes.mp3")},t.prototype.initBackgroundMusic=function(){this.backgroundMusic=new Audio("audio/bg_theme.mp3"),this.backgroundMusic.loop=!0,this.backgroundMusic.volume=.3;try{this.audioContext=new(window.AudioContext||window.webkitAudioContext)}catch(t){console.warn("Web Audio API not supported in this browser")}},t.prototype.loadSound=function(t,e){var n=new Audio("audio/".concat(e));n.preload="auto",this.sounds.set(t,n)},t.prototype.play=function(t){if(this.enabled){var e=this.sounds.get(t);if(e){var n=e.cloneNode();n.volume=.5,n.play().catch((function(e){console.warn("Error playing sound ".concat(t,":"),e)}))}}},t.prototype.playBackgroundMusic=function(){this.enabled&&this.backgroundMusic&&this.backgroundMusic.paused&&(this.audioContext&&"suspended"===this.audioContext.state&&this.audioContext.resume().catch((function(t){console.warn("Error resuming AudioContext:",t)})),this.backgroundMusic.play().catch((function(t){console.warn("Error playing background music (likely autoplay restriction):",t)})))},t.prototype.pauseBackgroundMusic=function(){this.backgroundMusic&&!this.backgroundMusic.paused&&this.backgroundMusic.pause()},t.prototype.setEnabled=function(t){this.enabled=t,t?this.backgroundMusic&&this.playBackgroundMusic():this.pauseBackgroundMusic()},t.prototype.toggleSound=function(){return this.enabled=!this.enabled,this.enabled?this.playBackgroundMusic():this.pauseBackgroundMusic(),this.enabled},t.prototype.isEnabled=function(){return this.enabled},t.prototype.userInteractionOccurred=function(){this.hasUserInteraction=!0,this.audioContext&&"suspended"===this.audioContext.state&&this.audioContext.resume().catch((function(t){console.warn("Error resuming AudioContext:",t)})),this.enabled&&this.playBackgroundMusic()},t.SOUND_EFFECTS={EXPLOSION:"explosion",EXPLOSION_BIG:"explosion_big",FAIL:"fail",FILL:"fill",SWAP:"swap",TURN:"turn",YES:"yes",BG_THEME:"bg_theme"},t}(),p=function(){function e(t,e,n,i){this._gems=[],this._element=t,this._size=e,this._minLine=n,this._colors=i,this._soundManager=d.getInstance(),this.createMap(e,n,i)}return Object.defineProperty(e.prototype,"size",{get:function(){return this._size},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"minLine",{get:function(){return this._minLine},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"colors",{get:function(){return this._colors},enumerable:!1,configurable:!0}),e.prototype.getGem=function(t,e){return this._gems[t][e]},e.prototype.createMap=function(t,e,n){return this.isValidGameConfiguration(t,n)?(this.clearField(),this.initializeGemsArray(t),this.createGemElements(),this.setGemElementSizes(),this.fillMap(),!0):(this.displayInvalidConfigurationMessage(t,n),!1)},e.prototype.isValidGameConfiguration=function(t,e){return t>1&&e>1&&this._minLine>1},e.prototype.displayInvalidConfigurationMessage=function(t,e){this._element.innerHTML="A field with the following parameters: size: ".concat(t,", colors: ").concat(e,", min. line length: ").concat(this._minLine,", cannot be generated.")},e.prototype.clearField=function(){this._element.innerHTML=""},e.prototype.initializeGemsArray=function(t){this._gems=[];for(var e=0;e<t;e++)this._gems[e]=[]},e.prototype.createGemElements=function(){for(var t=0;t<this._size;t++)for(var e=0;e<this._size;e++){var i=document.createElement("div");i.className=n,i.setAttribute(r,t.toString()),i.setAttribute(a,e.toString()),i.setAttribute(c,""),this._element.appendChild(i),this._gems[t][e]=new l(i,this._size)}},e.prototype.setGemElementSizes=function(){var t=this;document.querySelectorAll(".".concat(n)).forEach((function(e){var n=e;n.style.width=u/t._size-1+"px",n.style.height=u/t._size-1+"px",n.style.fontSize=u/(2*t._size)+"px"}))},e.prototype.fillMap=function(){for(var e=0;e<this._size;e++)for(var n=function(n){if(i._gems[e][n].state===t.DEAD){var s=i._gems[e][n].elem;setTimeout((function(){s.parentNode&&s.remove()}),450),i.createBrandNewGem(e,n)}},i=this,s=0;s<this._size;s++)n(s);this._soundManager.play(d.SOUND_EFFECTS.FILL),this.placeAll()},e.prototype.createBrandNewGem=function(e,i){var s=document.createElement("div");s.className=n,s.setAttribute(r,e.toString()),s.setAttribute(a,i.toString()),s.style.width=u/this._size-1+"px",s.style.height=u/this._size-1+"px",s.style.fontSize=u/(2*this._size)+"px";var o,d=-(1+(e<3?3-e:1))*u/this._size;s.style.top="".concat(d,"px"),s.style.left=i*u/this._size+"px",s.style.transform="scale(0.8) rotate(".concat(20*Math.random()-10,"deg)"),s.style.opacity="0.9",this._element.appendChild(s),this._gems[e][i]=new l(s,this._size),this._gems[e][i].state=t.ALIVE;do{o=Math.floor(Math.random()*this._colors)}while(this.willCreateMatch(e,i,o));this._gems[e][i].color=o,s.setAttribute(c,String(o)),s.innerHTML=h[o]},e.prototype.createNewGem=function(t,e){this.createBrandNewGem(t,e)},e.prototype.willCreateMatch=function(e,n,i){for(var s=1,o=n-1;o>=0&&this._gems[e][o].state===t.ALIVE&&this._gems[e][o].color===i;)s++,o--;for(o=n+1;o<this._size&&this._gems[e][o].state===t.ALIVE&&this._gems[e][o].color===i;)s++,o++;if(s>=this._minLine)return!0;for(s=1,o=e-1;o>=0&&this._gems[o][n].state===t.ALIVE&&this._gems[o][n].color===i;)s++,o--;for(o=e+1;o<this._size&&this._gems[o][n].state===t.ALIVE&&this._gems[o][n].color===i;)s++,o++;return s>=this._minLine},e.prototype.placeAll=function(){for(var t=0;t<this._size;t++)for(var e=0;e<this._size;e++)this._gems[t][e].place()},e.prototype.swap=function(t,e,n,i){this._gems[t][e].elem.setAttribute(r,n.toString()),this._gems[t][e].elem.setAttribute(a,i.toString()),this._gems[n][i].elem.setAttribute(r,t.toString()),this._gems[n][i].elem.setAttribute(a,e.toString());var s=this._gems[t][e];this._gems[t][e]=this._gems[n][i],this._gems[n][i]=s},e.prototype.isCorrectTurn=function(e,n,i,s){if(this._gems[e][n].state!==t.ALIVE||this._gems[i][s].state!==t.ALIVE)return!1;var o=Math.abs(e-i),r=Math.abs(n-s);return 1===o&&0===r||0===o&&1===r},e.prototype.matchChain=function(e,n){if(this._gems[e][n].state!==t.ALIVE)return[];for(var i=this._gems[e][n].color,s=[],o=0,r=[{dj:0,dk:1},{dj:1,dk:0}];o<r.length;o++){var a=r[o],c=[{j:e,k:n}];this.checkDirection(e,n,a.dj,a.dk,i,c),this.checkDirection(e,n,-a.dj,-a.dk,i,c),c.length>=this._minLine&&(s=s.concat(c))}return this.removeDuplicates(s)},e.prototype.checkDirection=function(e,n,i,s,o,r){for(var a=e+i,c=n+s;a>=0&&a<this._size&&c>=0&&c<this._size&&this._gems[a][c].state===t.ALIVE&&this._gems[a][c].color===o;)r.push({j:a,k:c}),a+=i,c+=s},e.prototype.removeDuplicates=function(t){for(var e=[],n=new Set,i=0,s=t;i<s.length;i++){var o=s[i],r="".concat(o.j,",").concat(o.k);n.has(r)||(n.add(r),e.push(o))}return e},e}(),m=function(){function o(){this.cluster=[],this.chosen=!1,this.pause=!0,this.score=0,this.target=0,this.time=60,this.level=1,this.chosenJ=-1,this.chosenK=-1,this.countdownInterval=null,this.field=document.getElementById("field"),this.scoreboard=document.getElementById("scoreboard"),this.soundManager=d.getInstance(),this.board=new p(this.field,10,3,5),this.initEventListeners(),this.setupAudioContext(),this.startLevel(this.level)}return o.prototype.initEventListeners=function(){var t=this,e=!1,o=null,c=-1,u=-1,h=0,l=0,p=function(s){if(!t.pause){var p=s.target;p.classList.contains(n)&&(s instanceof MouseEvent?(h=s.clientX,l=s.clientY):(h=s.touches[0].clientX,l=s.touches[0].clientY),o=p,c=parseInt(p.getAttribute(r)||"0",10),u=parseInt(p.getAttribute(a)||"0",10),t.board.getGem(c,u).elem.classList.add(i),t.soundManager.play(d.SOUND_EFFECTS.TURN),e=!0)}},m=function(n){if(e&&o){var r,a;n.preventDefault(),n instanceof MouseEvent?(r=n.clientX,a=n.clientY):(r=n.touches[0].clientX,a=n.touches[0].clientY);var p=r-h,m=a-l,f=Math.sqrt(p*p+m*m);if(f>5&&o.classList.add(s),f>10){var g=Math.abs(p)>Math.abs(m),v=c,_=u;g?_=u+(p>0?1:-1):v=c+(m>0?1:-1),v>=0&&v<t.board.size&&_>=0&&_<t.board.size&&t.board.isCorrectTurn(c,u,v,_)&&(e=!1,o.classList.remove(s),t.board.getGem(c,u).elem.classList.remove(i),t.pause=!0,t.board.swap(c,u,v,_),t.board.getGem(c,u).place(),t.board.getGem(v,_).place(),t.soundManager.play(d.SOUND_EFFECTS.SWAP),t.cluster=t.board.matchChain(c,u),t.cluster=t.cluster.concat(t.board.matchChain(v,_)),0===t.cluster.length?setTimeout((function(){t.board.swap(v,_,c,u),t.board.getGem(c,u).place(),t.board.getGem(v,_).place(),t.pause=!1}),100):t.kill(t.cluster))}}},f=function(){e&&o&&(e=!1,o.classList.remove(s),t.board.getGem(c,u).elem.classList.contains(i)&&t.board.getGem(c,u).elem.classList.remove(i),o=null,c=-1,u=-1)};this.field.addEventListener("mousedown",p),document.addEventListener("mousemove",m),document.addEventListener("mouseup",f),this.field.addEventListener("touchstart",p,{passive:!1}),document.addEventListener("touchmove",m,{passive:!1}),document.addEventListener("touchend",f),this.field.addEventListener("click",(function(e){var s=e.target;if(s.classList.contains(n)&&!t.pause){var o=parseInt(s.getAttribute(r)||"0",10),c=parseInt(s.getAttribute(a)||"0",10);t.chosen?(t.chosen=!1,t.board.getGem(t.chosenJ,t.chosenK).elem.classList.remove(i),t.board.isCorrectTurn(t.chosenJ,t.chosenK,o,c)&&(t.pause=!0,t.board.swap(t.chosenJ,t.chosenK,o,c),t.board.getGem(t.chosenJ,t.chosenK).place(),t.board.getGem(o,c).place(),t.soundManager.play(d.SOUND_EFFECTS.SWAP),t.cluster=t.board.matchChain(t.chosenJ,t.chosenK),t.cluster=t.cluster.concat(t.board.matchChain(o,c)),0===t.cluster.length?setTimeout((function(){t.board.swap(o,c,t.chosenJ,t.chosenK),t.board.getGem(t.chosenJ,t.chosenK).place(),t.board.getGem(o,c).place(),t.pause=!1}),100):t.kill(t.cluster))):(t.chosen=!0,t.chosenJ=o,t.chosenK=c,t.board.getGem(o,c).elem.classList.add(i),t.soundManager.play(d.SOUND_EFFECTS.TURN))}}))},o.prototype.setupAudioContext=function(){var t=this,e=function(){t.soundManager.userInteractionOccurred(),document.removeEventListener("click",e),document.removeEventListener("touchstart",e),document.removeEventListener("keydown",e)};document.addEventListener("click",e),document.addEventListener("touchstart",e),document.addEventListener("keydown",e)},o.prototype.startLevel=function(t){var e=this;this.target=Math.floor(5e3*Math.sqrt(t));var n=Math.floor(5*Math.random())+12,i=Math.min(5+t-1,10);this.determineGameModeForLevel(t),this.displayLevelInfo(t),this.time=60+Math.floor(5*t/2),this.soundManager.playBackgroundMusic(),setTimeout((function(){e.board=new p(e.field,n,3,i),e.pause=!1,e.score=0,e.updateScoreboard()}),500),this.startCountdownTimer()},o.prototype.determineGameModeForLevel=function(t){},o.prototype.displayLevelInfo=function(t){this.field.innerHTML="Level ".concat(t)},o.prototype.startCountdownTimer=function(){var t=this;this.countdownInterval&&clearInterval(this.countdownInterval),this.countdownInterval=window.setInterval((function(){0===t.time?t.score<t.target?t.handleGameOver():t.handleLevelComplete():(t.time-=1,t.updateScoreboard())}),1e3)},o.prototype.updateScoreboard=function(){this.scoreboard.innerHTML="".concat(this.score,"/").concat(this.target," | ").concat(this.time)},o.prototype.handleGameOver=function(){var t=this;this.countdownInterval&&clearInterval(this.countdownInterval),this.pause=!0,this.field.innerHTML="GAME OVER",this.soundManager.play(d.SOUND_EFFECTS.FAIL),this.soundManager.pauseBackgroundMusic();var n=document.createElement("div");n.id=e,n.innerHTML="RESTART",n.addEventListener("click",(function(){t.level=1,t.startLevel(t.level)})),this.field.appendChild(n)},o.prototype.handleLevelComplete=function(){var t=this;this.countdownInterval&&clearInterval(this.countdownInterval),this.pause=!0,this.level++,this.field.innerHTML="LEVEL COMPLETE",this.soundManager.play(d.SOUND_EFFECTS.YES);var n=document.createElement("div");n.id=e,n.innerHTML="NEXT LEVEL",n.addEventListener("click",(function(){t.startLevel(t.level)})),this.field.appendChild(n)},o.prototype.kill=function(t){this.pause=!0,this.updateScoreForMatches(t),this.processMatchedGems(t)},o.prototype.updateScoreForMatches=function(t){var e=t.length>4?1.5:1;this.score+=Math.floor(36*t.length*e),this.updateScoreboard(),t.length>=5?this.soundManager.play(d.SOUND_EFFECTS.EXPLOSION_BIG):this.soundManager.play(d.SOUND_EFFECTS.EXPLOSION)},o.prototype.processMatchedGems=function(t){var e=this,n=function(i){for(var s=Math.min(i+5,t.length),o=i;o<s;o++){var r=t[o];e.board.getGem(r.j,r.k).kill()}s<t.length?setTimeout((function(){return n(s)}),10):setTimeout((function(){return e.shiftDown()}),450)};n(0)},o.prototype.shiftDown=function(){for(var e=this,n=!1,i=this.board.size-2;i>=0;i--)for(var s=0;s<this.board.size;s++)this.board.getGem(i,s).state===t.ALIVE&&this.board.getGem(i+1,s).state===t.DEAD&&(this.board.swap(i,s,i+1,s),this.board.getGem(i+1,s).place(),n=!0);n?setTimeout((function(){return e.shiftDown()}),100):(this.board.fillMap(),setTimeout((function(){return e.findAndProcessNewMatches()}),100))},o.prototype.findAndProcessNewMatches=function(){for(var e=[],n=0;n<this.board.size;n++)for(var i=0;i<this.board.size;i++)if(this.board.getGem(n,i).state===t.ALIVE){var s=this.board.matchChain(n,i);if(s.length>0)for(var o=function(t){e.some((function(e){return e.j===t.j&&e.k===t.k}))||e.push(t)},r=0,a=s;r<a.length;r++)o(a[r])}e.length>0?(console.log("Found ".concat(e.length," new matches in cascade")),this.kill(e)):this.pause=!1},o}();document.addEventListener("DOMContentLoaded",(function(){new m}))})();