### Parsexpr ~ Math Parser ###

#### Features ####
- Binary operations:
    - __+__ (addition)
    - __-__ (substraction)
    - __*__ (multiplication)
    - __/__ (division)
    - __^__ (exponentiation)
- Unary operations:
    - __-__ (negation)
- Bracketed expression
- Shunting yard Dijkstra's algoritm based

####Usage:####
```javascript
var expression = "3 + 4 * 2 / ( 1 - 5 ) ^ 2 ^ 3";
var result = parsexpr.evaluate( expression ); // <- 3.0001220703125
```

####Algorithm walkthrough####
- Given a string mathematical equation, from left to right, scan for each token.
- If token is an operand, push the token onto the output array.
    - If token is a unary postfix operator, push it onto the output array.
    - If token is a unary prefix operator, push it onto the stack array.
    - If token is a function, push it onto the stack array.
    - If token is an operator:
        - If operator is left-associative (i.e. +, -, *, /):
            - While stack array contains an operator that has equal/higher precedence than the token, pop the stack array and push the popped item onto output array.
            - Push token onto stack array.
        - If operator is right-associative (i.e. ^, EE, v, -):
            - While stack array contains an operator that has higher precedence than the token, pop stack array and push popped item onto output array.
            - Push token onto stack array.
    - If token is a parenthesis:
        - If left-parenthesis “(“:
            - Push token onto stack array.
        - If right-parenthesis “)”:
            - While top of stack array is not a left-parenthesis, pop each item from stack array and push popped item onto output array.
            - Now pop stack array (popped item should be a left-parenthesis).
            - If top of stack array is now a function, pop that and push it onto output array.
- Pop remaining of the stack array and push them one by one onto output array.
- Output array is now a stack data structure representing a postfix math notation, or RPN. Stack array should now be empty and can be deleted from memory.