const Trait = require('traits').Trait
const cop = require('context-traits')
const CQL = require("../cql-interpreter")
const cql = new CQL.CQLInterpreter(cop.Manager)

Context1 = new cop.Context({ name: "Context1"})
Context2 = new cop.Context({ name: "Context2"})
Context3 = new cop.Context({ name: "Context3"})
cop.Manager.contexts.push(Context1)
cop.Manager.contexts.push(Context2)
cop.Manager.contexts.push(Context3)

//query
test(`---PREDICATE UNIQUE: uniquely activate Context 2`, () => {
    //setup
    Context1.activate()
    let activationStatement = "activate: Context2 unique"
    let statement = CQL.interpret(cql, activationStatement)

    //function to activate
    console.log(statement)
    eval(statement)
    expect(Context1.isActive()).toBe(false)
    expect(Context2.isActive()).toBe(true)
    expect(Context3.isActive()).toBe(false)
})

