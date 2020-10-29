const Trait = require('traits').Trait
const cop = require('context-traits')
const CQL = require("../cql-interpreter")
const cql = new CQL.CQLInterpreter(cop.Manager)

Context1 = new cop.Context({ name: "Context1"})
Context2 = new cop.Context({ name: "Context1"})
Context3 = new cop.Context({ name: "Context1"})
Context4 = new cop.Context({ name: "Context1"})
Context5 = new cop.Context({ name: "Context1"})


//Activate all contexts satisfying a range
//console.log("---RANGE ACTIVATION" + JSON.stringify(ast, null, "\t"))

let activationStatement = "activate: date between(20170412, 20170425)"
let statement = CQL.interpret(cql, activationStatement)
test(`---DATE RANGE ACTIVATION: ${activationStatement} to activate Contexts 1, 3, 4 (of 5)`, () => {
    //function to activate
    eval(statement)
    expect(Context1.isActive()).toBe(false)
})
