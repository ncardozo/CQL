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
    let op = ctx.Activate[0].image
    let operation = op.substring(0, op.length-1)
    let contextName = ctx.Identifier[0].image
    let predicate = this.visit(ctx.expressionStatement)
    let forStatement = this.visit(ctx.forStatement)
    //console.log(predicate)
    if(predicate) {
      let str = ''
      if(Array.isArray(predicate.predicate)) { //between
        this.manager.contexts.forEach(context => {
          let val = context.interface
          predicate.predicate.forEach( pred => {
            let min = pred.params[0]
            let max = pred.params[1]  
            if( min <= val && max >= val) {
              let cont = `${context}`
              cont = cont.split(" ")[0]
              str += `${cont}.${operation}();`
            }
          })
        })
        return str
      } else {
        switch(predicate.predicate) {
          case "unique": 
            this.manager.contexts.forEach(context => {
              if(context.isActive())
                str += `${context.name}.deactivate();`
            })
            str += `${contextName}.${operation}();`
            return str
          case "allOf":
            str += `${contextName}.${operation}();`
            return str
          default:
            break
        }
      } 
    } else
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
    let predicate
    if(Array.isArray(ctx.paramPredicate))
      predicate = ctx.paramPredicate.map(it => this.visit(it))
    else
      predicate = this.visit(ctx.uniPredicate)
    return {
      type: "PREDICATE_EXPRESSION",
      predicate: predicate,
    }
  }

  uniPredicate(ctx) {
    if(ctx.Unique)
      return ctx.Unique[0].image
    else
      return ctx.AllOf[0].image
  }
  
  paramPredicate(ctx) {
    let params = this.visit(ctx.predicateParameters)
	  let name
    if(ctx.Between)
        name = ctx.Between[0].image
    else if(ctx.AtLeastOne)
        name = ctx.AtLeastOne[0].image
    else 
        name = ctx.AtMostOne[0].image
    return {
      predName: name,
      params: params
    }
  }

  predicateParameters(ctx) {
    return ctx.Integer.map(intToken => intToken.image)
  }

  atomicExpression(ctx) {
    if(ctx.Integer)
      return ctx.Integer[0].image
    else
      return ctx.Identifier[0].image
  }

  binaryOperator(ctx) {
    if(ctx.Equals)
      return ctx.Equals[0].image
    else if(ctx.GreaterThan)
      return ctx.GreaterThan[0].image
    else if(ctx.In)
      return ctx.In[0].image
    else 
      return ctx.LessThan[0].image
  }
  
  connector(ctx) {
  	if(ctx.Or)
      return ctx.Or[0].image
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
