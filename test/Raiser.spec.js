import { expect } from 'chai';
import { of, map, ap, chain } from 'fantasy-land';
import Raiser, { raise, tryRaiser, evaluateRaiser, Errors } from '../src/index.js';

const success = Symbol();

describe('Raiser', function () {
  describe('.[fantasy-land/of]()', function () {
    it('should return a Raiser that succeeds with the provided value', function () {
      const raiser = Raiser[of](success);
      expect(tryRaiser(raiser)).to.equal(success);
    });
  });

  describe('#[fantasy-land/map]()', function () {
    it('should map the value in the raiser without errors', function () {
      const raiser = Raiser[of](1)[map]((x) => x + 1);
      expect(tryRaiser(raiser)).to.equal(2);
    });

    it('should map the value in the raiser with errors, leaving the errors unchanged', function () {
      const raiser = raise('error')[chain](() => Raiser[of](1))[map]((x) => x + 1);
      expect(evaluateRaiser(raiser)).to.equal(2);
      expect(() => tryRaiser(raiser)).to.throw(Errors).that.has.deep.property('errors', ['error']);
    });
  });

  describe('#[fantasy-land/ap]()', function () {
    it('should apply the function to the value', function () {
      const fn = Raiser[of]((x) => x + 1);
      const val = Raiser[of](1);
      expect(tryRaiser(val[ap](fn))).to.equal(2);
    });

    it('should collect all the errors from both function and value', function () {
      const fn = raise(1)[chain](() => Raiser[of]((x) => x + 1));
      const val = raise(2)[chain](() => Raiser[of](1));
      expect(evaluateRaiser(val[ap](fn))).to.equal(2);
      expect(() => tryRaiser(val[ap](fn))).to.throw(Errors).that.has.deep.property('errors', [2, 1]);
    });
  });

  describe('#[fantasy-land/chain]()', function () {
    it('should chain the value of the raiser into the next one', function () {
      const raiser = Raiser[of](1)[chain]((x) => Raiser[of](x + 1));
      expect(tryRaiser(raiser)).to.equal(2);
    });

    it('should include errors raised before the chain', function () {
      const raiser = raise(3)[chain](() => Raiser[of](1))[chain]((x) => Raiser[of](x + 1));
      expect(evaluateRaiser(raiser)).to.equal(2);
      expect(() => tryRaiser(raiser)).to.throw(Errors).that.has.deep.property('errors', [3]);
    });

    it('should include errors raised after the chain', function () {
      const raiser = Raiser[of](1)[chain]((x) => raise(3)[chain](() => Raiser[of](x + 1)));
      expect(evaluateRaiser(raiser)).to.equal(2);
      expect(() => tryRaiser(raiser)).to.throw(Errors).that.has.deep.property('errors', [3]);
    });
  });
});
