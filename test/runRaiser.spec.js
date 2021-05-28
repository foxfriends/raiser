import { expect } from 'chai';
import Raiser, { raise, checkpoint, doRaiser, runRaiser, Errors } from '../src/index.js';

const success = Symbol();

describe('runRaiser :: Raiser e a -> { errors :: [e], value :: a }', function () {
  it('runs a successful Raiser, returning its result and no errors', function () {
    const raiser = doRaiser(function* () { return success; });
    expect(runRaiser(raiser)).to.deep.equal({ errors: [], value: success });
  });

  it('runs a failing Raiser that does not check, returning its result and errors', function () {
    const raiser = doRaiser(function* () {
      yield raise(1);
      yield raise(2);
      yield raise(3);
      return success;
    });
    expect(runRaiser(raiser)).to.deep.equal({ errors: [1, 2, 3], value: success });
  });

  it('runs a failing Raiser, throwing its checked failures', function () {
    const raiser = doRaiser(function* () {
      yield raise(1);
      yield raise(2);
      yield raise(3);
      yield checkpoint;
      return success;
    });
    expect(() => runRaiser(raiser)).to.throw(Errors).that.has.deep.property('errors', [1, 2, 3]);
  });
});
