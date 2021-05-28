import { expect } from 'chai';
import Raiser, { raise, checkpoint, doRaiser, tryRaiser, Errors } from '../src/index.js';

const success = Symbol();

describe('tryRaiser :: Raiser e a -> a', function () {
  it('runs a successful Raiser, returning its successful result', function () {
    const raiser = doRaiser(function* () { return success; });
    expect(tryRaiser(raiser)).to.equal(success);
  });

  it('runs a failing Raiser that does not check, throwing its failures and discarding the result', function () {
    const raiser = doRaiser(function* () {
      yield raise(1);
      yield raise(2);
      yield raise(3);
      return success;
    });
    expect(() => tryRaiser(raiser)).to.throw(Errors).that.has.deep.property('errors', [1, 2, 3]);
  });

  it('runs a failing Raiser, throwing its checked failures', function () {
    const raiser = doRaiser(function* () {
      yield raise(1);
      yield raise(2);
      yield raise(3);
      yield checkpoint;
      return success;
    });
    expect(() => tryRaiser(raiser)).to.throw(Errors).that.has.deep.property('errors', [1, 2, 3]);
  });
});
