// A Homoiconic Language in JSON based on Lisp S-Expressions
// e.g. (A B C) = ["A", "B", "C"]

exports.jsonic = (function() {

var jsonic;

var NIL = [];
var initialContext = {"k":5};

// constant list
var clist = {"T":"T","F":"F","NIL":[]};

// context
function localContext (context, add) {
    var newScope = [{}];
    if (add) addContext(newScope, add);

    return [newScope[0],context];
}

function addContext (context, add) {
    if (add instanceof Array) {
        for (var i=0;i<add.length;i++) {
            context[0][add[i][0]] = add[i][1];
        }
    }
    return context;
}

function pairArgs (fn, args) {
    var o = [];
    var params = car(cdr(fn));
    for (var i=0;i<params.length;i++) {
        o.push([params[i], args[i]]);
    }
    return o;
}

function lookup (name, context) {
    return clist[name] ? clist[name] :
           lookup2(name, context);
}

function lookup2 (name, context) {
    if (!context[0]) throw 'undefined variable: '+name;
    return context[0][name] ? context[0][name] :
           lookup2(name, context[1]);
}

// Elementary Functions

// Cons
function cons(a, b) {
    return [a].concat(b);
}

function car(a) {
    if(!atom(a))
        return a[0];
}

function cadr (a) { return car(cdr(a)); }
function cdar (a) { return cdr(car(a)); }
function caddr (a) { return car(cdr(cdr(a))); }
function caar (a) { return car(car(a)); }
function caadr (a) { return car(car(cdr(a))); }
function cadar (a) { return car(cdr(car(a))); }

function cdr(a) {
    if(!atom(a))
        return a.slice(1);
}

//Predicates

// Atom
function atom(a) {
    return typeof a === 'string' || typeof a === 'number';
}

// eq
function eq(a, b) {
    if(atom(a) && atom(b))
        return a === b;
}


function evalquote (fn, args) {
    return apply(fn, args, localContext(initialContext));
}

function apply (fn, x, context) {
    return atom(fn) ?
            eq(fn,"car") ? caar(x) :
            eq(fn,"cdr") ? cdar(x) :
            eq(fn,"cons") ? cons(car(x), cadr(x)) :
            eq(fn,"atom") ? (atom(car(x)) ? "T" : "F") :
            eq(fn,"eq") ? (eq(car(x), cadr(x)) ? "T" : "F") :
            eq(fn,"+") ? (reduceOp(add, x)) :
            eq(fn,"-") ? (reduceOp(sub, x)) :
            eq(fn,"*") ? (reduceOp(mul, x)) :
            eq(fn,"/") ? (reduceOp(div, x)) :
            apply(evall(fn, context), x, context) :
        eq(car(fn),"lambda") ? evall(caddr(fn), localContext(caddr(cdr(fn)), pairArgs(fn, x))) :
        NIL ;
}

function evall (form, context) {
    return knull(form) ? NIL :
           numberp(form) ? form :
           atom(form) ? lookup(form, context) :
           atom(car(form)) ?
                eq(car(form),"quote") ? car(cdr(form)) :
                eq(car(form),"'") ? car(cdr(form)) :
                eq(car(form),"cond") ? evalcond(cdr(form), context) :
                eq(car(form),"begin") ? evalseq(cdr(form), context) :
                eq(car(form),"lambda") ? makeProcedure(cdr(form), context) :
                eq(car(form),"define") ? define(cdr(form), context) :
                eq(car(form),"debugger") ? repl(context) :
                eq(car(form),"list") ? evallist(cdr(form), context) :
                apply(car(form), evallist(cdr(form), context), context) :
           apply(car(form), evallist(cdr(form), context), context);
}

function evalcond (c, a) {
    return evall(caar(c),a) === "T" ? evall(cadar(c),a) :
            evalcond(cdr(c),a);
}

function evallist (m,a) {
    return knull(m) ? NIL :
            (cons(evall(car(m), a), evallist(cdr(m), a)));
}

function reduceOp (fn,m) {
    return knull(cdr(m)) ? car(m) :
            (fn(car(m), reduceOp(fn,cdr(m))));
}

function add (a, b) { return a + b; }
function sub (a, b) { return a - b; }
function mul (a, b) { return a * b; }
function div (a, b) { return a / b; }

// evaluates a sequence of expressions and returns the value of the last expression
function evalseq (m,a) {
    return knull(cdr(m)) ? evall(car(m), a) :
            (evall(car(m), a), evalseq(cdr(m), a));
}

// associates a value with a variable name in the current context and returns the value
function define (exp, a) {
    addContext(a, [[car(exp), evall(cadr(exp), a)]]), lookup(car(exp), a);
    return NIL;
}

function makeProcedure (exp, a) {
    return ["lambda",
               car(exp), // parameter list
               atom(caadr(exp)) ? cadr(exp) : ["begin",cadr(exp)], // body as an expr, or expr list
               localContext(a)]; // create new local scope
}

// auxiliary functions

function numberp (val) {
    return typeof val === 'number';
}

function equal (x,y) {
    return atom(x) && atom(y) ? eq(x,y) : equal(car(x), car(y)) ? equal(cdr(x), cdr(y)) : false;
}

function knull (x) {
    return x.length === 0;
}


// program functions

function createContext () {
    return  localContext(initialContext);
}


function repl (context) {
    print('jsonic REPL. Enter \'quit\' to exit.');
    var inp = readline();
    while (inp !== 'quit') {
        printexpr(evall(JSON.parse(inp), context));
        inp = readline();
    }
}

function printexpr (exp) {
    print(JSON.stringify(exp));
}

jsonic = {
    eval: function (exp) { return evall(exp, createContext()); },
    repl: function () { return repl(createContext()); }
};

return jsonic;

})();
