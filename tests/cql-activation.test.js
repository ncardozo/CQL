const Trait = require('traits').Trait
const cop = require('context-traits')
const visitor = require("../cql-interpreter")

Context1 = new cop.Context({ name: "Context1"})

var statement

//Test single context activation
//This activation is global for all object instances
const contextActivation = "activate: Context1"
statement = visitor.visit(contextActivation)
test(`---SINGLE GLOBAL ACTIVATION: ${contextActivation} to activate Context1`, () => {
    eval(statement)
    expect(Context1.isActive()).toBe(true)
})

/*
//Single activation with name
const contextActivation2 = "activate: name = Context1"
ast = visitor.visit(contextActivation2)
console.log("---KEYWORD ACTIVATION" + JSON.stringify(ast, null, "\t"))

//Test single context activation
//This activation is global for all object instances
const contextDeactivation = "deactivate: Context1"
ast = visitor.visit(contextDeactivation)
console.log("---SINGLE DEACTIVATION" + JSON.stringify(ast, null, "\t"))

//Activate all contexts satisfying a range
const rangeActivation = "activate: date between(20170412, 20170425)"
ast = visitor.visit(rangeActivation)
console.log("---RANGE ACTIVATION" + JSON.stringify(ast, null, "\t"))

//Activate a contexts for an object instance
const instanceActivation = "activate: name = Landscape for: objInstance"
ast = visitor.visit(instanceActivation)
console.log("---INSTANCE ACTIVATION" + JSON.stringify(ast, null, "\t"))

//Activate a contexts for an object instance
//This activation is local to an object type
const classActivation = "activate: name = Landscape for: Bus"
ast = visitor.visit(classActivation)
console.log("---CLASS ACTIVATION" + JSON.stringify(ast, null, "\t"))
*/