jsonic
======
A homoiconic language based on LISP 1.5/SICP Scheme interpreters. The syntax is JSON.

Why? To understand Lisp better. To experiment with language design. To possibly use as a compilation target. For fun.

Here's a program that computes the sixth Fibonacci number:

    ["begin",
        ["define", "fib",
            ["lambda", ["n"],
                ["cond", [["eq", "n", 0], 0],
                         [["eq", "n", 1], 1],
                         ["T", ["+", ["fib", ["-", "n", 1]], ["fib", ["-", "n", 2]]]] ]]],
        ["fib", 6]]
