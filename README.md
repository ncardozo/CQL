# Context Query Language (CQL) Semantics #

This project defines a parser for the Context Query Language (CQL). CQL offers a declarative language for __context activation__ to context-oriented languages


### Rules
The following summarize the semantics rules for the language
~~~~
acivateStatement :: ("activate"|"deactivate")":" (Expression | Identifier) (Connector Expression)* (forStatement)?

forStatement :: "for:" Identifier

Expression :: Identifier RelationalOperator ( Identifier | "("Identifier "," Identifier")" )

Identifier :: [a-zA-Z]*

Connector :: "&" | "|"

RelationalOperator :: "between" | "=" | "<" | ">" | "atLeastOne" | "atMostOne"
~~~~


### Examples

- Activation of a Context with name `ctx1`
` activate: name = "ctx1"`
` activate: "ctx1"`
- Activation of all contexts in a given range for a specified property
`activate: date between(20170402, 20170320)`
Activates all contexts created in a date between the given dates.
- Activation of a context for a particular object instance `obj`
` activate: name = "ctx1" for: obj`
- Activation of a context for all instances of a class `clss`
` activate: name = "ctx1" for: clss`
