import { describe, it } from "node:test";
import assert from "node:assert/strict";
import parse from "../src/parser.js";
import analyze from "../src/analyzer.js";

const semanticChecks = [
  ["variable declaration", "note a: stream = 5;"],
  ["variable declaration without initialization", "note b: stream;"],
  ["print boolean literal", "play (hit);"],
  ["print int literal", "play (5);"],
  ["print string literal", 'play ("hello world");'],
  [
    "function declaration",
    "song getFavoriteSongs(a: stream) -> lyrics {play(3);}",
  ],
  ["boolean type variable", "note flag: bool = hit;"],
  ["string type variable", 'note message: lyrics = "hello";'],
  ["initialize int array", "note musicList: album[stream] = [1, 2, 3];"],
  [
    "initialize string array",
    'note musicList: album[lyrics] = ["a", "b", "c"];',
  ],
  [
    "for loop",
    "note musicList: album[stream] = [1, 2, 3]; for (key in musicList) {play(3);}",
  ],
  [
    "for loop with if statement",
    "note musicList: album[stream] = [1, 2, 3]; for (key in musicList) {if (3 < 4) {play(3);}}",
  ],
  ["while loop", "note i: stream = 3; while (i < 100) { note j: stream = 3;}"],
  [
    "while loop with if statement",
    "note i: stream = 3; while (i < 100) { if (3 < 4) {play(3);} }",
  ],
  ["if statement", "if (3 < 4) {play(3);}"],
  ["if-else statement", "if (3 < 4) {play(3);} else {play(4);}"],
  [
    "if-else-if statement",
    "if (3 < 4) {play(3);} else if (6 > 5) {play(4);} else {play(3);}",
  ],
  [
    "if statement with declaration",
    "note a: stream = 5; if (a < 4) {play(3);}",
  ],
  [
    "function with return",
    "song getFavoriteSongs(a: stream) -> stream { encore 5; }",
  ],
  [
    "function with no parameters",
    "song getFavoriteSongs() -> stream { encore 5; }",
  ],
  ["multiple statements", "note a: stream = 5; play (a);"],
  ["print variable", "note a: stream = 5; play (a);"],
  ["class declaration", "composition Track {title: lyrics;}"],
  [
    "class instantiation after declaration",
    "composition Track {} note track = debut Track;",
  ],
  [
    "class with multiple fields",
    "composition Track {title: lyrics; artist: lyrics;}",
  ],
  ["class with no fields", "composition Track {}"],
  [
    "field access",
    "composition Track {releasedate: stream;} note track = debut Track; track.releasedate = 3;",
  ],
  ["exponentiation", "play(2 ** 3);"],
  ["void function", "song getFavoriteSongs() -> mute { encore; }"],
  [
    "nested if-else statement",
    "if (3 < 4) { if (5 > 2) { play(3); } else { play(4); } } else { play(5); }",
  ],
  [
    "fibonacci function",
    "song fibonacci(note n: stream) -> stream {if (n < 1) {encore n;} else {encore fibonacci(n - 1) + fibonacci(n - 2);}}",
  ],
];
const semanticErrors = [
  ["bad types for +", "note a: stream = 5 + hit;", /Incompatible types/],
  ["bad types for -", "note b: lyrics = 4 - skip;", /Incompatible types/],
  ["bad types for *", "note c: stream = 5 * skip;", /Expected a number/],
  ["bad types for /", "note c: stream = 5 / skip;", /Expected a number/],
  ["bad types for %", "note c: stream = 5 % skip;", /Expected a number/],
  [
    "class instantiation without class",
    "note track = debut Track;",
    /not declared/,
  ],
  [
    "class instantiation with non-class",
    "note track = debut 5;",
    /not declared/,
  ],
  [
    "field access on non-class",
    "note a: stream; a.releasedate = 3;",
    /Expected a class/,
  ],
  [
    "return statement not in function",
    "encore 5;",
    /Return can only appear inside a function/,
  ],
  [
    "assign string to int variable",
    'note a: stream = "hello";',
    /Incompatible types/,
  ],
  [
    "assign int to string variable",
    "note a: lyrics = 5;",
    /Incompatible types/,
  ],
  [
    "assign boolean to int variable",
    "note a: stream = hit;",
    /Incompatible types/,
  ],
  ["assign int to boolean variable", "note a: bool = 5;", /Incompatible types/],
  [("if condition not boolean", "if (5) { play(3); }", /Incompatible types/)],
  [
    "while condition not boolean",
    "while (5) { play(3); }",
    /Expected a boolean/,
  ],
  [
    "for loop with non-array",
    "for (key in 5) { play(3); }",
    /Expected an array/,
  ],
  [
    "for loop with non-declared array",
    "for (key in musicList) {play(3);}",
    /not declared/,
  ],
  ["undeclared variable", "play (a);", /not declared/],
  [
    "redeclared variable",
    "note a: stream = 5; note a: stream = 5;",
    /already declared/,
  ],
  [
    "variable used before declaration",
    "play (a); note a: stream = 5;",
    /not declared/,
  ],
  [
    "Calling a non-function",
    "note a: stream = 5; a(3);",
    /Expected a function/,
  ],
];
describe("The analyzer", () => {
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(parse(source)));
    });
  }
  for (const [scenario, source, errorMessagePattern] of semanticErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => analyze(parse(source)), errorMessagePattern);
    });
  }
});
