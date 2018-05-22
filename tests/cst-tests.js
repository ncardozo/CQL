const visitor = require("../cql-cst-visitor")


let ast

//Test single context activation
//This activation is global for all object instances
const contextActivation = "activate: Context1"
ast = visitor.toAst(contextActivation)
console.log(JSON.stringify(ast, null, "\t"))

/*
//Single activation with name
const contextActivation2 = "activate: name = Context1"
cqlParser.parse(contextActivation2)

//Test single context activation
//This activation is global for all object instances
const contextDeactivation = "deactivate: Context1"
cqlParser.parse(contextDeactivation)

//Activate all contexts satisfying a range
const rangeActivation = "activate: date between(20170412, 20170425)"
cqlParser.parse(rangeActivation)

//Activate a contexts for an object instance
const instanceActivation = "activate: name = Landscape for: objInstance"
cqlParser.parse(instanceActivation)

//Activate a contexts for an object instance
//This activation is local to an object type
const classActivation = "activate: name = Landscape for: Bus"
cqlParser.parse(classActivation)
*/
