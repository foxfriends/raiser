import { append } from 'ramda';
import Raiser from './Raiser.js';

// raise :: e -> Raiser e ()
const raise = (error) => new Raiser((errors) => ({ errors: append(error, errors) }));

export default raise;
