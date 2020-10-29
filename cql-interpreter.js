const cqlLexer = require("./cql-lexer")
const Parser = require("./cql-parser")

const parserInstance = new Parser.CQLParser([])
const BaseCQLVisitor = parserInstance.getBaseCstVisitorConstructor()

class CQLInterpreter extends BaseCQLVisitor {
  constructor(manager) {
    super()
    this.manager = manager
    this.validateVisitor()
  }

  query(ctx) {
    let str = ctx.Activate[0].image
    let operation = str.substring(0, str.length-1)
    let contextName = ctx.Identifier[0].image
    let predicate = this.visit(ctx.expressionStatement)
    let forStatement = this.visit(ctx.forStatement)
    if(predicate)
      switch(predicate) {
        case "unique": 
          let str = ``
          this.manager.contexts.forEach(context => {
            if(context.isActive())
              str += `${context.name}.deactivate();`
          })
          str += `${contextName}.${operation}();`
          return str
        case "between":
          break
      }
    else
      return `${contextName}.${operation}()`
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

      if(predExp)
        return predExp
      else return binExp
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
    let params = this.visit(ctx.predicateParameters)
    if(predicate)
      return predicate
    else
      return `${predicate}(${params})`
  }

  predicateParameters(ctx) {
    let conditions = ctx.Integer.map(intToken => intToken.image)
	  return {
      parameters: conditions
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
      else if(ctx.Unique)
        return ctx.Unique[0].image
      else
        return ctx.AllOf[0].image
  }

  binaryOperator(ctx) {
    if(ctx.Equals)
      return ctx.Equals[0].image
    else if(ctx.GreaterThan)
      return ctx.GreaterThan[0].image
    else if(ctx.LessThan)
      return cxt.LessThan[0].image
    else
      return ctx.And[0].image
  }
}

module.exports = {
  CQLInterpreter: CQLInterpreter,
  interpret: function(cqlInterpreter, inputText) {
    const lexingResult = cqlLexer.lexer(inputText)
    parserInstance.input = lexingResult.tokens
    
    const cst = parserInstance.query()

    if(parserInstance.errors.length > 0) {
      throw Error("Error building the CST\n" + parserInstance.errors[0].message)
    }

    const ast = cqlInterpreter.visit(cst)
    return ast
  }
}
