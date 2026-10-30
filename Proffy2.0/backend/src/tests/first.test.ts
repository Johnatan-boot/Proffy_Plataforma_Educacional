import test from "node:test";
import assert from "node:assert/strict";

test("2 + 2 deve ser igual a 4", () => {
  // Arrange
  const a = 2;
  const b = 2;

  // Act
  const result = a + b;

  // Assert
   assert.equal(result, 4);
  //assert.equal(result, 5);
});