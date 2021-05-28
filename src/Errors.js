class Errors extends Error {
  constructor(errors) {
    super();
    this.errors = errors;
  }
}

export default Errors;
