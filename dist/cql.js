/* 
 * Context Query Language - CQL v0.0.2
 * https://github.com/ncardozo/CQL
 * Copyright © 2018—2020, 01:23 © Uniandes
 * Licensed under Apache Licence, Version 2.0
 */ 

//-------------------
//------ LEXER ------
//-------------------
const chevrotain = require("chevrotain")
const Lexer = chevrotain.Lexer
const Parser = chevrotain.CstParser

const createToken = chevrotain.createToken

const tokenVocabulary = {}

const Activate = createToken({name: "Activate",  pattern: /activate:|deactivate:/})
const For = createToken({name: "For", pattern: /for:/})

//relational operators to filter out contexts
const GreaterThan = createToken({name: "GreaterThan", pattern:/>/})
const LessThan = createToken({name:"LessThan", pattern:/</})
const Between = createToken({name:"Between", pattern:/between/})
const AtLeast = createToken({name:"AtLeastOne", pattern:/atLeastOne/})
const AtMost = createToken({name:"AtMostOne", pattern:/atMostOne/})
const Unique = createToken({name:"Unique", pattern:/unique/})
const AllOf = createToken({name:"AllOf", pattern:/allOf/})
const Equals = createToken({name:"Equals", pattern:/=/})
const And = createToken({name: "And", pattern:/and/})

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

let allTokens = [WhiteSpace, 
  Activate, For, GreaterThan, LessThan, Between,
  AtLeast, AtMost, AllOf, Unique, Equals, And, Identifier, Integer, Comma, LParenthesis,
  RParenthesis]

const CQLLexer = new Lexer(allTokens)

allTokens.forEach(tokenType => {
  tokenVocabulary[tokenType.name] = tokenType
})

//--------------------
//------ PARSER ------
//--------------------
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
/*
    self.RULE("named context", () => {
      self.CONSUME(Name)
    })
*/
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
          {ALT: () => self.CONSUME(GreaterThan)},
          {ALT: () => self.CONSUME(And)}
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


//-------------------------
//------ INTERPRETER ------
//-------------------------
const parserInstance = new CQLParser([], {outputCst: true})
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
      /*return {
        type: "EXPRESSION",
        binaryExpression: binExp,
        predicateExpression: predExp
      }*/
  }

  binaryExpression(ctx) {
    console.log(ctx)
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
    /*return {
      type: "PREDICATE_EXPRESSION",
      predicate: predicate,
      conditions: params
    }*/
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
