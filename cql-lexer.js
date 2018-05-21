const chevrotain = require("chevrotain")

const createToken = chevrotain.createToken

const tokenVocabulary = {}

const Activate = createToken({
  name: "Activate",
  pattern: /activate:|deactivate:/
})

const For = createToken({
  name: "For",
  pattern: /for:/
})

//relational operators to filter out contexts
const GreaterThan = createToken({name: "GreaterThan", pattern:/>/})
const LessThan = createToken({name:"LessThan", pattern:/</})
const Between = createToken({name:"Between", pattern:/between/})
const AtLeast = createToken({name:"AtLeastOne", pattern:/atLeastOne/})
const AtMost = createToken({name:"AtMostOne", pattern:/atMostOne/})
const Equals = createToken({name:"Equals", pattern:/=/})
const And = createToken({name: "And", pattern:/&/})
const Or = createToken({name:"Or", pattern:/\|/})

//special characters
const Comma = createToken({name: "Comma", pattern: /,/})
const LParenthesis = createToken({name:"LParenthesis", pattern:/\(/})
const RParenthesis = createToken({name:"RParenthesis", pattern: /\)/})
const WhiteSpace = createToken({
      name: "WhiteSpace",
      pattern: /\s+/,
      group: chevrotain.Lexer.SKIPPED,
      line_breaks: true
})

//Identifiers
const Identifier = createToken({
  name: "Identifier",
  pattern: /[a-zA-Z]\w*/,
})
const Integer = createToken({name: "Integer", pattern: /0|[1-9]\d*/})

let allTokens = [
  WhiteSpace, Activate, For, GreaterThan, LessThan, Between,
  AtLeast, AtMost, Identifier, Equals, And, Or, Integer, Comma, LParenthesis,
  RParenthesis
]

const CQLLexer = new chevrotain.Lexer(allTokens)

allTokens.forEach(tokenType => {
  tokenVocabulary[tokenType.name] = tokenType
})

module.exports = {
  tokenVocabulary: tokenVocabulary,
  lexer: function(inputQuery) {
    const lexingResult = CQLLexer.tokenize(inputQuery)

    if(lexingResult.errors.length > 0) {
      throw Error("The Given text cannot be tokenized:\n" + lexingResult.errors[0].message)
    }

    return lexingResult
  }
}
