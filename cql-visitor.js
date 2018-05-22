const cqlLexer = require("./cql-lexer")
const Parser = require("./cql-parser")


const cqlParser = Parser.CQLParser
const parserInstance = new CQLParser([], {outputCst: true})
const BaseCQLVisitor = parseInstance.getBaseCstVisitorConstructor()

class CQLtoAstVisitor extends BaseSQLVisitor {
  constructor() {
    super()
    this.validareVisitor()
  }

  query(ctx) {
    let properties = this.visit(ctx.expression)
    let forStatement = this.visit(ctx.forStatement)
    
    return {
      type: "QUERY",
      properties: property,
      for: forStatement
    }
  }
}
