const Trait = require('traits').Trait
const cop = require('context-traits')
const CQL = require("../cql-interpreter")
const cql = new CQL.CQLInterpreter(cop.Manager)

Context1 = new cop.Context({ name: "Context1"})

//Test single context activation
//This activation is global for all object instances
let activationStatement = "activate: Context1"
let statement = CQL.interpret(cql, activationStatement)
test(`---SINGLE GLOBAL ACTIVATION: ${activationStatement} to activate Context1`, () => {
    //setup
    //function to activate
    eval(statement)
    expect(Context1.isActive()).toBe(true)
})

/*
//Activate a contexts for an object instance
const instanceActivation = "activate: name = Landscape for: objInstance"
ast = visitor.visit(instanceActivation)
console.log("---INSTANCE ACTIVATION" + JSON.stringify(ast, null, "\t"))

//Activate a contexts for an object instance
//This activation is local to an object type
const classActivation = "activate: name = Landscape for: Bus"
ast = visitor.visit(classActivation)
console.log("---CLASS ACTIVATION" + JSON.stringify(ast, null, "\t"))

//Single activation with name
contextActivation = "activate: name = Context2"
statement = visitor.visit(contextActivation)
test(`---KEYWORD ACTIVATION: ${contextActivation} to activate Context1`, () => {
    eval(statement)
    expect(Context1.isActive()).toBe(true)
})
*/