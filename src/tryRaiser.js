import Errors from './Errors.js';

// tryRaiser :: Raiser e a -> a
const runRaiser = (raiser) => {
  const { errors, value } = raiser.computation([]);
  if (errors.length) throw new Errors(errors);
  return value;
};

export default runRaiser;
