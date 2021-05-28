import Raiser from './Raiser.js';
import Errors from './Errors.js';

// tryOr :: a -> Raiser e a -> Raiser e a
const tryOr = (fallback, raiser) => new Raiser((errors) => {
  try {
    return raiser.computation(errors);
  } catch (error) {
    if (error instanceof Errors) {
      errors.push(...error.errors);
      return { errors, value: fallback };
    }
    throw error;
  }
});

export default tryOr;
