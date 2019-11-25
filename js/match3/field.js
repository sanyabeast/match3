"use strict"

class Field extends GameActor {
	constructor ( parent, params ) {
		super( parent, _.merge(params, {
			template: "<div id=\"field\"></div>",
			tasker_enabled: true,
			first_selected_gem: null,
			second_selected_gem: null,
			gem_swap_animation_duration: 0.2,
			user_interaction_allowed: true,
			gems: []
		}) )

		this.for_xy( this.props.size, this.props.size, ( x, y )=>{
			this.props.gems[x] = this.props.gems[x] || []
			this.props.gems[x][y] = null
		} )
		
	}

	restart ( rule_set ) {
		this.empty_field()
		this.fill(0)

	}

	empty_field () {
		this.for_xy(this.props.size, this.props.size, ( x, y )=>{
			if (this.props.gems[x][y] instanceof GameObject){
				this.props.gems[x][y].destroy()
				this.props.gems[x][y] = null
			} 
		})
	}


	/**
	 * 
	 * @param {int} fill_mode - 0 - no matches, 1 - has matches, other - free fill
	 */
	fill ( /*int*/fill_mode ) {
		this.for_xy( this.props.size, this.props.size, ( x, y )=> {
			if ( this.props.gems[x][y] === null ) {

				let new_gem = new Gem( this, {
					x: x,
					y: y,
					field_size: this.props.size,
					color: -1,
					max_colors_count: this.props.max_colors_count
				} )

				new_gem.animate_style(0, "none", { translateY: -500, scale: 0.75 })
				
				this.props.gems[x][y] = new_gem		
				
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
				let gem = this.props.gems[x][y]
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
			let gem = this.props.gems[x][y]
			
			gem.animate_style(0.444, "none", {
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
			result_gem = this.props.gems[x][y]			
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
	
	change_gem_location ( gem, x, y ) {
		gem.props.x = x
		gem.props.y = y

		gem.update()
	}

	on_gem_clicked ( gem, evt ) {
		if (this.props.user_interaction_allowed === false) return
		
		let combinations = this.get_combinations( gem )
		
		if (this.props.first_selected_gem === null || this.props.first_selected_gem.equals(gem)){
			this.props.first_selected_gem = gem
		} else {
			this.props.second_selected_gem = gem
			this.swap_gems( this.props.first_selected_gem, this.props.second_selected_gem )
			this.reset_selected_gems()
		}		
	}

	swap_gems ( gemA, gemB ) {
		this.props.user_interaction_allowed = false

		let new_a_x = gemB.props.x
		let new_a_y = gemB.props.y

		let new_b_x = gemA.props.x
		let new_b_y = gemA.props.y

		let gem_a_combinations = null
		let gem_b_combinations = null

		this.props.tasker.add( {
			timeout: this.props.gem_swap_animation_duration,
			lambda: ()=>{
				gemA.animate( gemA.props, this.props.gem_swap_animation_duration, "none", {
					x: new_a_x,
					y: new_a_y,
					onComplete: ()=>{
						this.props.gems[new_a_x][new_a_y] = gemA
					}
				} )
		
				gemB.animate( gemB.props, this.props.gem_swap_animation_duration, "none", {
					x: new_b_x,
					y: new_b_y,
					onComplete: ()=>{
						this.props.gems[new_b_x][new_b_y] = gemB
					}
				} )
			}
		} )

		this.props.tasker.add( {
			timeout: 0.1,
			lambda: ()=>{
				let gem_a_combinations = this.get_combinations( gemA )
				let gem_b_combinations = this.get_combinations( gemB )
			}
		} )

		this.props.tasker.add( {
			lambda_returns_timeout: true,
			lambda: ()=>{
				if (gem_a_combinations === null && gem_b_combinations === null){
					gemA.animate( gemA.props, this.props.gem_swap_animation_duration, "none", {
						x: new_b_x,
						y: new_b_y,
						onComplete: ()=>{
							this.props.gems[new_b_x][new_b_y] = gemA
						}
					} )
			
					gemB.animate( gemB.props, this.props.gem_swap_animation_duration, "none", {
						x: new_a_x,
						y: new_a_y,
						onComplete: ()=>{
							this.props.gems[new_a_x][new_a_y] = gemB
							this.props.user_interaction_allowed = true
						}
					} )

					return this.props.gem_swap_animation_duration
				}

			}
		} )
		

	}

	reset_selected_gems () {
		this.props.first_selected_gem = this.props.second_selected_gem = null
	}
}