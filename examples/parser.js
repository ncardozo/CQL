const Parser = require('chevrotain').Parser
const selectLexer = require("./lexer")

const tokenVocabulary = selectLexer.tokenVocabulary

const Select = tokenVocabulary.Select
const From = tokenVocabulary.From
const Where = tokenVocabulary.Where
const Identifier = tokenVocabulary.Identifier
const Integer = tokenVocabulary.Integer
const GreaterThan = tokenVocabulary.GreaterThan
const LessThan = tokenVocabulary.LessThan
const Comma = tokenVocabulary.Comma

class SelectParser extends Parser {
  constructor(input, config) {
    super(input, tokenVocabulary, config)
    const self = this
    self.RULE("selectStatement", () => {
      self.SUBRULE(self.selectClause)
      self.SUBRULE(self.fromClause)
      self.OPTION( () => {
        self.SUBRULE(self.whereClause)
      })
    })

    self.RULE("selectClause", () => {
      self.CONSUME(Select)
      self.AT_LEAST_ONE_SEP({
        SEP: Comma,
        DEF: () => {
          self.CONSUME(Identifier)
        }
      })
    })

    self.RULE("fromClause", () => {
      self.CONSUME(From)
      self.AT_LEAST_ONE_SEP({
        SEP: Comma,
        DEF: () => {
          self.CONSUME(Identifier)
        }
      })
    })

    self.RULE("whereClause", () => {
      self.CONSUME(Where)
      self.SUBRULE(self.expression)
    })

    self.RULE("expression",  () => {
      self.SUBRULE(self.atomicExpression, {LABEL: "lhs"})
      self.SUBRULE(self.relationalOperator)
      self.SUBRULE2(self.atomicExpression, {LABEL: "rhs"})
    })

    self.RULE("atomicExpression", () => {
      self.OR([
        {ALT: () => self.CONSUME(Integer)},
        {ALT: () => self.CONSUME(Identifier)}
      ])
    })

    self.RULE("relationalOperator", () => {
      self.OR([
        {ALT: () => self.CONSUME(GreaterThan)},
        {ALT: () => self.CONSUME(LessThan)}
      ])
    })

    Parser.performSelfAnalysis(this)
  }
}

const parserInstance = new SelectParser([])

module.exports = {
  parserInstance: parserInstance,
  SelectParser: SelectParser,
  parse: function(text) {
    const lexingResult = selectLexer.lexer(text)
    parserInstance.input = lexingResult.tokens
    //const cstOutput = 
    parserInstance.selectStatement()

    if(parserInstance.errors.length > 0) {
      throw new Error("Parsing errors detected" + parserInstance.errors[0].message)
    } else {
      //return cstOutput
      console.log("---OK. Expression parsed correctly")
    }
  }
}
