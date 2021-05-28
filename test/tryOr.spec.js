import { of } from 'fantasy-land';
import { expect } from 'chai';
import Raiser, { raise, inspect, checkpoint, tryOr, doRaiser, evaluateRaiser, tryRaiser, Errors } from '../src/index.js';

const success = Symbol();

describe('tryOr :: a -> Raiser e a -> Raiser e a', function () {
  it('should return the result of the provided successful other raiser', function () {
    const raiser = tryOr('fallback', Raiser[of](3));
    expect(tryRaiser(raiser)).to.equal(3);
  });

  it('should recover from an aborted Raiser, re-raising the thrown errors', function () {
    const raiser = () => tryOr('fallback', doRaiser(function* () {
      yield raise('error');
      yield checkpoint;
    }));
    expect(evaluateRaiser(raiser())).to.equal('fallback');
    expect(() => tryRaiser(raiser())).to.throw(Errors).that.has.deep.property('errors', ['error']);
  });

  it('the raiser being attempted should see errors raised from before', function () {
    const raiser = () => doRaiser(function* () {
      yield raise('outer');
      return yield tryOr('fallback', doRaiser(function* () {
        expect(yield inspect).to.deep.equal(['outer']);
        return success;
      }));
    });
    expect(evaluateRaiser(raiser())).to.equal(success);
    expect(() => tryRaiser(raiser())).to.throw(Errors).that.has.deep.property('errors', ['outer']);
  });

  it('should include errors raised in the inner Raiser without aborting', function () {
    const raiser = () => doRaiser(function* () {
      yield raise('outer');
      return yield tryOr('fallback', doRaiser(function* () {
        yield raise('inner');
        return success;
      }));
    });
    expect(evaluateRaiser(raiser())).to.equal(success);
    expect(() => tryRaiser(raiser())).to.throw(Errors).that.has.deep.property('errors', ['outer', 'inner']);
  });
});
