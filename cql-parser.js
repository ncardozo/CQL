const Parser = require('chevrotain').CstParser
const cqlLexer = require("./cql-lexer")

//Managing tokens defined in the lexer
const tokenVocabulary = cqlLexer.tokenVocabulary
const allTokens = cqlLexer.allTokens

const Activate = tokenVocabulary.Activate
const For = tokenVocabulary.For
const GreaterThan = tokenVocabulary.GreaterThan
const LessThan = tokenVocabulary.LessThan
const Between = tokenVocabulary.Between
const AtLeast = tokenVocabulary.AtLeastOne
const AtMost = tokenVocabulary.AtMostOne
const AllOf = tokenVocabulary.AllOf
const Unique = tokenVocabulary.Unique
const Equals = tokenVocabulary.Equals
const And = tokenVocabulary.And
const Or = tokenVocabulary.Or
const Comma = tokenVocabulary.Comma
const LParenthesis = tokenVocabulary.LParenthesis
const RParenthesis = tokenVocabulary.RParenthesis
const Identifier = tokenVocabulary.Identifier
const Integer = tokenVocabulary.Integer

class CQLParser extends Parser {
  constructor(input, config) {
    super(allTokens)
    const self = this

    self.RULE("query", () => {
      self.CONSUME(Activate)
      self.CONSUME2(Identifier)
      self.OPTION( () => {
      	self.SUBRULE(self.expressionStatement)
      })
      self.OPTION2(() => {
        self.SUBRULE2(self.forStatement)
      })
      //self.OPTION3( () => {
       // self.CONSUME3(CurrentScope)
     // })
    })

    self.RULE("forStatement", () => {
      self.CONSUME(For)
      self.CONSUME(Identifier)
    })

    self.RULE("expressionStatement", () => {
      self.AT_LEAST_ONE_SEP({
        SEP: Or,
        DEF: () => self.OR([
         {ALT: () => self.SUBRULE(self.binaryExpression) },
         {ALT: () => self.SUBRULE(self.predicateExpression) }
       ])
     })
    })

    self.RULE("binaryExpression", () => {
      self.SUBRULE(self.binaryOperator)
      self.CONSUME(Identifier)
    })

    self.RULE("predicateExpression", () => {
      self.SUBRULE(self.predicateOperator)
      self.OPTION(() =>
	      self.SUBRULE(self.predicateParameters)
      )
    })

    self.RULE("predicateParameters", () => {
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
    
    self.RULE("connector", () => {
      self.OR([
        {ALT: () => self.CONSUME(And)},
        {ALT: () => self.CONSUME(Or)}
      ])
    })

    self.RULE("predicateOperator", () => {
        self.OR([
          {ALT: () => self.CONSUME(Between)},
          {ALT: () => self.CONSUME(AtLeast)},
          {ALT: () => self.CONSUME(AtMost)},
          {ALT: () => self.CONSUME(AllOf)},
          {ALT: () => self.CONSUME(Unique)}
        ])
    })

    this.performSelfAnalysis(this)
  }
}

module.exports = {
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
