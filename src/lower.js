import { reject, equals } from 'ramda';
import Raiser from './Raiser.js';

// lower :: e -> Raiser e ()
const lower = (error) => new Raiser((errors) => ({ errors: reject(equals(error), errors) }));

export default lower;
