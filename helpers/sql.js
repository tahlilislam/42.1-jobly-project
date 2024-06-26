const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.
/**
 * Helper function for generating a SQL `SET` clause dynamically.
 * This function takes in an object of key-value pairs representing the fields to be updated and their new values
 * @param {Object} dataToUpdate ^^
 * and an optional mapping object to translate JavaScript-style field names to SQL column names. 
 *  @param {Object} jsToSql ^^
 * It returns an object containing the SQL `SET` clause and an array of the new values.
 * @example
 * // dataToUpdate: { firstName: "Aliya", age: 32 }
 * // jsToSql: { firstName: "first_name" }
 * // Returns: { setCols: '"first_name"=$1, "age"=$2', values: ["Aliya", 32] }
 * 
 * 
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
