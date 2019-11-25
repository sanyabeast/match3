"use strict"

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