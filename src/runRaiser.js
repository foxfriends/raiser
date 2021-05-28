// runRaiser :: Raiser e a -> { errors :: [e], value :: a }
const runRaiser = (raiser) => raiser.computation([]);

export default runRaiser;
