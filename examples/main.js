const lexer = require("./lexer").lexer
const parser = require("./parser")
const visitor = require("./cst_visitor")

//const inputText = "SELECT column1, column2 FROM table2 WHERE column2 > 3"

const inputText = "SELECT all FROM table"

//const lexingResult = lexer(inputText)
//console.log(JSON.stringify(lexingResult, null, "\t"))

//parser.parse(inputText)

let ast = visitor.toAst(inputText)

console.log(JSON.stringify(ast, null, "\t"))
