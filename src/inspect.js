import Raiser from './Raiser.js';

// inspect :: Raiser e [e]
const inspect = new Raiser((errors) => ({ errors, value: errors }));

export default inspect;
