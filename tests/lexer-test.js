const lexer = require("../cql-lexer").lexer


//Test single context activation
//This activation is global for all object instances
const contextActivation = "activate: Context1"
const singleContextResult = lexer(contextActivation)
console.log("--SINGLE ACTIVATION\n" + JSON.stringify(singleContextResult, null, "\t"))

//Single activation with name
const contextActivation2 = "activate: name = Context1"
const singleContext2Result = lexer(contextActivation2)
console.log("--SINGLE KEYWORD ACTIVATION\n" + JSON.stringify(singleContext2Result, null, "\t"))

//Single activation with two properties
const contextActivation3 = "activate: name = Context1 & activationCount < 0"
const singleContext3Result = lexer(contextActivation3)
console.log("--MULTI-KEYWORD ACTIVATION\n" + JSON.stringify(singleContext3Result, null, "\t"))

//Test single context activation
//This activation is global for all object instances
const contextDeactivation = "deactivate: Context1"
const singleContextDeactResult = lexer(contextDeactivation)
console.log("--SINGLE DEACTIVATION\n" + JSON.stringify(singleContextDeactResult, null, "\t"))


//Activate all contexts satisfying a range
const rangeActivation = "activate: date between(20170412, 20170425)"
const rangeResult = lexer(rangeActivation)
console.log("--RANGE RESULT\n" + JSON.stringify(rangeResult, null, "\t"))

//Activate a contexts for an object instance
const instanceActivation = "activate: name = Landscape for: objInstance"
const instanceResult = lexer(instanceActivation)
console.log("--INSTANCE ACTIVATION\n" + JSON.stringify(instanceResult, null, "\t"))

//Activate a contexts for an object instance
//This activation is local to an object type
const classActivation = "activate: name = Landscape for: Bus"
const classResult = lexer(classActivation)
console.log("--ALL INSTANCES ACTIVATION\n" + JSON.stringify(classResult, null, "\t"))
