import { describe, it } from "node:test";
import assert from "node:assert/strict";
import optimize from "../src/optimizer.js";
import * as core from "../src/core.js";
import { ensureNumber } from "../src/optimizer.js";

const x = core.variable("x", core.intType);
const a = core.variable("a", core.arrayType(core.intType));
const neg = (x) => core.unary("-", x);
const array = (...elements) => core.arrayExpression(elements);
const program = core.program;
const voidInt = core.functionType([], core.intType);
const intFun = (body) =>
  core.functionDeclaration(core.fun("f", [], core.intType, [body]));
const return1p1 = core.returnStatement(core.binary("+", 1, 1, core.intType));
const return2 = core.returnStatement(2);

const tests = [
  ["folds +", core.binary("+", 8, 5), 13],
  ["folds -", core.binary("-", 8, 5), 3],
  ["folds *", core.binary("*", 8, 5), 40],
  ["folds /", core.binary("/", 8, 5), 1.6],
  ["folds **", core.binary("**", 8, 5), 32768],
  ["folds <", core.binary("<", 5, 8), true],
  ["folds <=", core.binary("<=", 5, 8), true],
  ["folds ==", core.binary("==", 5, 8), false],
  ["folds !=", core.binary("!=", 5, 8), true],
  ["folds >=", core.binary(">=", 5, 8), false],
  ["folds >", core.binary(">", 5, 8), false],
  ["optimizes +0", core.binary("+", x, 0), x],
  ["optimizes -0", core.binary("-", x, 0), x],
  ["optimizes *1", core.binary("*", x, 1), x],
  ["optimizes /1", core.binary("/", x, 1), x],
  ["optimizes *0", core.binary("*", x, 0), 0],
  ["optimizes 0/", core.binary("/", 0, x), 0],
  ["optimizes 0-", core.binary("-", 0, x), neg(x)],
  ["optimizes 1*", core.binary("*", 1, x), x],
  ["folds negation", core.unary("-", 8), -8],
  [
    "optimizes unary - with variable operand",
    core.unary("-", x),
    core.unary("-", x),
  ],
  ["optimizes 0 + x", core.binary("+", 0, x, core.intType), x],
  ["optimizes 1**", core.binary("**", 1, x), 1],
  ["optimizes **0", core.binary("**", x, 0), 1],
  ["folds %", core.binary("%", 10, 3, core.intType), 1],
  [
    "optimizes if-true",
    core.ifStatement(true, [core.printStatement(x)], []),
    [core.printStatement(x)],
  ],
  [
    "optimizes if-false",
    core.ifStatement(false, [], [core.printStatement(x)]),
    [core.printStatement(x)],
  ],
  [
    "if-false with no alternate returns []",
    core.ifStatement(false, [core.printStatement(x)], null),
    [],
  ],
  [
    "optimizes while-false",
    core.whileStatement(false, [core.printStatement(x)]),
    [],
  ],
  [
    "optimizes for with empty array",
    core.forStatement(x, array(), [core.printStatement(x)]),
    [],
  ],
  [
    "optimizes in function body",
    program([intFun(return1p1)]),
    program([intFun(return2)]),
  ],
  [
    "optimizes in array elements",
    array(1, core.binary("+", 2, 3), 4),
    array(1, 5, 4),
  ],
  [
    "optimizes in return",
    core.returnStatement(core.binary("+", 3, 4)),
    core.returnStatement(7),
  ],
  [
    "optimizes in print",
    core.printStatement(core.binary("+", 3, 4)),
    core.printStatement(7),
  ],
  [
    "optimizes function call arguments",
    core.functionCall(
      core.variable("foo", core.functionType([core.intType], core.intType)),
      [core.binary("+", 2, 3), core.unary("-", 5)]
    ),
    core.functionCall(
      core.variable("foo", core.functionType([core.intType], core.intType)),
      [5, -5]
    ),
  ],
];

describe("The optimizer", () => {
  for (const [scenario, before, after] of tests) {
    it(`${scenario}`, () => {
      assert.deepEqual(optimize(before), after);
    });
    it("does not re-optimize a node that's already being optimized", () => {
      const cyclic = core.binary("+", 1, 2, core.intType);
      cyclic.left = cyclic;
      cyclic.right = cyclic;
      const result = optimize(cyclic);
      assert.strictEqual(result, cyclic);
    });
    it("ensureNumber handles NumberLiteral", () => {
      const result = ensureNumber({ kind: "NumberLiteral", value: "42" });
      assert.strictEqual(result, 42);
    });
    it("returns node unchanged when no optimizer exists for kind", () => {
      const node = { kind: "UnknownKind" };
      const result = optimize(node);
      assert.strictEqual(result, node);
    });
  }
});
