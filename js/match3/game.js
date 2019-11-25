"use strict"

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