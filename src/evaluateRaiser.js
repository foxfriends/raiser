// evaluateRaiser :: Raiser e a -> a
const evaluateRaiser = (raiser) => {
  const { value } = raiser.computation([]);
  return value;
};

export default evaluateRaiser;
