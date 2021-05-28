import { expect } from 'chai';
import Raiser, { raise, inspect, doRaiser, evaluateRaiser, Errors } from '../src/index.js';

const success = Symbol();

describe('inspect :: Raiser e [e]', function () {
  it('should provide access to the list of previously raised errors', function () {
    const raiser = doRaiser(function * () {
      yield raise('error');
      const errors = yield inspect;
      expect(errors).to.deep.equal(['error']);
      return success;
    });
    expect(evaluateRaiser(raiser)).to.equal(success);
  });

  it('should return an empty array when there have been no errors raised', function () {
    const raiser = doRaiser(function * () {
      expect(yield inspect).to.deep.equal([]);
      return success;
    });
    expect(evaluateRaiser(raiser)).to.equal(success);
  });
});
