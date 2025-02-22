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
    "song getFavoriteSongs(note artist: lyrics) -> lyrics {}",
  ],
  ["function declaration with no parameters", "song emptySong() -> lyrics {}"],
  ["multiple statements", "note a: stream = 5; play (a);"],
  ["for loop", "for (i = 0; i quieter 10; i = i + 1) {}"],
  ["return statement with expression", "encore 5;"],
  ["return statement without expression", "encore;"],
  ["if statement", "if (a quieter 10) { play (a); }"],
  ["if-else statement", "if (a quieter 10) { play (a); } else { encore; }"],
  ["while loop", "while (i louder 100) { note j: stream = 3;}"],
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
  ["invalide for loop", "for (i = 0; i quieter 10) {}", /Line 1, col 25:/],
  ["invalid while loop", "while (i louder 100) {", /Line 1, col 23:/],
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
