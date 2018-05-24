const Parser = require('chevrotain').Parser
const cqlLexer = require("./cql-lexer")

//Managing tokens defined in the lexer
const tokenVocabulary = cqlLexer.tokenVocabulary

const Activate = tokenVocabulary.Activate
const For = tokenVocabulary.For
const GreaterThan = tokenVocabulary.GreaterThan
const LessThan = tokenVocabulary.LessThan
const Between = tokenVocabulary.Between
const AtLeast = tokenVocabulary.AtLeastOne
const AtMost = tokenVocabulary.AtMostOne
const Equals = tokenVocabulary.Equals
const And = tokenVocabulary.Landscape
const Comma = tokenVocabulary.Comma
const LParenthesis = tokenVocabulary.LParenthesis
const RParenthesis = tokenVocabulary.RParenthesis
const Identifier = tokenVocabulary.Identifier
const Integer = tokenVocabulary.Integer

class CQLParser extends Parser {
  constructor(input, config) {
    super(input, tokenVocabulary, config)
    const self = this

    self.RULE("query", () => {
      self.CONSUME(Activate)
      self.CONSUME(Identifier)
      self.OPTION( () => {
      	self.SUBRULE(self.expressionStatement)
      })
      self.OPTION2(() => {
        self.SUBRULE(self.forStatement)
      })
      self.OPTION3( () => {
        self.CONSUME(CurrentScope)
      })
    })

    self.RULE("forStatement", () => {
      self.CONSUME(For)
      self.CONSUME(Identifier)
    })

    self.RULE("expressionStatement", () => {
      self.OR([
        {ALT: () => self.SUBRULE(self.binaryExpression) },
        {ALT: () => self.SUBRULE(self.predicateExpression) }
      ])
    })

    self.RULE("binaryExpression", () => {
      self.SUBRULE(self.binaryOperator)
      self.CONSUME(Identifier)
    })

    self.RULE("predicateExpression", () => {
      self.SUBRULE(self.predicateOperator)
      self.CONSUME(LParenthesis)
      self.AT_LEAST_ONE_SEP({
        SEP: Comma,
        DEF: () => self.OR([
          {ALT: () => self.CONSUME(Identifier)},
          {ALT: () => self.CONSUME(Integer)}
        ])
      })
      self.CONSUME(RParenthesis)
    })

    self.RULE("binaryOperator", () => {
        self.OR([
          {ALT: () => self.CONSUME(Equals)},
          {ALT: () => self.CONSUME(LessThan)},
          {ALT: () => self.CONSUME(GreaterThan)}
        ])
    })

    self.RULE("predicateOperator", () => {
        self.OR([
          {ALT: () => self.CONSUME(Between)},
          {ALT: () => self.CONSUME(AtLeastOne)},
          {ALT: () => self.CONSUME(AtMostOne)},
          {ALT: () => self.CONSUME(AllOf)}
        ])
    })

    Parser.performSelfAnalysis(this)
  }
}

const parserInstance = new CQLParser([])

module.exports = {
  parserInstance: parserInstance,
  CQLParser: CQLParser,
  parse: function(text) {
    const lexingResult = cqlLexer.lexer(text)
    //console.log("--SINGLE ACTIVATION\n" + JSON.stringify(lexingResult, null, "\t"))
    //console.log(lexingResult.tokens)
    parserInstance.input = lexingResult.tokens
    parserInstance.query()

    if(parserInstance.errors.length > 0) {
      throw new Error("Parsing error detected\n" + parserInstance.errors[0].message)
    } else {
      console.log("--- 200 OK. Expression parsed correctly")
    }
  }
}
