# Harmony

A musical programming language

![Harmony](https://github.com/user-attachments/assets/4f93782f-74a6-47a5-9e81-b37b6b349e9b)

Harmony is a programming language designed for music lovers, making coding as intuitive as composing a song! Its syntax flows effortlessly, much like the rhythm of a melody. Instead of simply typing code, imagine playing a keyboard, and rather than writing functions, envision crafting verses of a song. With Harmony, musicians can embrace coding in a way that feels natural, turning programming into a seamless extension of their musical creativity.

Visit my language website: https://owendewing.github.io/Harmony/

# Features

- Static Typing
- Object Oriented
- Supports Functions
- Based loosely off of javascript

# Data Types

| Data Type           | Harmony        |
| ------------------- | -------------- |
| boolean(True/False) | bool(hit/skip) |
| string              | lyrics         |
| number              | stream         |
| undefined           | silence        |

# Data Structures

| Data Structure | Harmony  |
| -------------- | -------- |
| dictionary     | playlist |
| array          | album    |

# Variables

| Variable Declaration | Harmony |
| -------------------- | ------- |
| var                  | note    |

# Functions

| Functions | Harmony |
| --------- | ------- |
| function  | song    |
| return    | encore  |
| print     | play    |

# Operators

| Operators | Harmony |
| --------- | ------- |
| >         | louder  |
| <         | quieter |
| >=        | forte   |
| <=        | piano   |
| ===       | inTune  |
| !==       | offKey  |

# Examples

# Square Function

```
function square(num) {
    return num * num;
}
```

```
song square(note num: stream) -> stream {
    encore num * num;
}
```

# Fibonacci Function

```
function fibonacci(n) {
  if (n <= 1) {
    return n;
  } else {
    return fibonacci(n - 1) + fibonacci(n - 2);
  }
}
```

```
song fibonacci(note n: stream) -> stream {
    if (n piano 1) {
        encore n;
    } else {
        encore fibonacci(n - 1) + fibonacci(n - 2);
    }
}
```

# Prime Numbers Function

```
function findPrimes(limit) {
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
}

```

```
song findPrimes(note limit: stream) {
    for (note num: stream = 2; num piano limit; num++) {
        note isPrime = hit;

        for (note div: stream = 2; div * div quieter num; div++) {
            if (num % div === 0) {
                isPrime = skip;
                break;
            }
        }

        if (isPrime) {
            play(num);
        }
    }
}
```

# Favorite Songs Function

```
function getFavoriteSongs(artist) {
    const mySongs = {
        "USA": "Washington, D.C.",
        "Canada": "Ottawa",
        "Mexico": "Mexico City"
    };

    return mySongs[artist];
}
```

```
song getFavoriteSongs(note artist: lyrics) -> lyrics {
    note mySongs: playlist = {
        "USA": "Washington, D.C.",
        "Canada": "Ottawa",
        "Mexico": "Mexico City"
    };

    encore mySongs[artist];
}
```

# Book Class

```
class Book {
    constructor(title, author) {
        this.title = title;
        this.author = author;
    }

    bookInfo() {
        return `Title: ${this.title}, Author: ${this.author}`;
    }
}

let myBook = new Book("1984", "George Orwell");
console.log(myBook.bookInfo());
```

```
composition Book {
    note title: lyrics;
    note author: lyrics;

    song bookInfo() -> lyrics {
        encore "Title: " + this.composition.title + ", Author: " + this.composition.author;
    }
}

note myBook: Book = Book("1984", "George Orwell");
play(myBook.bookInfo());

```
