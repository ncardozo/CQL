//https://sap.github.io/chevrotain/playground/
(function jsonGrammarOnlyExample() {
  const createToken = chevrotain.createToken;
  const Lexer = chevrotain.Lexer;
  // ----------------- Lexer -----------------
  const Activate = createToken({
    name: "Activate",  pattern: /activate:|deactivate:/
  })

  const For = createToken({
    name: "For",
    pattern: /for:/
  })

  //relational operators to filter out contexts
  const CurrentScope = createToken({name: "CurrentScope", pattern:/withCurrentScope/})
  const GreaterThan = createToken({name: "GreaterThan", pattern:/>/})
  const LessThan = createToken({name:"LessThan", pattern:/</})
  const Between = createToken({name:"Between", pattern:/between/})
  const AtLeast = createToken({name:"AtLeastOne", pattern:/atLeastOne/})
  const AtMost = createToken({name:"AtMostOne", pattern:/atMostOne/})
  const AllOf = createToken({name:"AllOf", pattern:/allOf/})
  const Equals = createToken({name:"Equals", pattern:/=/})
  const And = createToken({name: "And", pattern:/&/})

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


  const jsonTokens = [WhiteSpace, Activate, For, GreaterThan, LessThan, Between, CurrentScope,
  AtLeast, AtMost, AllOf, Identifier, Equals, And, Integer, Comma, LParenthesis,
  RParenthesis];

  const JsonLexer = new Lexer(jsonTokens, {
    // Less position info tracked, reduces verbosity of the playground output.
    positionTracking: "onlyStart",
    // Adds tokenClassName property to the output for easier debugging in the playground
    // Do not use this flag in a productive env, as it will hurt performance.
    debug: true
  });


  // ----------------- parser -----------------
  const Parser = chevrotain.Parser;

  class JsonParser extends Parser {
    constructor(input) {
      super(input, jsonTokens, {
        recoveryEnabled: true,
        // This will automatically create a Concrete Syntax Tree
        // You can inspect this structure in the output window.
        outputCst: true
      })

      const self = this;

      self.RULE("query", () => {
      self.CONSUME(Activate)
      self.CONSUME2(Identifier)
      self.OPTION( () => {
      	self.SUBRULE(self.expressionStatement)
      })
      self.OPTION2(() => {
        self.SUBRULE2(self.forStatement)
      })
      self.OPTION3( () => {
        self.CONSUME3(CurrentScope)
      })
    })

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

    self.RULE("predicateOperator", () => {
        self.OR([
          {ALT: () => self.CONSUME(Between)},
          {ALT: () => self.CONSUME(AtLeastOne)},
          {ALT: () => self.CONSUME(AtMostOne)},
          {ALT: () => self.CONSUME(AllOf)}
        ])
    })

      // very important to call this after all the rules have been setup.
      // otherwise the parser may not work correctly as it will lack information
      // derived from the self analysis.
      this.performSelfAnalysis();
    }

  }

  // for the playground to work the returned object must contain these fields
  return {
    lexer: JsonLexer,
    parser: JsonParser,
    defaultRule: "query"
  };
}())


//INPUT:
//activate: name = Curtains
