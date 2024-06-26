const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");

describe("sqlForPartialUpdate", function () {
  test("function tested with data provided and WITH jsToSql mapping",
    function () {
      const dataToUpdate = { firstName: "Aliya", age: 32 };
      const jsToSql = { firstName: "first_name" };

      const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

      expect(result).toEqual({
        setCols: '"first_name"=$1, "age"=$2',
        values: ["Aliya", 32],
      });
    });

  test("function tested with data provided WITHOUT jsToSql mapping",
    function () {
      const dataToUpdate = { firstName: "Aliya", age: 32 };

      const result = sqlForPartialUpdate(dataToUpdate, {});

      expect(result).toEqual({
        setCols: '"firstName"=$1, "age"=$2',
        values: ["Aliya", 32],
      });
    });

  test("works: data provided with partial jsToSql mapping", function () {
    const dataToUpdate = { firstName: "Aliya", age: 32, lastName: "Smith" };
    const jsToSql = { firstName: "first_name", lastName: "last_name" };

    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(result).toEqual({
      setCols: '"first_name"=$1, "age"=$2, "last_name"=$3',
      values: ["Aliya", 32, "Smith"],
    });
  });

  test("throws error: no data", function () {
    try {
      sqlForPartialUpdate({}, {});
      throw new Error("Test should not reach here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
      expect(err.message).toBe("No data");
    }
  });
});
