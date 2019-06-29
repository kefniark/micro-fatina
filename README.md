## Micro fatina

Micro Tween library for js13k, keep the basic features from [Fatina](https://www.npmjs.com/package/fatina) but stripped to the maximum:
* Less than 2KB
* Provides events (`onStarted`, `onCompleted`, `onKilled`)
* Fewer Easings (you can add back the one you need)
* Sequence are replaced by a simple `.append` method to chain them
* Well Unit tested

## Samples

### Tweens
```js
import { tween } from 'micro-fatina'

// let's use any type of object to animate
var obj = { x: -2000, y: 150 }

// move the object to a new position in 2 seconds
var t = tween(obj, { x: -150, y: 100 }, 2)

// use events
t.onStarted.push(() => console.log('tween started !'))
t.onCompleted.push(() => console.log('tween completed !'))
```

### Chains
you can chain tweens (here the chain takes 5s)
```js
// append a new move after the first one
tween(obj, { x: -150, y: 100 }, 2)
    .append(tween(obj, { x: 0, y: 150 }, 1))
    .append(tween(obj, { x: 0, y: 250 }, 1))
    .append(tween(obj, { x: 0, y: 350 }, 1))
```

or run them in parallel (here the chain takes 3s)
```js
// append a new move after the first one
const t = tween(obj, { x: -150, y: 100 }, 2)
t.append(tween(obj, { x: 0 }, 1))
t.append(tween(obj, { y: 250 }, 1))
```
