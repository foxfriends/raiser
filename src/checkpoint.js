import Raiser from './Raiser.js';
import Errors from './Errors.js';

// checkpoint :: Raiser e ()
const checkpoint = new Raiser((errors) => {
  if (errors.length) { throw new Errors(errors); }
  return { errors };
});

export default checkpoint;
