import { describe, it } from "node:test";
import assert from "node:assert/strict";
import parse from "../src/parser.js";
import analyze from "../src/analyzer.js";
import optimize from "../src/optimizer.js";
import generate from "../src/generator.js";

function dedent(s) {
  return `${s}`.replace(/(?<=\n)\s+/g, "").trim();
}

const fixtures = [
  {
    name: "small",
    source: `
            note x: stream = 3 * 7;
            note y: bool = hit;
            note z: lyrics = "hello";
            `,
    expected: dedent`
            let x_1 = 21;
            let y_2 = true;
            let z_3 = "hello";
            `,
  },
  {
    name: "if",
    source: `
              note x: stream = 0;
              if (x == 0) { play("1");}
              if (x == 0) { play("1");} else { play("2");}
              if (x == 0) { play("1");} else if (x == 1) { play("2");} else { play("3");}
              `,
    expected: dedent`
              let x_1 = 0;
              if ((x_1 === 0)) {
              console.log("1");
              }
              if ((x_1 === 0)) {
              console.log("1");
              } else {
               console.log("2");
              }
              if ((x_1 === 0)) {
              console.log("1");
              } else
               if ((x_1 === 1)) {
               console.log("2");
               } else {
                console.log("3");
              }
              `,
  },
  {
    name: "while",
    source: `
              note i: stream = 3;
              while (i < 100) {
                note j: stream = 3;
              }
              `,
    expected: dedent`
              let i_1 = 3;
              while ((i_1 < 100)) {
                let j_2 = 3;
              }
              `,
  },
  {
    name: "functions",
    source: `
              note z: stream = 5;
              song f(x: stream) -> bool {
                if (x>10) {
                  play(x);
                  encore hit;
                }
                  encore skip;
              }
              `,
    expected: dedent`
              let z_1 = 5;
              function f_2(x_3) {
                if ((x_3 > 10)) {
                  console.log(x_3);
                  return true;
                }
                return false;
              }
              `,
  },
  {
    name: "arrays",
    source: `
              note a: album[stream] = [1, 2, 3];
              note b: album[lyrics] = ["hi", "hello"];`,
    expected: dedent`
              let a_1 = [1,2,3];
              let b_2 = ["hi","hello"];
              `,
  },
  {
    name: "for loops",
    source: `
              note musicList: album[stream] = [1, 2, 3];
              for (key in musicList) {
                play(3);
              }
              for (keykey in musicList) {
                if (3 < 4) {
                  play(3);
                }
              }
  
    `,
    expected: dedent`
              let musicList_1 = [1,2,3];
              for (let key_2 of musicList_1) {
                console.log(3);
              }
              for (let keykey_3 of musicList_1) {
                console.log(3);
              }
  `,
  },
  {
    name: "function call with number literal",
    source: `
      song square(x: stream) -> stream {
        encore x * x;
      }
      note y: stream = square(7);
    `,
    expected: dedent`
      function square_1(x_2) {
        return (x_2 * x_2);
      }
      let y_3 = square_1(7);
    `,
  },
  {
    name: "print number literal",
    source: `
      play(42);
    `,
    expected: dedent`
      console.log(42);
    `,
  },
  // {
  //   name: "class with optimized fields",
  //   source: `
  //     composition Point {
  //       x: stream;
  //       y: stream;
  //     }
  //     note p: Point = debut Point(1+2, 3*4);
  //     p.x = 5+6;
  //   `,
  //   expected: dedent`
  //     class Point_1 {
  //       constructor(x_2, y_3) {
  //         this.x_2 = x_2;
  //         this.y_3 = y_3;
  //       }
  //     }
  //     let p_4 = new Point_1(3, 12);
  //     p_4.x_2 = 11;
  //   `,
  // },
  // {
  //   name: "class instances",
  //   source: `
  //     composition Person {
  //       age: stream;
  //     }
  //     note p: Person = debut Person(20 + 5);
  //     p.age = 30;
  //   `,
  //   expected: dedent`
  //     class Person_1 {
  //       constructor(age_2) {
  //         this.age_2 = age_2;
  //       }
  //     }
  //     let p_3 = new Person_1(25);
  //     p_3.age_2 = 30;
  //   `,
  // },
  // {
  //   name: "field access",
  //   source: `
  //     composition Point {
  //       x: stream;
  //       y: stream;
  //     }
  //     note p: Point = debut Point(1, 2);
  //     play(p.x);
  //   `,
  //   expected: dedent`
  //     class Point_1 {
  //       constructor(x_2, y_3) {
  //         this.x_2 = x_2;
  //         this.y_3 = y_3;
  //       }
  //     }
  //     let p_4 = new Point_1(1,2);
  //     console.log(p_4.x_2);
  //   `,
  // },
];
describe("The code generator", () => {
  for (const fixture of fixtures) {
    it(`produces expected js output for the ${fixture.name} program`, () => {
      const actual = generate(optimize(analyze(parse(fixture.source))));
      assert.deepEqual(actual, fixture.expected);
    });
  }
});
