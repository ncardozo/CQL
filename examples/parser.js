const chevrotain = require('chevrotain')

const allTokens = [
  WhiteSpace, Select, From, Where, Comma, Identifier, Integer, GreaterThan,
  LessThan
]

class SelectParser extends chevrotain.Parser {
  constructor(input) {
    super(input, allTokens)
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
      self.SUBRULE(self.atomicExpression, {LABEL: "rhs"})
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

    chevrotain.Parser.performSelfAnalysis(this)
  }
}

const parser = new SelectParser([])

function parseInput(text) {
  const lexingResult = SelectLexer.tokenize(text)
  parse.input = lexingResult.tokens
  parser.selectStatement()

  if(parser.errors.length > 0) {
    throw new Error("Parsing errors detected")
  }
}

const inputText = "SELECT column1 FROM table2"
parseInput(inputText)
