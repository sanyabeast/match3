"use strict"

class Task extends GameObject {
	constructor ( parent, params ) {
		super( parent, params )

		this.props = _.merge({
			done: false,
			started: false,
			executed: false,
			timeout: -1,
			lambda_returns_timeout: false
		}, this.props)
	}

	finish() { this.props.done = true; }

	run () {
		this.started = true
		let lambda_returned_timeout = null

		if (!this.props.executed && typeof this.props.lambda == "function") {
			this.props.executed = true
			lambda_returned_timeout = this.props.lambda( this )
		}

		if (this.props.timeout >= 0) {
			setTimeout( ()=> this.finish(), (this.props.timeout * 1000)/*seconds*/)
		}

		if (this.props.lambda_returns_timeout === true) {
			setTimeout( ()=> this.finish(), (lambda_returned_timeout * 1000)/*seconds*/)
		}
	}
}