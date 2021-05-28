import { ap, chain, map, of } from 'fantasy-land';

class Raiser {
  constructor(computation) {
    this.computation = computation;
  }

  static [of](value) {
    return new Raiser((errors) => ({ errors, value }));
  }

  [ap](other) {
    return new Raiser((errors) => {
      const { errors: thisErrors, value } = this.computation(errors);
      const { errors: bothErrors, value: f } = other.computation(thisErrors);
      return { errors: bothErrors, value: f(value) };
    });
  }

  [chain](f) {
    return new Raiser((errors) => {
      const { errors: thisErrors, value } = this.computation(errors);
      return f(value).computation(thisErrors);
    })
  }

  [map](f) {
    return new Raiser((errors) => {
      const { errors: thisErrors, value } = this.computation(errors);
      return { errors: thisErrors, value: f(value) };
    });
  }
}

export default Raiser;
