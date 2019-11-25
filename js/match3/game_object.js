"use strict"

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