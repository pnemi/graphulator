var operators = {
    "+" : { precedence: 2, associativity : "left-to-right" },
    "-" : { unary : { precedence : 5, associativity : "right-to-left" },
            binary : { precedence : 2, associativity : "left-to-right" }},
    "*" : { precedence: 4, associativity : "left-to-right" },
    "/" : { precedence: 4, associativity : "left-to-right" },
    "^" : { precedence: 6, associativity : "right-to-left" }
};

var is = {

    whitespace: function (c) {
        "use strict";
        return c === " ";
    },

    separator: function (c) {
        "use strict";
        return c === "." || c === ",";
    },

    numeric: function (c) {
        "use strict";
        return (!isNaN(parseFloat(c)) && isFinite(c)) || is.separator(c);
    }

};

var parsexpr = {

    tokenize: function (str) {
        "use strict";

        var output = [],
            i = 0,
            c = "",
            num = "";

        while (i < str.length) {

            c = str.charAt(i);
            if (!is.whitespace(c)) {

                if (is.numeric(c)) {

                    num = "";
                    num += c;

                    i += 1;
                    while (i < str.length && is.numeric(str.charAt(i))) {
                        num += str.charAt(i);
                        i += 1;
                    }
                    i -= 1;

                    output.push({token: num, type: "number"});

                } else if (operators.hasOwnProperty(c)) {

                    if (c === "-") { // minus needs special care (substraction or negation?)

                        if (output.length === 0 ||
                                (output[output.length - 1].type !== "number" &&
                                output[output.length - 1].type !== "right_parenthesis")) {

                            output.push({token: c, type: "unary_prefix", opType: operators["-"].unary});
                        } else {
                            output.push({token: c, type: "binary", opType: operators["-"].binary});
                        }

                    } else {
                        output.push({token: c, type: "binary", opType: operators[c]});
                    }

                } else if (c === "(") {
                    output.push({token: c, type: "left_parenthesis"});
                } else if (c === ")") {
                    output.push({token: c, type: "right_parenthesis"});
                } else { throw "Unknown operator in: " + str; }

            }

            i += 1;

        }

        return output;

    },

    infixToPostfix: function (str) {
        "use strict";

        var infixQueue = this.tokenize(str),
            postfixQueue = [],
            tokenStack = [],
            c = "";

        while (infixQueue.length > 0) {

            c = infixQueue.shift();
            if (c.type === "number") {
                postfixQueue.push(c);
            } else if (c.type === "unary_prefix") {
                tokenStack.push(c);
            } else if (operators.hasOwnProperty(c.token)) {
                if (c.opType.associativity === "left-to-right") {
                    while (tokenStack.length > 0 && tokenStack[tokenStack.length - 1].type !== "left_parenthesis" && tokenStack[tokenStack.length - 1].opType.precedence >= c.opType.precedence) {
                        postfixQueue.push(tokenStack.pop());
                    }
                    tokenStack.push(c);
                } else if (c.opType.associativity === "right-to-left") {
                    while (tokenStack.length > 0 && tokenStack[tokenStack.length - 1].type !== "left_parenthesis" && tokenStack[tokenStack.length - 1].opType.precedence > c.opType.precedence) {
                        postfixQueue.push(tokenStack.pop());
                    }
                    tokenStack.push(c);
                }
            } else if (c.type === "left_parenthesis") {
                tokenStack.push(c);
            } else if (c.type === "right_parenthesis") {
                while (tokenStack[tokenStack.length - 1].type !== "left_parenthesis") {
                    postfixQueue.push(tokenStack.pop());
                }
                if (tokenStack[tokenStack.length - 1].type === "left_parenthesis") {
                    tokenStack.pop();
                } else {
                    throw "Mismatched brackets while converting to postfix in: " + infixQueue;
                }

            }

        }

        while (tokenStack.length > 0) {
            postfixQueue.push(tokenStack.pop());
        }

        tokenStack = null;

        return postfixQueue;
    },

    evaluate: function (str) {
        "use strict";

        var postfix = this.infixToPostfix(str),
            result = [],
            c = "",
            op = "";

        while (postfix.length > 0) {

            c = postfix.shift();

            if (c.type === "number") {
                result.push(parseFloat(c.token));
            } else if (operators.hasOwnProperty(c.token)) {

                op = result.pop();

                if (c.token === "+") {
                    result.push(result.pop() + op);
                } else if (c.token === "-") {

                    if (c.type === "unary_prefix") {
                        result.push(-1 * op);
                    } else if (c.type === "binary") {
                        result.push(result.pop() - op);
                    }

                } else if (c.token === "*") {
                    result.push(result.pop() * op);
                } else if (c.token === "/") {
                    result.push(result.pop() / op);
                } else if (c.token === "^") {
                    result.push(Math.pow(result.pop(), op));
                }
            } else {
                throw "Unknown token while evaluating in: " + postfix;
            }

        }
        return result[0];
    }

};