
"use strict";

class GameObject {
	constructor ( parent, params ) {
		this.children = {}
		this.props = _.merge({}, params)
		this.uuid = this.get_random_string()
		this.parent = null

		if (this.props.tasker_enabled){
			this.props.tasker = new Tasker( this )
		}

		if ( parent instanceof GameObject ) {
			this.parent = parent
			parent.children[ this.uuid ] = this
		}
	}

	get_root(){
		if ( this.parent instanceof GameObject ){
			return this.parent.get_root()
		} else {
			return this
		}
	}

	equals ( game_object) {
		return (game_object instanceof GameObject) && this.uuid === game_object.uuid;
	}

	destroy () {
		this.destroy_children()
	
		if (this.parent instanceof GameObject) {
			delete this.parent.children[ this.uuid ]
		}

		_.forEach(this.props, ( value, key )=>{
			if ( value instanceof GameObject ) {
				GameObject.destroy()
				this.props[key] = value
			}
		})

		this.parent = null
	}

	destroy_children () {
		_.forEach( this.children, child => child.destroy() )
		this.children = {}
	}

	get_random_string () {
		return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	}

	array_contains ( array, game_object ) {
		let result = false
		_.forEach(array, (item)=>{
			if ( item && item.equals(game_object) ){
				result = true
				return false
			}
		})
		return result
	}

	get_array_last_element ( array ) {
		return array[ array.length - 1 ]
	}
}

class GameActor extends GameObject {
	constructor ( parent, params ) {
		super( parent, params )
		this.elem = this.parse_html( params.template )
		
		this.props.style = {
			translateX: 0,
			translateY: 0,
			scale: 1
		}
		
		this.props.data = {}

		if ( parent instanceof GameActor ) {
			parent.elem.appendChild( this.elem )
		} else if ( parent instanceof HTMLElement ){
			parent.appendChild( this.elem )
		}

		if ( this.props.events instanceof Array ) {
			_.forEach(this.props.events, (event_name)=>{
				this.elem.addEventListener(event_name, ( evt )=>{
					let lambda_name = `on_${event_name}_event`

					if (typeof this[lambda_name] === "function"){
						this[lambda_name].call(this, evt)
					}
				})
			})
		}
	}

	destroy(){
		super.destroy()
		this.elem.remove()
	}

	compute(){}

	update(){
		this.compute( this.props.style, this.props.data )

		_.forEach(this.props.style, ( value, style_name )=>{
			this.elem.style[style_name] = value
		})

		_.forEach(this.props.data, ( value, name )=>{
			this.elem.dataset[name] = value
		})
	}

	parse_html( html ) {
		let temp = document.createElement("div")
		temp.innerHTML = html
		return temp.children[0]
	}
	
	set_css( css_rules ) {
		_.forEach(css_rules, (value, key)=>{
			this.elem.style[key] = value
		})
	}

	animate ( duration, easing, style ) {

		this.props.tasker.add({
			timeout: duration,
			lambda: ()=>{
				TweenLite.to(this.props.style, duration, _.merge(style, {
					ease: easing,
					onUpdate: ()=>{
						this.update()
					}
				}))	
			}
		})
	}

	set_inner_html( html ) { this.elem.innerHTML = html; }
	set_data_attribute( name, value ) { this.elem.dataset[name] = value; }

}

class Task extends GameObject {
	constructor ( parent, params ) {
		super( parent, params )

		this.props = _.merge({
			done: false,
			started: false,
			executed: false,
			timeout: -1
		}, this.props)
	}

	finish() { this.props.done = true; }

	run () {
		this.started = true

		if (!this.props.executed && typeof this.props.lambda == "function") {
			this.props.executed = true
			this.props.lambda( this )
		}

		if (this.props.timeout >= 0) {
			setTimeout( ()=> this.finish(), (this.props.timeout * 1000)/*seconds*/)
		}
	}
}

class Tasker extends GameObject {
	constructor ( parent, params ) {
		super ( parent, params )
		this.props.queque = []
		this.props.check_interval_id = setInterval(()=>{
			this.check()
		}, 1000 / 60)
	}

	add ( params ) {
		this.props.queque.unshift( new Task( this, params ) )
	}

	destroy(){
		super.destroy()
		clearInterval(this.props.check_interval_id)
	}

	check () {
		if (this.props.queque.length === 0 ) return

		let current_task = this.get_array_last_element( this.props.queque )
		
		if (current_task.props.done){
			this.props.queque.pop()
		} else {
			if (!current_task.props.started){
				current_task.run()
			}
		}
	}
}

class Game extends GameActor {
	constructor ( parent, params ) {
		super( parent, _.merge(params, {
			template: "<div class='match3-game-wrapper'></div>",
			tasker_enabled: true
		}) )

		this.props = _.merge({
			rules: {
				classic: {
					min_combination_length: 3,
					rule_set: [ 
						[ "x = x - 1", "x = x + 1" ], 
						[ "y = y - 1", "y = y + 1" ],
						// [ "x = x - 1; y = y - 1", "x = x + 1; y = y + 1" ],
						// [ "x = x - 1; y = y + 1", "x = x + 1; y = y - 1" ],
					]
				}
			},
			current_level: 1,
			score: 0,
			level_timeout: 0,
			paused: true,
			min_combination_length: 3,
			chosen_gem: null,
			max_colors_count: 6,
			field_size: 8,
			rule_name: "classic",
			fill_solve_max_iterations: 50
		}, this.props)

		if (this.props.min_combination_length < 2) this.props.min_combination_length = 2

		this.props.field = new Field( this, {
			size: this.props.field_size,
			max_colors_count: this.props.max_colors_count,
			min_combination_length: this.props.min_combination_length,
			fill_solve_max_iterations: this.props.fill_solve_max_iterations,
			rules: this.get_rules()
		} )

		this.restart()
	}

	restart () {
		this.props.field.restart()
	}

	get_rules () {
		return this.props.rules[this.props.rule_name]
	}

	
}

class Field extends GameActor {
	constructor ( parent, params ) {
		super( parent, _.merge(params, {
			template: "<div id=\"field\"></div>",
			tasker_enabled: true
		}) )

		this.destroy_children()		
	}

	/*override */
	destroy_children(){
		super.destroy_children()

		this.props.content = []
		this.for_xy( this.props.size, this.props.size, ( x, y )=>{
			this.props.content[x] = this.props.content[x] || []
			this.props.content[x][y] = null
		} )
	}

	restart ( rule_set ) {
		this.destroy_children()
		this.fill(0)

	}

	fill ( /*int*/fill_mode ) {
		this.for_xy( this.props.size, this.props.size, ( x, y )=> {
			if ( this.props.content[x][y] === null ) {

				let new_gem = new Gem( this, {
					x: x,
					y: y,
					field_size: this.props.size,
					color: -1,
					max_colors_count: this.props.max_colors_count
				} )

				new_gem.animate(0, "none", { translateY: -500, scale: 0.75 })
				
				this.props.content[x][y] = new_gem		
				
				if (fill_mode == 0){
					let max_iter_count = this.props.fill_solve_max_iterations
					let iter_id = 0

					let combination = this.get_combinations(new_gem)
					while( combination != null && iter_id < max_iter_count ) {
						iter_id++
						new_gem.update_color(-1)
						combination = this.get_combinations(new_gem)
						// console.log(combination)
					}
				}
			}
		} )

		if (fill_mode == 1){
			this.for_xy(this.props.size, this.props.size, ( x, y )=>{
				let gem = this.props.content[x][y]
				let max_iter_count = this.props.fill_solve_max_iterations
				let iter_id = 0

				let combination = this.get_combinations(gem)
				while( combination === null && iter_id < max_iter_count) {
					iter_id++
					gem.update_color(-1)
					combination = this.get_combinations(gem)
				}
			}  )
		}

		this.for_xy(this.props.size, this.props.size, ( x, y )=>{
			let gem = this.props.content[x][y]
			
			gem.animate(0.444, "none", {
				translateY: 0,
				scale: 1
			})

		}  )
	
	}

	for_xy( x, y, callback ) {
		for ( let a = 0; a < x; a++ ){
			for ( let b = 0; b < y; b++ ) {
				callback( a, b )
			}
		}
	}

	is_valid_gem_index( x, y ) { return !( x < 0 || y < 0 || x > (this.props.size - 1) || y > (this.props.size - 1) ); }

	get_neighbour( gem, rule_string, exclusion ) {
		let x = gem.props.x
		let y = gem.props.y
		let result_gem = null

		eval(rule_string)
		
		if ( this.is_valid_gem_index( x, y ) ) {
			result_gem = this.props.content[x][y]			
			if ( !gem.creates_combination(result_gem) || this.array_contains( exclusion, result_gem ) ) {
				result_gem = null
			}
		}

		return result_gem
	}

	get_neighbours( gem, /*array*/rule_string, exclusion ) {
		let result = []

		if (!this.array_contains(exclusion, gem)){
			result.push(gem)
		}

		let neighbour_gem = this.get_neighbour(gem, rule_string, exclusion.concat(result) )

		if (neighbour_gem){
			let new_exclusion = exclusion.concat(result)
			let new_neighbours = this.get_neighbours(neighbour_gem, rule_string, new_exclusion)

			result = result.concat(new_neighbours)
		}

		if (result.length === 0) result = null
		return result
	}

	print_gems_array(array){
		let print_string = ""

		_.forEach(array, (gem)=>{
			print_string += `gem{ x:${gem.props.x}:${gem.props.y} } `
		})

		return print_string
	}

	get_combination( gem, rule_strings, min_combination_length ){
		let result_combination = []


		_.forEach( rule_strings, ( rule_string )=>{
			let neighbours = this.get_neighbours( gem, rule_string, result_combination )
			if (neighbours != null) result_combination = result_combination.concat(neighbours)
		} )


		
		if (result_combination.length < min_combination_length) result_combination = null
		return result_combination

	}

	get_combinations ( gem ) {
		let result_combinations = []


		_.forEach( this.props.rules.rule_set, ( rule_strings )=>{
			let combination = this.get_combination( gem, rule_strings, this.props.min_combination_length )

			if (combination != null ) {
				result_combinations.push ( combination )
			}
		})

		if (result_combinations.length === 0) result_combinations = null
		return result_combinations

	}

	on_gem_clicked ( gem, evt ) {
		let combinations = this.get_combinations( gem )
	}
}

class Gem extends GameActor {
	constructor ( parent, params ) {
		super( parent, _.merge(params, {
			template: "<div class=\"gem\"></div>",
			tasker_enabled: true,
			events: ["click"]
		}) )

		this.props = _.merge({
			is_alive: true
		}, this.props)

		this.update()
	}
	
	compute ( style, data ) {
		style.width = `${100 / this.props.field_size * this.props.style.scale }%`
		style.height = `${100 / this.props.field_size * this.props.style.scale }%`
		style["font-size"] = "1em"
		style.top = `calc(${ (100 / this.props.field_size) * this.props.y }% + ${this.props.style.translateY}px)`
		style.left = `calc(${ (100 / this.props.field_size) * this.props.x }% + ${this.props.style.translateX}px)`

		data.alive = this.props.is_alive
		data.x = this.props.x
		data.y = this.props.y

		if (this.props.color < 0) {
			data.color = this.props.color = Math.floor((Math.random() * this.props.max_colors_count))
		}
	}

	creates_combination ( gem ) {
		return gem && gem.props.color === this.props.color
	}

	set_is_alive(new_is_alive){
		this.props.is_alive = new_is_alive
		this.update()
	}

	update_color(colorId/**-1 for random */){
		this.props.color = colorId
		this.update()
	}

	update_position (x, y) {
		this.props.x = x
		this.props.y = y
		this.update()
	}

	/** */
	on_click_event( evt ){
		this.parent.on_gem_clicked( this, evt )
	}

	gem_style = [
		{ icon: '⚜' },
		{ icon: '☣' },
		{ icon: '♗' },
		{ icon: '♆' },
		{ icon: '♞' },
		{ icon: '♙' },
		{ icon: '☄' },
		{ icon: '❦' },
		{ icon: '♨' },
		{ icon: '♟' }
	];

}

window.match3 = new Game( document.body, {} )

