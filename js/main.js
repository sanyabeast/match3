
var gem = [], 
	cluster = [],
	size = 18, 
	minLine = 3, 
	colors = 6,
	chosen = false, 
	diagonal = true,
	field = $('#field'),
	pause = true,
	linesOnly = false,
	//aEnabled = true,
	//aExplosion = new Audio('audio/explosion.mp3'),
	//aFill = new Audio('audio/fill.mp3')
	//aTurn = new Audio('audio/turn.mp3'),
	//aSelect = new Audio('audio/select.mp3'),
	score = 0,
	target = 0,
	time = 60;
	scoreboard = $('#scoreboard'),
	time,
	level = 1,
	levelinfo = {
		diagonal : '<img src="img/diagonal.png">',
		nodiagonal : '<img src="img/no-diagonal.png">',
		cluster : '<img src="img/cluster.png">',
		nocluster : '<img src="img/no-cluster.png">'
	};

$(document).ready(leveler(level));

function init(size, minLine, colors){
	field.html('');
	chosen: false;
	createMap(size, colors);
	fillMap();
};

function kill(cluster){
	var fnCluster = cluster;
	cluster = [];
	if (fnCluster.length !== 0) {
		score += (fnCluster.length) * (fnCluster.length) * 36;
		console.log(score);
		pause = true;
		setTimeout(function(){
			for (var i = 0; i < fnCluster.length ; i++){
				gem[fnCluster[i].j][fnCluster[i].k].kill()
			};
			//sfx('expl');
		}, 300);
		setTimeout(function(){
			for (var i = 0; i < fnCluster.length ; i++){
				shiftDown(fnCluster[i].j, fnCluster[i].k)
			};
		}, 600);
		setTimeout(function(){
			for (j = 0; j < size; j++){
				for (k = 0; k < size; k++) {
					cluster = cluster.concat(matchChain(j, k));
				}
			};
			kill(cluster);
		}, 600);
	} else {
		setTimeout('fillMap()', 600)
		pause = false;

	}
};

//function sfx(sound) {
//	if (aEnabled == true){
//		switch (sound) {
//			case 'turn' :
//				aTurn.play()
//				break
//			case 'expl' :
//				aExplosion.play()
//				break
//			case 'fail' :
//				aFail.play()
//				break
//			case 'select' :
//				aSelect.play();
//				break
//			case 'fill' :
//				aFill.play()
//				break
//		}	
//	}
//}

function createMap(size, colors) {
	if (size > 1 && ((linesOnly == true && colors > 1) || (linesOnly == false && colors > 1)) && minLine > 1){
		for (var i = 0; i < size; i++){
		    gem[i] = [];
		    for (var j = 0; j < size; j++){
		        gem[i][j] = 0;
		}};
		for (j = 0; j < size; j++){
			for (k = 0; k < size; k++) {
				gem[j][k] = {
					elem : '',
					state: 'dead',
					color : '',
					kill : function(){
						this.state = 'dead';
						this.elem.addClass('dead');
						this.elem.css({
							'left' :  Math.random() * 500 + 'px',
							'top' :  '250px'
						})
						
					},
					place : function (){
						this.elem.css({
							'top' : this.elem.data('j') * 500/size,
							'left' : this.elem.data('k') * 500/size,
						});
					},
				};
				field.append('<div class="gem' + '" data-j="' + j + '" data-k="' + k +'" + data-color="" ></div>');
				gem[j][k].elem = $('[data-j=' + j +'][data-k=' + k + ']');
				
			}
		};
		gemClass = $('.gem');
		gemClass.css({
			'width' : 500/size - 1+ 'px',
			'height': 500/size - 1+ 'px',
			'font-size' : 500/(size * 2) + 'px'
		});

	} else {
		field.html('A field with the following parameters: size: ' + size + ', colors: ' + colors + ', min. line length: ' + minLine + ', ' + ' cannot be generated.');
	};
};

function fillMap(){
	
	var randColor;
	pause = true;
	for (j = 0; j < size; j++){
		for (k = 0; k < size; k++) {
			if (gem[j][k].state == 'dead'){
				gem[j][k].state = 'alive';
				gem[j][k].elem.removeClass('dead');
				do {
					randColor = Math.floor(Math.random() * (colors));
					gem[j][k].color = randColor;
					cluster = matchChain(j, k, 'check');
				} while (cluster.length !== 0);
				gem[j][k].elem.data('color', gem[j][k].color).attr('data-color', gem[j][k].color);
				gem[j][k].elem.css({
					'left': k * 500/size + 'px',
					'top' : -1 * ((size - j) * 500/size) -50 + 'px',
				});
				switch (randColor) {
					case 0:
						gem[j][k].elem.html('⚜')
						break
					case 1:
						gem[j][k].elem.html('☣')
						break
					case 2:
						gem[j][k].elem.html('♗')
						break
					case 3:
						gem[j][k].elem.html('♆ ')	
						break
					case 4:
						gem[j][k].elem.html('♞')
						break
					case 5:
						gem[j][k].elem.html('♙')	
						break
					case 6:
						gem[j][k].elem.html('☄')
						break
					case 7:
						gem[j][k].elem.html('❦')
						break	
					case 8:
						gem[j][k].elem.html('♨')
						break
					case 9:
						gem[j][k].elem.html('♟')
						break		
				}
			};
		}
	};
	setTimeout('place()', 600);
	//sfx('turn');
	pause = false;
};


field.on("click", ".gem", function (){
	if (chosen == false && pause !== true){
		chosen = true;
		//sfx('turn');
		cj = $(this).data('j');
		ck = $(this).data('k');
		console.log(cj + 'x' + ck + ', ' + gem[cj][ck].color + ', ' + gem[cj][ck].state);
		gem[cj][ck].elem.addClass('chosen');
	} else if (pause !== true) {
		chosen = false;
		//sfx('select');
		var dj = $(this).data('j');
		var dk = $(this).data('k');
		if (correctTurn(cj, ck, dj, dk) == true){
			gem[cj][ck].elem.removeClass('chosen');
			swap(cj, ck, dj, dk);
			gem[cj][ck].place();
			gem[dj][dk].place();
			cluster = matchChain(cj, ck);
			cluster = cluster.concat(matchChain(dj, dk));
			if (cluster.length === 0){
				setTimeout(function(){
					swap(dj, dk, cj, ck);
					gem[cj][ck].place();
					gem[dj][dk].place();
				}, 500);
			} else {
				kill(cluster);
			}
		} else {
			gem[cj][ck].elem.removeClass('chosen');
		};	
	};
});



function shiftDown(j, k){
	for (var m = 0; m <= j; m++){
		for(var l = j; l > 0; l--){
			if (gem[l][k].state === 'dead'){
				swap(l, k, l - 1, k);
				gem[l-1][k].place();
				gem[l][k].place();
			} 
		};
	};	
};

function swap(j, k, dj, dk){
	var buffer = [];
	buffer = gem[j][k];
	gem[j][k] = gem[dj][dk];
	gem[dj][dk] = buffer;
	gem[dj][dk].elem.data({
		'j' : dj,
		'k' : dk
	}).attr({
		'data-j': dj,
		'data-k': dk
	});	
	gem[j][k].elem.data({
		'j' : j,
		'k' : k
	}).attr({
		'data-j': j,
		'data-k': k
	});	
	
};

function correctTurn(j, k, dj, dk){
	var result = false;
	if (j !== cj &&  dk !== ck) {result = true};
	if(j == dj + 1 && k == dk){
		result = true;
	};
	if(j == dj - 1 && k == dk){
		result = true;
	};
	if(j == dj && k == dk + 1){
		result = true;
	};
	if(j == dj && k == dk - 1){
		result = true;
	};
	if (diagonal == true){
		if(j == dj + 1 && k == dk + 1){
		result = true;
		};
		if(j == dj - 1 && k == dk - 1){
			result = true;
		};
		if(j == dj - 1 && k == dk + 1){
			result = true;
		};
		if(j == dj + 1 && k == dk - 1){
			result = true;
		};
	};
	if (gem[j][k].color == gem[dj][dk].color){
		result = false;
	};
	return result;
};

function place(){
	for (var i = size - 1; i >=0; i--){
	    for (var j = size - 1; j >=0; j--){
	    	gem[i][j].place();
	    }
	};
	//sfx('turn');
};


function matchChain(j, k, action){
	var chain = new Array();
	var horiz = new Array();
	var vrtcl = new Array();
	var i = 0;
	if (gem[j][k].state !== 'dead'){
		gem[j][k].state = 'dead';
		if (linesOnly == false){
			chain.push({
				j: j,
				k: k
			});
			for (var i = 0; i < chain.length; i++){
				if (chain[i].j > 0){
					if (gem[chain[i].j - 1][chain[i].k].color == gem[chain[i].j][chain[i].k].color && gem[chain[i].j - 1][chain[i].k].state !== 'dead'){
						chain.push({
							j: chain[i].j - 1,
							k: chain[i].k
						});
						gem[chain[i].j - 1][chain[i].k].state = 'dead';
					};
				};
				if (chain[i].k > 0){
					if (gem[chain[i].j][chain[i].k - 1].color == gem[chain[i].j][chain[i].k].color && gem[chain[i].j][chain[i].k - 1].state !== 'dead'){
						chain.push({
							j: chain[i].j,
							k: chain[i].k - 1
						});
						gem[chain[i].j][chain[i].k - 1].state = 'dead';
					};
				};
				if (chain[i].j < size - 1){
					if (gem[chain[i].j + 1][chain[i].k].color == gem[chain[i].j][chain[i].k].color && gem[chain[i].j + 1][chain[i].k].state !== 'dead'){
						chain.push({
							j: chain[i].j + 1,
							k: chain[i].k
						});
						gem[chain[i].j + 1][chain[i].k].state = 'dead';
					};
				};
				if (chain[i].k < size - 1){
					if (gem[chain[i].j][chain[i].k + 1].color == gem[chain[i].j][chain[i].k].color && gem[chain[i].j][chain[i].k + 1].state !== 'dead'){
						chain.push({
							j: chain[i].j,
							k: chain[i].k + 1
						});
						gem[chain[i].j][chain[i].k + 1].state = 'dead';
					};
				};
			};
		} else {
			horiz.push({
				j: j,
				k: k
			});
			vrtcl.push({
				j: j,
				k: k
			});
			for (var i = 0; i < horiz.length; i++){
				if (horiz[i].k > 0){
					if (gem[horiz[i].j][horiz[i].k - 1].color == gem[horiz[i].j][horiz[i].k].color && gem[horiz[i].j][horiz[i].k - 1].state !== 'dead'){
						horiz.push({
							j: horiz[i].j,
							k: horiz[i].k - 1
						});
						gem[horiz[i].j][horiz[i].k - 1].state = 'dead';
					};
				};
				if (horiz[i].k < size - 1){
					if (gem[horiz[i].j][horiz[i].k + 1].color == gem[horiz[i].j][horiz[i].k].color && gem[horiz[i].j][horiz[i].k + 1].state !== 'dead'){
						horiz.push({
							j: horiz[i].j,
							k: horiz[i].k + 1
						});
						gem[horiz[i].j][horiz[i].k + 1].state = 'dead';
					};
				};
			};
			for (var i = 0; i < vrtcl.length; i++){
				if (vrtcl[i].j > 0){
					if (gem[vrtcl[i].j - 1][vrtcl[i].k].color == gem[vrtcl[i].j][vrtcl[i].k].color && gem[vrtcl[i].j - 1][vrtcl[i].k].state !== 'dead'){
						vrtcl.push({
							j: vrtcl[i].j - 1,
							k: vrtcl[i].k
						});
						gem[vrtcl[i].j - 1][vrtcl[i].k].state = 'dead';
					};
				};
				if (vrtcl[i].j < size - 1){
					if (gem[vrtcl[i].j + 1][vrtcl[i].k].color == gem[vrtcl[i].j][vrtcl[i].k].color && gem[vrtcl[i].j + 1][vrtcl[i].k].state !== 'dead'){
						vrtcl.push({
							j: vrtcl[i].j + 1,
							k: vrtcl[i].k
						});
						gem[vrtcl[i].j + 1][vrtcl[i].k].state = 'dead';
					};
				};
			};
		}
		if (chain.length < minLine){
			for (i = 0; i < chain.length ; i++){
				gem[chain[i].j][chain[i].k].state = 'alive';
			};
			chain = [];
		};
		if (horiz.length < minLine){
			for (i = 0; i < horiz.length ; i++){
				gem[horiz[i].j][horiz[i].k].state = 'alive';
			};
			horiz = [];
		};
		if (vrtcl.length < minLine){
			for (i = 0; i < vrtcl.length ; i++){
				gem[vrtcl[i].j][vrtcl[i].k].state = 'alive';
			};
			vrtcl = [];
		};
		if (linesOnly == true){
				chain = horiz.concat(vrtcl);
		};
		if (action == 'check'){
			for (i = 0; i < chain.length ; i++){
				gem[chain[i].j][chain[i].k].state = 'alive';
			};
		}
	};
	return chain;
};

function leveler(level){
	target = Math.floor(Math.sqrt(level) * 5000); 
	size = Math.floor(Math.random() * (5)) + 12;
	if (colors !== 10){colors++};
	if (level >= 2) {
		var r = Math.random() * 2;
		if (r == 1){
			linesOnly = false
		} else {
			linesOnly = true;
		}
	};
	if (level >= 3) {
		var r = Math.random() * 2;
		if (r == 1){
			diagonal = false
		} else {
			diagonal = true;
		}
	};
	field.html('Level ' + level);
	if (linesOnly == true){
		field.append(levelinfo.nocluster)
	} else {
		field.append(levelinfo.cluster)
	};
	if (diagonal == true){
		field.append(levelinfo.diagonal)
	} else {
		field.append(levelinfo.nodiagonal)
	};
	time = 60 + Math.floor((level * 5)/2);
	setTimeout('init(size, minLine, colors)', 1000);
}

var countdown = setInterval(function(){
	if (time == 0 && score < target){
		clearInterval(countdown);
		field.html('Game over');
		scoreboard.html(score + '/' + target + ' | <span> 0 </span>');
	} else if (time == 0 && score >= target){
		level++;
		score = 0;
		leveler(level);
	} else {
		time -= 1;
		scoreboard.html(score + '/' + target + ' | ' + time)
	}
	
}, 1000)