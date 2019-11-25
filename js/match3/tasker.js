"use strict"

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