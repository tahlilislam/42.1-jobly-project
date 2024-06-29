const { BadRequestError } = require("../expressError");

// Middleware to validate query parameters

function validateQueryParams(req, res, next) {
  const q = req.query;

  const errors = [];
  const allowedFields = ["name", "minEmployees", "maxEmployees"];

  // Check for invalid fields
  for (let key in q) {
    if (!allowedFields.includes(key)) {
      errors.push(`Invalid field: ${key}`);
    }
  }

  if (q.minEmployees && isNaN(+q.minEmployees)) {
    errors.push("minEmployees must be a number");
  }

  if (q.maxEmployees && isNaN(+q.maxEmployees)) {
    errors.push("maxEmployees must be a number");
  }

  if (q.minEmployees && q.maxEmployees && +q.minEmployees > +q.maxEmployees) {
    errors.push("minEmployees cannot be greater than maxEmployees");
  }

  if (errors.length > 0) {
    return next(new BadRequestError(errors.join(", ")));
  }

  next();
}

function validateJobQueryParams(req, res, next) {
  const q = req.query;

  const errors = [];
  const allowedFields = ["title", "minSalary", "hasEquity"];

  // Check for invalid fields
  for (let key in q) {
    if (!allowedFields.includes(key)) {
      errors.push(`Invalid field: ${key}`);
    }
  }

  if (q.minSalary && isNaN(+q.minSalary)) {
    errors.push("minSalary must be a number");
  }

  if (q.hasEquity !== undefined && q.hasEquity !== "true" && q.hasEquity !== "false") {
    errors.push("hasEquity must be 'true' or 'false'");
  }

  if (errors.length > 0) {
    return next(new BadRequestError(errors.join(", ")));
  }

  next();
}

module.exports = { validateQueryParams, validateJobQueryParams };
