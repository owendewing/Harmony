import { describe, it } from "node:test";
import { deepEqual } from "node:assert/strict";

describe("Interpreter", () => {
  it("return true for 1 == 1", () => {
    deepEqual(1, 1);
  });
});
