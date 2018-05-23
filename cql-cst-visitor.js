const cqlLexer = require("./cql-lexer")
const Parser = require("./cql-parser")


const CQLParser = Parser.CQLParser
const parserInstance = new CQLParser([], {outputCst: true})
const BaseCQLVisitor = parserInstance.getBaseCstVisitorConstructor()

class CQLtoAstVisitor extends BaseCQLVisitor {
  constructor() {
    super()
    this.validateVisitor()
  }

  query(ctx) {
    let contextName = ctx.Identifier[0].image
    let operator = this.visit(ctx.expressionStatement)
    let forStatement = this.visit(ctx.forStatement)

    return {
      type: "QUERY",
      contextName: contextName,
      operator: operator,
      for: forStatement
    }
  }

  forStatement(ctx) {
    return {
      type: "FOR_STATEMENT",
      instance: ctx.Identifier[0].image
    }
  }

  expressionStatement(ctx) {
      let binExp = this.visit(ctx.binaryExpression)
      let predExp = this.visit(ctx.predicateExpression)

      return {
        type: "EXPRESSION",
        binaryExpression: binExp,
        predicateExpression: predExp
      }
  }

  binaryExpression(ctx) {
    let op = this.visit(ctx.binaryOperator)
    let value = ctx.Identifier[0].image

    return {
      type: "BINARY_EXPRESSION",
      operation: op,
      value: value
    }
  }

  predicateExpression(ctx) {
    let predicate = this.visit(ctx.predicateOperator)
    let conditions = ctx.Identifier[0].image//.map(identToken => identToken.image)

    return {
      type: "PREDICATE_EXPRESSION",
      conditions: conditions
    }
  }

  atomicExpression(ctx) {
    if(ctx.Integer)
      return ctx.Integer[0].image
    else
      return ctx.Identifier[0].image
  }

  predicateOperator(ctx) {
      if(ctx.Between)
        return ctx.Between[0].image
      else if(ctx.AtLeastOne)
        return ctx.AtLeastOne[0].image
      else if(ctx.AtMostOne)
        return ctx.AtMostOne[0].image
      else
        ctx.AllOf[0].image
  }

  binaryOperator(ctx) {
    if(ctx.Equals)
      return ctx.Equals[0].image
    else if(ctx.GreaterThan)
      return ctx.GreaterThan[0].image
    else
      return cxt.LessThan[0].image
  }
}

const toAstVisitorInstance = new CQLtoAstVisitor()

module.exports = {
  toAst: function(inputText) {
    const lexingResult = cqlLexer.lexer(inputText)
    parserInstance.input = lexingResult.tokens

    const cst = parserInstance.query()

    if(parserInstance.errors.length > 0) {
      throw Error("Error building the CST\n" + parserInstance.errors[0].message)
    }

    const ast = toAstVisitorInstance.visit(cst)
    return ast
  }
}
