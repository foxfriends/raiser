import { expect } from 'chai';
import Raiser, { raise, checkpoint, doRaiser, evaluateRaiser, tryRaiser, Errors } from '../src/index.js';

describe('checkpoint :: Raiser e ()', function () {
  it('should do nothing if there are no errors raised', function () {
    const raiser = doRaiser(function * () {
      yield checkpoint;
    });
    expect(() => tryRaiser(raiser)).not.to.throw(Errors);
  });

  it('it should abort the computation without value if there is an error raised', function () {
    const raiser = () => doRaiser(function * () {
      yield raise('error');
      yield checkpoint;
      yield raise('after');
    });
    expect(() => tryRaiser(raiser())).to.throw(Errors).that.has.deep.property('errors', ['error']);
    expect(() => evaluateRaiser(raiser())).to.throw(Errors).that.has.deep.property('errors', ['error']);
  });
});
