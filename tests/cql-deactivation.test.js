const Trait = require('traits').Trait
const cop = require('context-traits')
const visitor = require("../cql-interpreter")

Context1 = new cop.Context({ name: "Context1"})


//Test single context activation
//This activation is global for all object instances
let activationStatement = "deactivate: Context1"
let statement = visitor.visit(activationStatement)
test(`---SINGLE DEACTIVATION: ${activationStatement} to deactivate Context1`, () => {
    //setup
    Context1.activate()
    //function to activate
    eval(statement)
    expect(Context1.isActive()).toBe(false)
})
