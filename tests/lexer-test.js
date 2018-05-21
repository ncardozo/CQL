const lexer = require("../cql-lexer").lexer

const contextActivation = "activate: Context1"

//Test single context activation
const singleContextResult = lexer(contextActivation)
console.log(JSON.stringify(singleContextResult, null, "\t"))
