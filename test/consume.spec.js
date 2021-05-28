import { expect } from 'chai';
import Raiser, { raise, consume, doRaiser, tryRaiser, Errors } from '../src/index.js';

const success = Symbol();

describe('consume :: Raiser e [e]', function () {
  it('dismisses all previously raised errors', function () {
    const raiser = doRaiser(function * () {
      yield raise('error');
      yield raise('another');
      yield consume;
      return success;
    });
    expect(tryRaiser(raiser)).to.equal(success);
  });

  it('returns the errors that were dismissed', function () {
    const raiser = doRaiser(function * () {
      yield raise('error');
      yield raise('another');
      expect(yield consume).to.deep.equal(['error', 'another']);
      return success;
    });
    expect(tryRaiser(raiser)).to.equal(success);
  });
});
