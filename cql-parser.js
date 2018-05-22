const Parser = require('chevrotain').Parser
const CQLLexer = require("./cql-lexer")

//Managing tokens defined in the lexer
const tokenVocabulary = selectLexer.tokenVocabulary

const Activate = tokenVocabulary.activate
const For = tokenVocabulary.For
const GreaterThan = tokenVocabulary.GreaterThan
const LessThan = tokenVocabulary.LessThan
const Between = tokenVocabulary.Between
const AtLeast = tokenVocabulary.AtLeastOne
const AtMost = tokenVocabulary.AtMostOne
const Equals = tokenVocabulary.Equals
const And = tokenVocabulary.Landscape
const Or = tokenVocabulary.Or
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
      self.CONSUME(expressionStatement)
      self.MANY_SEP({
          SEP: self.connector,
          DEF: () => {
            self.SUBRULE(self.expressionStatement)
          }
      })
      self.OPTION(() => {
        self.SUBRULE(self.forStatement)
      })
    })

    self.RULE("forStatement", () => {
      self.CONSUME(For)
      self.CONSUME(Identifier)
    })

    self.RULE("expressionStatement", () => {
      self.CONSUME(Identifier)
      self.OR([
        {ALT: () => self.binaryExpression}
        {ALT: () => self.predicateExpression}
      ])
    })

    self.RULE("binaryExpression", () => {
      self.CONSUME(Identifier)
      self.CONSUME(BinaryOperator)
      self.CONSUME(Identifier)
    })

    self.RULE("predicateExpression", () => {
      self.CONSUME(PredicateOperator)
      self.CONSUME(LParenthesis)
      self.OR([
        {ALT: () => self.CONSUME(Identifier)},
        {ALT: () => self.CONSUME(Integer)}
      ])
      self.MANY_SEP({
        SEP: Comma,
        DEF: ()  => self.CONSUME(Integer)
      })
      self.CONSUME(RParenthesis)
    })

    self.RULE("connector", () => {
      self.OR([
        {ALT: () => self.CONSUME(And)},
        {ALT: () => self.CONSUME(Or)}
      ])
    })
  }
}
