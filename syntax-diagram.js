(function calculatorExampleCst() {
  "use strict";
  
  const createToken = chevrotain.createToken;
  const tokenMatcher = chevrotain.tokenMatcher;
  const Lexer = chevrotain.Lexer;
  const CstParser = chevrotain.CstParser;

  //-------- LEXER ---------
  const tokenVocabulary = {}
	const Activate = createToken({name: "Activate",  pattern: /activate:|deactivate:/})
	const For = createToken({  name: "For",  pattern: /for:/})

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
const Or = createToken({name: "Or", pattern:/or/})
const In = createToken({name: "In", pattern:/in/})

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
const Identifier = createToken({name: "Identifier",  pattern: /[a-zA-Z]\w*/,})
const Integer = createToken({name: "Integer", pattern: /0|[1-9]\d*/})

let allTokens = [WhiteSpace, 
  Activate, For, GreaterThan, LessThan, Between,
  AtLeast, AtMost, AllOf, Unique, Equals, And, Or, In, Identifier, Integer, Comma, LParenthesis,
  RParenthesis]
  
  const CQLLexer = new Lexer(allTokens);
  

  // ----------------- parser -----------------
  // Note that this is a Pure grammar, it only describes the grammar
  // Not any actions (semantics) to perform during parsing.
  class CQLParser extends CstParser {
  constructor(input, config) {
    super(allTokens)
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
      self.OR([
        	{ALT: () => self.CONSUME(Identifier) },
        	{ALT: () => self.SUBRULE(self.predicateExpression) }
      	])
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
        {ALT: () => self.CONSUME(In)}
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
    // wrapping it all together
  // reuse the same parser instance.
  const parser = new CQLParser([]);


  
  // ----------------- Interpreter -----------------
  const BaseCstVisitor = parser.getBaseCstVisitorConstructor()
 
  const parserInstance = new CQLParser([], {outputCst: true})

class CQLInterpreter extends BaseCstVisitor {
  constructor() {
    super()
    this.validateVisitor()
  }

  query(ctx) {
    let str = ctx.Activate[0].image
    let operation = str.substring(0, str.length-1)
    let contextName = ctx.Identifier[0].image
    let predicate = this.visit(ctx.expressionStatement)
    let forStatement = this.visit(ctx.forStatement)

    return {
      type: "QUERY",
      request: str,
      contextName: contextName,
      operator: operation,
      predicates: predicate,
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
      //let predExp = this.visit(ctx.predicateExpression)
      let expressions = ctx.predicateExpression.map(stmt => this.visit(ctx.predicateExpression))
      return {
        type: "EXPRESSION",
        binaryExpression: binExp,
        predicateExpression: expressions
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
    let params = this.visit(ctx.predicateParameters)
    
    return {
      type: "PREDICATE_EXPRESSION",
      predicate: predicate,
      conditions: params
    }
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

const toAstVisitorInstance = new CQLInterpreter()

  // for the playground to work the returned object must contain these fields
  return {
    lexer: CQLLexer,
    parser: CQLParser,
    visitor: CQLInterpreter,
    defaultRule: "query"
  };
}())


//INPUT:
//activate: name = Curtains


