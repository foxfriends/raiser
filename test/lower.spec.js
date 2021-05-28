import { expect } from 'chai';
import Raiser, { raise, lower, doRaiser, tryRaiser, Errors } from '../src/index.js';

const success = Symbol();

describe('lower :: e -> Raiser e ()', function () {
  it('should lower a previously raised error', function () {
    const raiser = doRaiser(function * () {
      yield raise('error');
      yield lower('error');
      return success;
    });
    expect(tryRaiser(raiser)).to.equal(success);
  });

  it('should do nothing if nothing was raised', function () {
    const raiser = doRaiser(function * () {
      yield lower('error');
      return success;
    });
    expect(tryRaiser(raiser)).to.equal(success);
  });

  it('only lowers the specified error', function () {
    const raiser = doRaiser(function * () {
      yield raise('a');
      yield raise('b');
      yield raise('c');
      yield lower('b');
      return success;
    });
    expect(() => tryRaiser(raiser)).to.throw(Errors).that.has.deep.property('errors', ['a', 'c']);
  });
});
