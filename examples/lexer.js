const chevrotain = require("chevrotain")

const createToken = chevrotain.createToken

const tokenVocabulary = {}

const Identifier = createToken({name: "Identifier", pattern: /[a-zA-Z]\w*/})
const Select = createToken({
      name: "Select",
      pattern: /SELECT/,
      longer_alt: Identifier
})
const From = createToken({
      name: "From",
      pattern: /FROM/,
      longer_alt: Identifier
})
const Where = createToken({
      name: "Where",
      pattern: /WHERE/,
      longer_alt: Identifier
})
const Comma = createToken({name: "Comma", pattern: /,/})
const GreaterThan = createToken({name: "GreaterThan", pattern:/>/})
const LessThan = createToken({name:"LessThan", pattern:/</})
const Integer = createToken({name: "Integer", pattern: /0|[1-9]\d*/})
const WhiteSpace = createToken({
      name: "WhiteSpace",
      pattern: /\s+/,
      group: chevrotain.Lexer.SKIPPED,
      line_breaks: true
})

let allTokens = [
  WhiteSpace, Select, From, Where, Comma, Identifier, Integer, GreaterThan,
  LessThan
]
const SelectLexer = new chevrotain.Lexer(allTokens)

allTokens.forEach(tokenType => {
  tokenVocabulary[tokenType.name] = tokenType
})

module.exports = {
  tokenVocabulary: tokenVocabulary,

  lexer: function(inputText){
    const lexingResult = SelectLexer.tokenize(inputText)

    if(lexingResult.errors.length > 0) {
      throw Error("Lexing errors detected")
    }

    return lexingResult
  }
}
