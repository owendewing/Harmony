import { describe, it } from "node:test";
import assert from "node:assert/strict";
import parse from "../src/parser.js";

// Programs expected to be syntactically correct
const syntaxChecks = [
  ["variable declarations", "note a: stream = 5;"],
  ["variable declaration without initialization", "note b: stream;"],
  ["print statement", 'play ("hello world");'],
  [
    "function declaration",
    "song getFavoriteSongs(a: stream) -> lyrics {play(3);}",
  ],
  [
    "function declaration with multiple parameters",
    "song getFavoriteSongs(a: stream, b: stream) -> lyrics {play(3);}",
  ],
  ["multiple statements", "note a: stream = 5; play (a);"],
  ["for loop", "for (key in array) {play(3);}"],
  ["return statement with expression", "encore 5;"],
  ["if statement", "if (hello < 4) {play(3);}"],
  ["if-else statement", "if (hello < 4) {play(3);} else {play(4);}"],
  [
    "if-else-if statement",
    "if (hello < 4) {play(3);} else if (hello > 5) {play(4);} else {play(3);}",
  ],
  ["while loop", "while (i < 100) { note j: stream = 3;}"],
];

// Programs with syntax errors that the parser will detect
const syntaxErrors = [
  ["invalid variable declaration", "note : stream;", /Line 1, col 6:/],
  ["invalid print statement", "play hello world;", /Line 1, col 6:/],
  [
    "invalid type in variable declaration",
    "note a: number = 5;",
    /Line 1, col 9:/,
  ],
  ["invalid assignment without identifier", "= 5;", /Line 1, col 1:/],
  [
    "invalid function declaration",
    "song getFavoriteSongs() {}",
    /Line 1, col 25:/,
  ],
  ["missing semi-colon after statement", "note a: stream", /Line 1, col 15:/],
  ["unexpected else without if", "else { encore; }", /Line 1, col 1:/],
  [
    "function with no body",
    "song getFavoriteSongs(note artist: lyrics) -> lyrics",
    /Line 1, col 53:/,
  ],
  ["invalide for loop", "for (i = 0; i quieter 10) {}", /Line 1, col 8:/],
  ["invalid while loop", "while (i louder 100) {", /Line 1, col 10:/],
];

describe("The parser", () => {
  for (const [scenario, source] of syntaxChecks) {
    it(`matches ${scenario}`, () => {
      assert(parse(source).succeeded());
    });
  }
  for (const [scenario, source, errorMessagePattern] of syntaxErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => parse(source), errorMessagePattern);
    });
  }
});
