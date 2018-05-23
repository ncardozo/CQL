const visitor = require("../cql-cst-visitor")


let ast

//Test single context activation
//This activation is global for all object instances
const contextActivation = "activate: Context1"
ast = visitor.toAst(contextActivation)
console.log("---SINGLE ACTIVATION" + JSON.stringify(ast, null, "\t"))


//Single activation with name
const contextActivation2 = "activate: name = Context1"
ast = visitor.toAst(contextActivation2)
console.log("---KEYWORD ACTIVATION" + JSON.stringify(ast, null, "\t"))

//Test single context activation
//This activation is global for all object instances
const contextDeactivation = "deactivate: Context1"
ast = visitor.toAst(contextDeactivation)
console.log("---SINGLE DEACTIVATION" + JSON.stringify(ast, null, "\t"))

//Activate all contexts satisfying a range
const rangeActivation = "activate: date between(20170412, 20170425)"
ast = visitor.toAst(rangeActivation)
console.log("---RANGE ACTIVATION" + JSON.stringify(ast, null, "\t"))

//Activate a contexts for an object instance
const instanceActivation = "activate: name = Landscape for: objInstance"
ast = visitor.toAst(instanceActivation)
console.log("---INSTANCE ACTIVATION" + JSON.stringify(ast, null, "\t"))

//Activate a contexts for an object instance
//This activation is local to an object type
const classActivation = "activate: name = Landscape for: Bus"
ast = visitor.toAst(classActivation)
console.log("---CLASS ACTIVATION" + JSON.stringify(ast, null, "\t"))
