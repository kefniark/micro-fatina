var tween = require('../src/index')
var assert = require('assert')

function skipTime(sec) {
	tween.max = 100000
	tween.update(tween.time + sec * 1000)
}

describe('Tween', function () {
	describe('basic tween', function () {
		it('should move to final position', function () {
			var evtStarted = 0
			var evtCompleted = 0
			var obj = { x: 0 }

			tween.init()
			var t = tween.tween(obj, { x: 100 }, 1)
			t.onStarted.push(() => evtStarted++)
			t.onCompleted.push(() => evtCompleted++)

			for (var i = 0; i < 50; i++) {
				skipTime(2 / 50)
			}

			assert.equal(obj.x, 100, 'Check final position')
			assert.equal(evtStarted, 1, 'Check onStarted event')
			assert.equal(evtCompleted, 1, 'Check onCompleted event')
		})

		it('check delay', function () {
			var obj = { x: 0 }

			tween.init()
			var t = tween.tween(obj, { x: 100 }, 1, 2)
			t.easing = 'linear'

			skipTime(1.6)
			assert.equal(obj.x, 0, 'Check the start position')

			skipTime(0.9)
			assert.equal(Math.round(obj.x), 50, 'Check the middle position')

			skipTime(1.6)
			assert.equal(obj.x, 100, 'Check final position')
		})

		it('check kill', function () {
			var obj = { x: 0 }
			var evtKilled = 0

			tween.init()
			var t = tween.tween(obj, { x: 100 }, 1)
			t.easing = 'linear'
			t.onKilled.push(() => evtKilled++)

			skipTime(0.5)
			t.kill()
			assert.equal(Math.round(obj.x), 50, 'Check the middle position')

			skipTime(1.6)
			t.kill()
			assert.equal(Math.round(obj.x), 50, 'Check the tween is not updated anymore')

			assert.equal(evtKilled, 1, 'Check onKilled event')
		})

		it('check kill with final values', function () {
			var obj = { x: 0 }
			var evtKilled = 0

			tween.init()
			var t = tween.tween(obj, { x: 100 }, 1)
			t.easing = 'linear'
			t.onKilled.push(() => evtKilled++)

			skipTime(0.5)
			t.kill(true)
			assert.equal(Math.round(obj.x), 100, 'Check the final position')
			assert.equal(evtKilled, 1, 'Check onKilled event')
		})

		it('check order events', function () {
			var up = 0;
			var after = 0;

			tween.init()
			tween.onUpdate(() => up += 1)
			tween.onAfterUpdate(() => {
				after += 1
				assert.equal(after * 2, up, 'Check update events where already called')
			})
			tween.onUpdate(() => up += 1)

			skipTime(1)
			skipTime(1)

			assert.equal(up, 4, 'Check update number of call')
			assert.equal(after, 2, 'Check afterUpdate number of call')
		})
	})

	describe('tween chain', function () {
		it('should properly chain tweens', function () {
			var obj = { x: 0 }

			tween.init()
			var t = tween.tween(obj, { x: 100 }, 1)
				.append(tween.tween(obj, { x: 200 }, 1))
				.append(tween.tween(obj, { x: 300 }, 1))
				.append(tween.tween(obj, { x: 400 }, 0.5))
				.append(tween.tween(obj, { x: 500 }, 0.5))

			t.easing = 'inQuad'

			for (var i = 0; i < 5; i++) {
				skipTime(0.9)
			}
			
			assert.equal(obj.x, 500, 'Check final position')
		})
	})
});
