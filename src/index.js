// data
const _setAutostart = new Set()
const _setUpdate = new Set()
const _setAfterUpdate = new Set()
let _timescale = 1

// easings
const _easings = {
	linear: t => t,
	inQuad: t => t * t,
	outQuad: t => 2 * t - t * t,
}

// library properties
exports.time = 0
exports.delta = 0
exports.max = 1000 / 20
exports.setTimescale = val => (_timescale = val)

/**
 * Add a callback on update loop
 * @param {Callback} cb
 */
exports.onUpdate = cb => _setUpdate.add(cb)

/**
 * Add a callback on afterUpdate loop
 * @param {Callback} cb
 */
exports.onAfterUpdate = cb => _setAfterUpdate.add(cb)

// update loop
const _raf = typeof window !== 'undefined' ? window.requestAnimationFrame : undefined
exports.init = () => {
	exports.time = 0
	exports.delta = 0
	_timescale = 1
	_setAutostart.clear()
	_setUpdate.clear()
	_setAfterUpdate.clear()
}

exports.update = t => {
	exports.delta = Math.min(exports.max, t - exports.time)
	if (_setAutostart.size > 0) {
		_setAutostart.forEach(x => {
			if (x.autostart) x.start()
		})
		_setAutostart.clear()
	}
	_setUpdate.forEach(x => x(exports.delta * 0.001))
	_setAfterUpdate.forEach(x => x(exports.delta * 0.001))

	if (_raf) _raf(exports.update)
	exports.time = t
}

if (_raf) _raf(exports.update)

/**
 * Create a Tween
 *
 * @param {*} obj - JS Object to tween
 * @param {*} to - Properties to tween and values
 * @param {number} dur - Properties to tween and values
 * @param {number} delay - Properties to tween and values
 */
exports.tween = (obj, to, dur = 0.4, delay = 0) => {
	const t = {
		autostart: true,
		obj,

		from: {},
		to,
		dur,
		easing: 'outQuad',
		el: 0,
		delay,

		onStarted: [],
		onCompleted: [],
		onKilled: [],
		after: [],

		/**
		 * Start a tween
		 *
		 * @param {number} delay - Delay before starting
		 */
		start: function(delay = 0) {
			for (var prop in this.to) {
				this.from[prop] = this.obj[prop]
			}
			_setUpdate.add(this.evt)

			for (var cb of this.onStarted) cb.call(t)
			if (delay != 0) this.delay += delay

			if (this.delay < 0) {
				this.update(Math.abs(this.delay))
			}
		},

		/**
		 * Update a tween progression
		 *
		 * @param {number} dt - Delta time (in seconds)
		 */
		update: function(dt) {
			if (this.delay > 0) {
				this.delay -= dt * _timescale
				if (this.delay > 0) return
				dt = Math.abs(this.delay)
			}

			this.el += dt * _timescale
			var remains = this.el - this.dur
			if (remains > 0) this.el -= remains

			for (var prop in this.to) {
				this.obj[prop] =
					this.from[prop] + _easings[this.easing](this.el / this.dur) * (this.to[prop] - this.from[prop])
			}

			if (this.el === this.dur) {
				_setUpdate.delete(this.evt)
				for (var cb of this.onCompleted) cb.call(t)
				this.obj = undefined
				for (var next of this.after) {
					next.start(-remains)
				}
			}
		},

		/**
		 * Kill a tween
		 * Stop his execution and let the object at the current position
		 *
		 * @param {boolean} finalValue - Does force final tween final values
		 */
		kill: function(finalValue = false) {
			if (!this.obj) return

			_setUpdate.delete(this.evt)
			for (var cb of this.onKilled) cb.call(t)
			if (finalValue) {
				for (var prop in this.to) {
					this.obj[prop] = this.to[prop]
				}
			}

			this.obj = undefined
		},

		/**
		 * Add a tween after another
		 * @param {Tween} tween
		 */
		append: function(tween) {
			tween.autostart = false
			this.after.push(tween)
			return tween
		},
	}

	t.evt = t.update.bind(t)
	_setAutostart.add(t)

	return t
}
