var jsonic = require("../jsonic").jsonic,
    assert = require("assert");


exports["test symbol atom"] = function () {
    assert.equal(jsonic.eval(["atom", ["quote", "A"]]), "T");
}

exports["test number atom"] = function () {
    assert.equal(jsonic.eval(["atom", 2]), "T");
}

exports["test eq"] = function () {
    assert.equal(jsonic.eval(["eq", ["quote", "A"], ["quote", "A"]]), "T");
}

exports["test cons"] = function () {
    assert.deepEqual(jsonic.eval(["cons", ["quote", "A"], ["quote", "B"]]), ["A", "B"]);
}

exports["test car"] = function () {
    assert.deepEqual(jsonic.eval(["car", ["quote", ["A", "B"]]]), "A");
}

exports["test cdr"] = function () {
    assert.deepEqual(jsonic.eval(["cdr", ["quote", ["A", "B"]]]), ["B"]);
}

exports["test math operators"] = function () {
    assert.equal(jsonic.eval(["+",1,1,2,3]), 7);
    assert.equal(jsonic.eval(["-",3,2]), 1);
    assert.equal(jsonic.eval(["*",3,2]), 6);
    assert.equal(jsonic.eval(["/",6,2]), 3);
}

exports["test define returns NIL"] = function () {
    assert.deepEqual(jsonic.eval(["define", "x", 3]), []);
}

exports["test begin and defined variable value"] = function () {
    assert.deepEqual(jsonic.eval(["begin",
                ["define", "x", 3],
                "x"]), 3);
}

exports["test lambda define"] = function () {
    assert.deepEqual(jsonic.eval(["begin",
                ["define", "y", ["lambda", ["z"], ["car", "z"]]],
                ["y", ["quote", ["A","B"]]] ]), "A");
}

exports["test lambda application"] = function () {
    assert.deepEqual(jsonic.eval([["lambda", ["x","y","z"], ["+","x","y","z"]], 1, 2, 3]), 6);
}

exports["test list"] = function () {
    assert.deepEqual(jsonic.eval(["list", ["quote", "A"], ["quote", "B"], ["quote", "C"]]), ["A", "B", "C"]);
}

if (require.main === module) {
    require("os").exit(require("test").run(exports)); 
}

