const Trait = require('traits').Trait
const cop = require('context-traits')
const CQL = require("../cql-interpreter")
const cql = new CQL.CQLInterpreter(cop.Manager)

Context1 = new cop.Context({ name: "Context1"})


//Test single context activation
//This activation is global for all object instances
let activationStatement = "deactivate: Context1"
let statement = CQL.interpret(cql, activationStatement)
test(`---SINGLE DEACTIVATION: ${activationStatement} to deactivate Context1`, () => {
    //setup
    Context1.activate()
    //function to activate
    eval(statement)
    expect(Context1.isActive()).toBe(false)
})
