# Harmony

A musical programming language

![Harmony](https://github.com/user-attachments/assets/4f93782f-74a6-47a5-9e81-b37b6b349e9b)

Harmony is a programming language designed for music lovers, making coding as intuitive as composing a song! Its syntax flows effortlessly, much like the rhythm of a melody. Instead of simply typing code, imagine playing a keyboard, and rather than writing functions, envision crafting verses of a song. With Harmony, musicians can embrace coding in a way that feels natural, turning programming into a seamless extension of their musical creativity.

# Features

- Static Typing
- Object Oriented
- Supports Functions
- Based off of javascript

# Data Types

| Data Type            | Harmony     |
| ------------------- | -------------- |
| boolean(True/False) | bool(hit/skip) |
| string              | lyrics         |
| number              | stream         |
| undefined           | silence        |

# Data Structures

| Data Structure    | Harmony |
| ---------- | ---------- |
| dictionary | playlist   |
| array      | album      |

# Variables

| Variable Declaration | Harmony |
| ------- | ---------- |
| let     | note       |
| const   | chord      |

# Functions

| Functions  | Harmony |
| -------- | ---------- |
| function | song       |
| return   | encore     |
| print    | play       |

# Operators

| Operators | Harmony |
| ------- | ---------- |
| >       | louder     |
| <       | quieter    |
| >=      | forte      |
| <=      | piano      |
| ===     | inTune     |
| !==     | offKey     |

# Examples

| Javascript | Harmony |
| ---------- | ------- |
| ``` function fibonacci(n) { if (n <= 1) { return n; } else { return fibonacci(n - 1) + fibonacci(n - 2); } } ```| ```song fibonacci(note n: stream) -> stream { if (n piano 1) { encore n; } else { encore fibonacci(n mute 1) amplify fibonacci(n mute 2); } } ```|
| ``` function findPrimes(limit) {
    for (let num = 2; num <= limit; num++) {
        let isPrime = true;
        for (let div = 2; div * div <= num; div++) {
            if (num % div === 0) {
                isPrime = false;
                break;
            }
        }
        if (isPrime) {
            console.log(num);
        }
    } 
  } ```
| ```song findPrimes(note limit: stream) { repeat (note num: stream = 2; num forte limit; num amplify 1) {
        note isPrime: hit = True;
        repeat (note div: stream = 2; div remix div quieter num; div amplify 1) {
            if (num tune div === 0) {
                isPrime = skip;
                stop;
            }
        }       
        if (isPrime) {
            play(num);
        }
    }
} ``` |
