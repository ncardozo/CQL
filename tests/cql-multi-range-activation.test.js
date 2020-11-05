const Trait = require('traits').Trait
const cop = require('context-traits')
const CQL = require("../cql-interpreter")
const cql = new CQL.CQLInterpreter(cop.Manager)

Context1 = new cop.Context({ name: "Context1", interface: 2})
Context2 = new cop.Context({ name: "Context2", interface: 5})
Context3 = new cop.Context({ name: "Context3", interface: 4})
Context4 = new cop.Context({ name: "Context4", interface: 1})
Context5 = new cop.Context({ name: "Context5", interface: 8})
cop.Manager.contexts.push(Context1)
cop.Manager.contexts.push(Context2)
cop.Manager.contexts.push(Context3)
cop.Manager.contexts.push(Context4)
cop.Manager.contexts.push(Context5)


let activationStatement = "activate: interface (between(2,3),between(6,9))"
let statement = CQL.interpret(cql, activationStatement)
test(`---OR RANGES ACTIVATION: ${activationStatement} to activate Contexts 1, 2 (of 5)`, () => {
    //function to activate
    eval(statement)
    expect(Context1.isActive()).toBe(true)
    expect(Context2.isActive()).toBe(false)
    expect(Context3.isActive()).toBe(false)
    expect(Context4.isActive()).toBe(false)
    expect(Context5.isActive()).toBe(true)
})
