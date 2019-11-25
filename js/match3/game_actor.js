"use strict"

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

	animate ( target, duration, easing, new_props ) {
		this.props.tasker.add({
			timeout: duration,
			lambda: ()=>{
				TweenLite.to(target, duration, _.merge(new_props, {
					ease: easing,
					onUpdate: ()=>{
						this.update()
					}
				}))	
			}
		})
	}

	animate_style ( duration, easing, style ) {
		this.animate( this.props.style, duration, easing, style )
	}

	set_inner_html( html ) { this.elem.innerHTML = html; }
	set_data_attribute( name, value ) { this.elem.dataset[name] = value; }

}