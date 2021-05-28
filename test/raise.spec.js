import { expect } from 'chai';
import Raiser, { raise, doRaiser, tryRaiser, Errors } from '../src/index.js';

describe('raise :: e -> Raiser e ()', function () {
  it('should raise an error to the current raiser', function () {
    const raiser = doRaiser(function * () {
      yield raise('error');
    });
    expect(() => tryRaiser(raiser)).to.throw(Errors).that.has.deep.property('errors', ['error']);
  });

  it('called multiple times, should raise multiple errors', function () {
    const raiser = doRaiser(function * () {
      yield raise('many');
      yield raise('errors');
      yield raise('in');
      yield raise('a');
      yield raise('row');
    });
    expect(() => tryRaiser(raiser)).to.throw(Errors).that.has.deep.property('errors', ['many', 'errors', 'in', 'a', 'row']);
  });
});
