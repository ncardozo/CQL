const lexer = require("./lexer").lexer
const parser = require("./parser")

const inputText = "SELECT column1 FROM table2"

const lexingResult = lexer(inputText)

console.log(JSON.stringify(lexingResult, null, "\t"))

parser.parse(inputText)
