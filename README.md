# Raiser

Raise multiple errors without throwing.

This is a [Fantasy Land][] compliant monad (maybe) implementing a way to collect multiple errors
without aborting the computation. I think this is a real monad, but I have not checked the laws,
so maybe it's actually just something pretending to be a monad. Trust at your own discretion.

[Fantasy Land]: https://github.com/fantasyland/fantasy-land

Anyway, whether or not it's a good monad, this may be a useful construct.

# API

> Note: the examples below assume this is published to NPM in a package called `raiser`. It is not.
> If you actually want to use this library let me know and I'll publish it, but under some other
> name because `raiser` is taken and honestly not a great name but it's just what I came up with
> when I was typing it out.

## `Raiser :: TypeRep (Raiser e a)`

```javascript
import Raiser from 'raiser';
```

This is the core of this whole thing, the Type Representative of the `Raiser` monad. This is
really not all that special if you are familiar with the `State` monad, and can be understood
as a specialization like this: `Raiser e a = State [e] a`.

### `Raiser :: ([e] -> { errors :: [e], value :: a }) -> Raiser e a`

This is the constructor (e.g. `new Raiser`). Not really recommended for use, the underlying
representation of a `Raiser` is a function that:
1.  takes a single parameter `errors :: [e]`, the list of errors that have been
    raised in the current context; and
2.  returns a record of the form `{ errors, value }` where `errors :: [e]` is the list of
    errors with any newly raised ones, and `value :: a` is the resulting value of this
    computation.

By using the operators and do-notation helper as provided, you should be able to avoid this
constructor easily.

### `Raiser#['fantasy-land/of'] :: a -> Raiser e a`

Produces a `Raiser` that computes the constant value provided, without raising an errors.

### `Raiser#['fantasy-land/map'] :: Raiser e a ~> (a -> b) -> Raiser e b`

Maps the value of the `Raiser`, leaving the errors untouched.

### `Raiser#['fantasy-land/ap'] :: Raiser e a ~> Raiser e (a -> b) -> Raiser e b`

Applies the function which is contained in another `Raiser` to the value contained in this
`Raiser`. The errors raised by both will be included in the result.

### `Raiser#['fantasy-land/chain'] :: Raiser e a ~> (a -> Raiser e b) -> Raiser e b`

Chains the value of the Raiser, transforming the value while also allowing for new errors
to be raised.

### `Raiser#computation :: [e] -> { errors :: [e], value :: a }`

Runs a Raiser by calling the underlying function representation that was explained
with the constructor. As with the constructor, it's not likely you'll want to use this
directly.

## `Errors`

```javascript
import { Errors } from 'raiser';
```

When a Raiser decides to abort its computation, it will do so by throwing an error of type
`Errors`. This value has a property `errors` which is an array containing all the values
raised to the `Raiser` that is aborting.

## Consuming `Raisers`

I would not be surprised if 100% of the time you are dealing with Raisers, you create
them using `doRaiser` and consume them with one of the three functions `runRaiser`,
`evaluateRaiser`, or `tryRaiser`. Though you could use the raw class as described above,
it's really nasty and not a good time.

### `doRaiser :: Generator (forall b. Raiser e b) a -> Raiser e a`

Builds a `Raiser` from a generator in which `yield` takes the role of `<-`, allowing you
to yield other `Raisers` and collect their errors naturally. This is fairly similar to
some other Fantasy Land do-notation things you may see elsewhere, but is included here
to spare you having to find another. Hopefully the examples below show you how this works.

> `doRaiser` is actually a specialization of `do_ :: Monad m => TypeRep m -> Generator (forall b. m b) a -> m a`,
> which you are also welcome to use on any other Fantasy Land compliant monad.

Some things to keep in mind, as Javascript is not that conducive to the do-notation:
1.  A raiser created this way is single use. You can't run it again.
2.  `doRaiser` (and by extension, `do_`) will eagerly evaluate up to the first yield.
    The rest won't be evaluated until you run it with `runRaiser` or whatever. Not a
    great behaviour I think, but it will do.
3.  `do_` will not work with non-deterministic monads (e.g. list). See [Burrido][] if
    you need such a thing, but that's not always great either.

[Burrido]: https://github.com/pelotom/burrido

### `runRaiser :: Raiser e a -> { errors :: [e], value :: a }`

Runs a `Raiser`, returning both the list of raised errors and the resulting value.

```javascript
import { doRaiser, raise, runRaiser } from 'raiser';

const raiser = doRaiser(function* () {
  yield raise(new Error('bad'));
  return 'ok';
});

runRaiser(raiser); // { errors: [Error('bad')], value: 'ok' }
```

### `evaluateRaiser :: Raiser e a -> { errors :: [e], value :: a }`

Runs a `Raiser`, ignoring the raised errors and just returning the resulting value.

```javascript
import { doRaiser, raise, evaluateRaiser } from 'raiser';

const raiser = doRaiser(function* () {
  yield raise(new Error('bad'));
  return 'ok';
});

evaluateRaiser(raiser); // 'ok'
```

### `tryRaiser :: Raiser e a -> { errors :: [e], value :: a }`

Runs a `Raiser`, aborting *after* completing the computation if any errors were
raised in the process. Note that this aborts *after* the computation, so the
return value of the `Raiser` will be evaluated anyway, and then discarded.

```javascript
import { doRaiser, raise, tryRaiser } from 'raiser';

const raiser = doRaiser(function* () {
  yield raise(new Error('bad'));
  return 'ok';
});

tryRaiser(raiser); // !throws
```

## Working with `Raisers`

### `raise :: e -> Raiser e ()`

Raises an error into the Raiser.

```javascript
import { doRaiser, raise, tryRaiser } from 'raiser';

const raiser = doRaiser(function* () {
  yield raise(new Error('bad'));
  yield raise(new Error('worse'));
  return 'ok';
});

tryRaiser(raiser); // !throws
```

### `lower :: e -> Raiser e ()`

The opposite of `raise`, this will un-raise a previously raised error. If such an error was
not previously raised, nothing will happen.

```javascript
import { doRaiser, raise, lower, tryRaiser } from 'raiser';

const raiser = doRaiser(function* () {
  const error = new Error;
  yield raise(error);
  yield lower(error);
  return 'ok';
});

tryRaiser(raiser); // 'ok'
```

### `inspect :: Raiser e [e]`

Gets the current list of errors. This does not modify that list, just lets you access it,
maybe so you can look for ones you know how to handle and `lower` them.

```javascript
import { doRaiser, raise, inspect, runRaiser } from 'raiser';

const raiser = doRaiser(function* () {
  yield raise('ok');
  const errors = yield inspect;
  return errors[0];
});

runRaiser(raiser); // { errors: ['ok'], value: 'ok' }
```

### `consume :: Raiser e [e]`

Gets the current list of errors, and dismisses them all.

```javascript
import { doRaiser, raise, consume, runRaise } from 'raiser';

const raiser = doRaiser(function* () {
  yield raise('ok');
  const errors = yield consume;
  return errors[0];
});

runRaiser(raiser); // { errors: [], value: 'ok' }
```

### `checkpoint :: Raiser e ()`

Defines a checkpoint at which, if there are any errors that were previously raised, the computation
is aborted immediately (by throwing an `Errors` containing everything that was raised).

Notice that, unless handled along the way, this can cause `runRaiser` or `evaluateRaiser` to throw,
despite their usual not throwing of unchecked raised errors.

```javascript
import { doRaiser, raise, consume, evaulateRaiser } from 'raiser';

const raiser = doRaiser(function* () {
  yield raise('error');
  yield checkpoint;
  console.log('This will not happen');
});

runRaiser(raiser); // !throws
```

### `tryOr :: a -> Raiser e a -> Raiser e a`

Attempts to run another `Raiser`, and if that one aborts (due to using `checkpoint`), the abort is
stopped and the errors are just put back into the raised state. Since in the case of an abort, there
is no return value available, you must provide a fallback as the first parameter.

```javascript
import { doRaiser, raise, checkpoint, tryOr, evaluateRaiser } from 'raiser';

const raiser = doRaiser(function* () {
  yield raise('error');
  const value = yield tryOr('Sorry', doRaiser(function* () {
    yield raise('another error');
    yield checkpoint;
    return 'Success!';
  });
  return value;
});

runRaiser(raiser); // { errors: ['error', 'another error'], value: 'Sorry' }
```
