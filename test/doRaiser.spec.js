import { expect } from 'chai';
import Raiser, { raise, doRaiser, evaluateRaiser } from '../src/index.js';

const success = Symbol();

describe('doRaiser :: Generator (forall b. Raiser e b) a -> Raiser e a', function () {
  it('is not lazy before the first yield, even though it probably should be', function () {
    expect(() => doRaiser(function * () { throw new Error; })).to.throw(Error);
  });

  it('is lazy after the first yield, for some reason', function () {
    const raiser = doRaiser(function * () { yield raise('hello'); throw new Error; });
    expect(() => runRaiser(raiser)).to.throw(Error);
  });

  it('returns a Raiser', function () {
    const raiser = doRaiser(function * () { return success; });
    expect(raiser).to.be.an.instanceOf(Raiser);
  });

  it('the returned raiser evaluates to the return value of the generator', function () {
    const raiser = doRaiser(function * () { return success; });
    expect(evaluateRaiser(raiser)).to.equal(success);
  });
});
