import { expect } from 'chai';
import Raiser, { raise, checkpoint, doRaiser, evaluateRaiser, Errors } from '../src/index.js';

const success = Symbol();

describe('evaluateRaiser :: Raiser e a -> a', function () {
  it('runs a successful Raiser, returning its successful result', function () {
    const raiser = doRaiser(function* () { return success; });
    expect(evaluateRaiser(raiser)).to.equal(success);
  });

  it('runs a failing Raiser that does not check, returning the result anyway', function () {
    const raiser = doRaiser(function* () {
      yield raise(1);
      yield raise(2);
      yield raise(3);
      return success;
    });
    expect(evaluateRaiser(raiser)).to.equal(success);
  });

  it('runs a failing Raiser, throwing its checked failures', function () {
    const raiser = doRaiser(function* () {
      yield raise(1);
      yield raise(2);
      yield raise(3);
      yield checkpoint;
      return success;
    });
    expect(() => evaluateRaiser(raiser)).to.throw(Errors).that.has.deep.property('errors', [1, 2, 3]);
  });
});
