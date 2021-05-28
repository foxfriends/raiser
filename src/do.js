import { curry } from 'ramda';
import { chain, of } from 'fantasy-land';

const do_ = curry((M, gen) => {
  const next = curry((it, val) => {
    const { value, done } = it.next(val);
    if (done) { return M[of](value); }
    return value[chain](next(it));
  });
  return next(gen(), undefined);
});

export default do_;
