import Raiser from './Raiser.js';

// consume :: Raiser e [e]
const consume = new Raiser((value) => ({ errors: [], value }));

export default consume;
