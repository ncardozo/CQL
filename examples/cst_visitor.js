const selectLexer = require("./lexer")
const parser = require("./parser")

const SelectParser = parser.SelectParser
const parserInstance = new SelectParser([], { outputCst: true })
const BaseSQLVisitor = parserInstance.getBaseCstVisitorConstructor()

class SQLtoAstVisitor extends BaseSQLVisitor {
    constructor() {
      super()
      this.validateVisitor()
    }

    selectStatement(ctx) {
      let select = this.visit(ctx.selectClause)
      let from = this.visit(ctx.fromClause)
      let where = this.visit(ctx.whereClause)

      return {
        type: "SELECT_STATEMENT",
        selectClause: select,
        fromClause: from,
        whereCLause: where
      }
    }

    selectClause(ctx) {
      const columns = ctx.Identifier.map(identToken => identToken.image)

      return { type: "SELECT_CLAUSE", columns: columns}
    }

    fromClause(ctx) {
      const tableName = ctx.Identifier[0].image

      return { type: "FROM_CLAUSE", table: tableName }
    }

    whereClause(ctx) {
      const condition = this.visit(ctx.expression)

      return { type: "WHERE_CLAUSE", condition: condition}
    }

    expression(ctx) {
      const lhs = this.visit(ctx.lhs[0])
      const op = this.visit(ctx.relationalOperator)
      const rhs = this.visit(ctx.rhs[0])

      return {
        type: "EXPRESSION",
        lhs: lhs,
        op: op,
        rhs: rhs
      }
    }

    atomicExpression(ctx) {
      if(ctx.Integer)
        return ctx.Integer[0].image
      else
        return ctx.Identifier[0].image
    }

    relationalOperator(ctx) {
      if(ctx.GreaterThan)
        return ctx.GreaterThan[0].image
      else
        return ctx.LessThan[0].image
    }
}

const toAstVisitorInstance = new SQLtoAstVisitor()

module.exports = {
  toAst: function(inputText) {
    const lexingResult = selectLexer.lexer(inputText)
    parserInstance.input = lexingResult.tokens
    
    const cst = parserInstance.selectStatement()
    console.log(JSON.stringify(parserInstance.errors, null, 2))
    if(parserInstance.errors.length > 0) {
      throw Error("Semantics Parsing errors detected\n" + parserInstance.errors[0].message)
    }

    const ast = toAstVisitorInstance.visit(cst)
    return ast
  }
}
