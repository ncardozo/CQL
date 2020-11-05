/* 
 * Context Traits v0.0.1
 * https://github.com/tagae/context-traits
 * Copyright © 2012—2020, 01:23 © 2012—2015 UCLouvain 
 2016- Uniandes
 * 2016-2020, 01:23 Universidad de los Andes
 * Licensed under Apache Licence, Version 2.0
 */ 

/* [Context Traits](https://github.com/ncardozo/context-traits).
 * Copyright © 2012—2015 UCLouvain.
 *             2016- Uniandes
*/

// Host Features
// -------------

// Check whether a required object exists. If unavailable, load
// corresponding module: in Node.js, use `require`; in web pages,
// modules must be inserted by hand using `<script>` tags, but this
// function can at least remind the user that such libraries need to be
// loaded.
const ensureObject = function(name, file, path = []) {
  let object = this[name]; // reads current module or `window` object
  if (object == null) {
    if (typeof require !== 'undefined' && require) {
      object = require(file);
      for (let attribute of path) {
        object = object[attribute];
      }
      return this[name] = object;
    } else {
      throw new Error(`Required object //${name} of library //${file} not found`);
    }
  }
};

// Check dependencies.
ensureObject('us', 'underscore');
ensureObject('Trait', 'traits', ['Trait']);



// Object Orientation
// ------------------

// Change function prototype so that objects created through this
// constructor will delegate to the given `parent`.
if (Function.prototype.inheritFrom == null) { Function.prototype.inheritFrom = function(parent) {
  this.prototype = new parent();
  return this;
}; }

// Data Structures
// ---------------

// If there is `push` and `pop` by default, why not `top`?
Array.prototype.top = function() {
  return this[this.length-1];
};

// A _context_ represents a situation that might arise during program
// execution, and which may affect the way the program behaves. This
// corresponds to the normal notion of context found in dictionaries
// such as
// [Merriam-Webster](http://merriam-webster.com/dictionary/context) and
// [Cambridge](http://dictionary.cambridge.org/dictionary/british/context_1).

Context = function(obj) {
  this.activationCount = 0
  this.adaptations = []
  this.manager = contexts.Default?.manager || new Manager()
  this.name =  obj.name
  this.interface = obj.interface
  return this
}

// An _adaptation_ represents the adaptation of an object to a
// particular context, as specified by a given trait. The trait
// contains properties that are specific to the context.
Adaptation = function(context, object, trait) {
  this.context = context
  this.object = object
  this.trait = trait
  return this
}

// The _context manager_ coordinates interaction among contexts.
Manager = function() {
  // Array of active adaptations. The manager needs not keep track of inactive adaptations.
  this.adaptations = []
  this.contexts = []
  this.invocations = []
  this.policy = new ActivationAgePolicy()
  this.totalActivations = 0
  return this
}

// Composition policies help resolving conflicts that arise during
// composition of adaptations.
Policy = function() {
  return this
}

//The _context discovery_ orchestrates the advertising and browsing of contexts
Discovery = function() {
	this.exportingBehavior = []
	this.volitileContexts = []
  return this
}
// Extend `Context` with methods related to activation.

us.extend(Context.prototype, {

    activate() {
      if (++this.activationCount === 1) {
        this.activationStamp = ++this.manager.totalActivations;
        this.activateAdaptations();
      }
      return this;
    },

    deactivate() {
      if (this.activationCount > 0) {
        if (--this.activationCount === 0) {
          this.deactivateAdaptations();
          delete this.activationStamp;
        }
      } else {
        throw new Error('Cannot deactivate inactive context');
      }
      return this;
    },

    isActive() {
      return this.activationCount > 0;
    }
  }
);

// Strategies for composition of adaptations.

const strategies = {

  compose(adaptation, trait) {
    const resultingTrait = Trait.compose(adaptation.trait, trait);
    for (let name of Object.keys(resultingTrait)) {
      const propdesc = resultingTrait[name];
      if (propdesc.conflict) {
        throw new Error(`Property ${name} already adapted for ${adaptation.object} in ${adaptation.context}`);
      }
    }
    return resultingTrait;
  },

  preserve(adaptation, trait) {
    return Trait.override(adaptation.trait, trait);
  },

  override(adaptation, trait) {
    return Trait.override(trait, adaptation.trait);
  },

  prevent(adaptation, trait) {
    throw new Error(`${adaptation.object} already adapted in ${adaptation.context}`);
  }
};

// Extend `Context` with methods related to adaptation.

us.extend(Context.prototype, {

  adapt(object, trait) {
    if (!(object instanceof Object)) {
      throw new Error(`Values of type ${typeof object} cannot be adapted.`);
    }
    contexts.Default.addAdaptation(object, Trait(object), strategies.preserve);
    return this.addAdaptation(object, trait, strategies.compose);
  },

  addAdaptation(object, trait, strategy) {
    trait = traceableTrait(trait, object);
    let adaptation = this.adaptationFor(object);
    if (adaptation) {
      adaptation.trait = strategy(adaptation, trait);
      if (this.isActive()) {
        this.manager.updateBehaviorOf(object);
      }
    } else {
      trait = Trait.compose(trait, traits.Extensible);
      adaptation = new Adaptation(this, object, trait);
      this.adaptations.push(adaptation);
      if (this.isActive()) {
        this.manager.deployAdaptation(adaptation);
      }
    }
    return this;
  },

  adaptationFor(object) {
    return us.find(this.adaptations, adaptation => adaptation.object === object);
  },

  activateAdaptations() {
    return Array.from(this.adaptations).map((adaptation) =>
      this.manager.deployAdaptation(adaptation));
  },

  deactivateAdaptations() {
    return Array.from(this.adaptations).map((adaptation) =>
      this.manager.withdrawAdaptation(adaptation));
  }
}
);

// Extend `Manager` with methods related to adaptation.

us.extend(Manager.prototype, {

  deployAdaptation(adaptation) {
    this.adaptations.push(adaptation);
    return this.updateBehaviorOf(adaptation.object);
  },

  withdrawAdaptation(adaptation) {
    const i = this.adaptations.indexOf(adaptation);
    if (i === -1) {
      throw new Error("Attempt to withdraw unmanaged adaptation");
    }
    this.adaptations.splice(i, 1);
    return this.updateBehaviorOf(adaptation.object);
  },

  updateBehaviorOf(object) {
    this.adaptationChainFor(object)[0].deploy();
    return this;
  },

  adaptationChainFor(object) {
    const relevantAdaptations = us.filter(this.adaptations, adaptation => adaptation.object === object);
    if (relevantAdaptations.length === 0) {
      throw new Error(`No adaptations found for ${object}`);
    }
    return this.policy.order(relevantAdaptations);
  }
}
);

// Define main behaviour of `Adaptation`.

us.extend(Adaptation.prototype, {

  deploy() {
    // Overwrite current object properties with adaptation properties.
    return us.extend(this.object, Object.create({}, this.trait));
  },

  toString() {
    return `Adaptation for ${this.object} in ${this.context}`;
  },

  equivalent(other) {
    return (this.context === other.context) &&
      (this.object === other.object) &&
        Trait.eqv(this.trait, other.trait);
  }
}
);

/* [Context Traits](https://github.com/ncardozo/context-traits).
 * Copyright © 2012—2015 UCLouvain.
 *             2016- Uniandes
 */

const traits = {};

traits.Extensible = Trait({
  proceed() {
    const {
      manager
    } = contexts.Default;
    const {
      invocations
    } = manager;
    if (invocations.length === 0) {
      throw new Error("Proceed must be called from an adaptation");
    }
    let [object, method, name, args] = invocations.top();
    // Arguments passed to `proceed` take precedence over those of the
    // original invocation.
    args = arguments.length === 0 ? args : arguments;
    // Find next method.
    const alternatives = manager.orderedMethods(object, name);
    const index = alternatives.indexOf(method);
    if (index === -1) {
      throw new Error("Cannot proceed from an inactive adaptation");
    }
    if ((index + 1) === alternatives.length) {
      throw new Error("Cannot proceed further");
    }
    // Invoke next method.
    return alternatives[index+1].apply(this, args);
  }
});

const traceableMethod = function(object, name, method) {
  var wrapper = function() {
    const {
      invocations
    } = contexts.Default.manager;
    invocations.push([object, wrapper, name, arguments]);
    try {
      return method.apply(this, arguments);
    } finally {
      invocations.pop();
    }
  };
  return wrapper;
};

const traceableTrait = function(trait, object) {
  const newTrait = Trait.compose(trait); // copy
  for (let name of Object.keys(newTrait || {})) {
    const propdesc = newTrait[name];
    if (us.isFunction(propdesc.value)) {
      propdesc.value = traceableMethod(object, name, propdesc.value);
    }
  }
  return newTrait;
};

// Extend `Manager` with methods related to composition.

us.extend(Manager.prototype, {

  orderedMethods(object, name) {
    const adaptations = this.adaptationChainFor(object);
    return adaptations.map((adaptation) =>
      adaptation.trait[name].value);
  }
}
);

// Extend `Policy` with methods related to composition.

us.extend(Policy.prototype, {

  order(adaptations) {
    const self = this;
    return adaptations.sort(function(adaptation1, adaptation2) {
      if (adaptation1.object !== adaptation2.object) {
        throw new Error("Refusing to order adaptations of different objects");
      }
      return self.compare(adaptation1, adaptation2);
    });
  },

  compare(adaptation1, adaptation2) {
    throw new Error("There is no criterium to order adaptations");
  },

  toString() {
    return this.name + ' policy';
  },

  name() {
    return 'anonymous';
  }
}
);

// ### Activation Age Policy

// The _activation age policy_ is the policy used by the default
// context manager.

const ActivationAgePolicy = function() {
  Policy.call(this);
  return this;
};

ActivationAgePolicy.inheritFrom(Policy);

us.extend(ActivationAgePolicy.prototype, {

  compare(adaptation1, adaptation2) {
    // Result as expected by `Array.sort()`
    return adaptation1.context.activationAge() - adaptation2.context.activationAge();
  },

  name() {
    return 'activation age';
  }
}
);

us.extend(Context.prototype, {

  activationAge() {
    return this.manager.totalActivations - this.activationStamp;
  }
}
);

/* [Context Traits](https://github.com/ncardozo/context-traits).
 * Copyright © 2012—2015 UCLouvain.
 *             2016- Uniandes
*/

const Namespace = function(name, parent = null) {
  if (!name) {
    throw new Error("Namespaces must have a name");
  }
  this.name = name;
  this.parent = parent;
  if (!parent) {
    this.home = findScriptHome();
  }
  return this;
};

// Define main behaviour of `Namespace`.

us.extend(Namespace.prototype, {

  root() {
    if (this.parent != null) {
      return this.parent.root();
    } else {
      return this;
    }
  },

  path() {
    if (this.parent != null) {
      const path = this.parent.path();
      path.push(this.name);
      return path;
    } else {
      return [ this.name ];
    }
  },

  normalizePath(path) {
    if (us.isString(path)) {
      return path = path.split('.');
    } else if (us.isArray(path)) {
      return path;
    } else {
      throw new Error("Invalid path specification");
    }
  },

  ensure(path) {
    path = this.normalizePath(path);
    let namespace = this;
    for (let name of path) {
      if (namespace[name] == null) {
        namespace[name] = new Namespace(name, namespace);
      }
      namespace = namespace[name];
    }
    return namespace;
  },

  add(properties) {
    return us.extend(this, properties);
  },

  load(path, options) {
    const success = options.success || (function() {});
    const failure = options.failure || (function() {});
    path = this.normalizePath(path);
    if (typeof document !== 'undefined' && document !== null) {
      return this.loadInBrowser(path, success, failure);
    } else {
      throw new Error("Loading of context modules not supported in current JavaScript platform.");
    }
  },

  loadInBrowser(path, success, failure) {
    if (typeof $ === 'undefined' || $ === null) {
      throw new Error("Context module loading depends on jQuery");
    }
    const target = this;
    const url = target.root().home + (target.path().concat(path)).join('/') + '.js';
    return $.ajax({
      url,
      dataType: "text", // Prevent premature evaluation
      success(data, textStatus, jqXHR) {
        try {
          let origExports;
          if (window.hasOwnProperty('exports')) {
            origExports = window.exports;
          }
          window.exports = {};
          $.globalEval(data);
          const leaf = target.ensure(path);
          leaf.add(window.exports);
          if (origExports != null) {
            window.exports = origExports;
          } else {
            delete window.exports;
          }
          console.log('Loaded ' + url);
          return success();
        } catch (error) {
          return failure(error);
        }
      },
      error(jqXHR, status, error) {
        console.log(`Failed to load ${url} (${status}): ${error}`);
        return failure(error);
      }
    });
  }
}
);

// Extend `Context` with behaviour related to namespaces.

us.extend(Context.prototype, {

  path(from) {
    if (from == null) { from = contexts; }
    const keys = us.keys(from);
    const values = us.values(from);
    let i = values.indexOf(this);
    if (i !== -1) {
      return [ keys[i] ];
    } else {
      for (i = 0; i < values.length; i++) {
        const subspace = values[i];
        if (subspace instanceof Namespace && (keys[i] !== 'parent')) {
          const p = this.path(subspace);
          if (p) {
            p.unshift(keys[i]);
            return p;
          }
        }
      }
      return false;
    }
  },

  name() {
    const path = this.path();
    if (path) {
      return path.join('.');
    } else {
      return 'anonymous';
    }
  },

  toString() {
    return `${this.name} context`;
  }
}
);

// Ancilliary Functions
// --------------------

// Find the absolute path from which the current script has been
// loaded. If unable, return a falsy value.

var findScriptHome = function() {
  try {
    throw new Error;
  } catch (error) {
    // Obtain textual stacktrace from exception object
    const trace = error.stack || error.stacktrace;
    if (trace) {
      // Find first line mentioning a URL
      for (let line of trace.split('\n')) {
        const matches = /(http|file):\/\/[^/]*(\/.*\/)[^/]*\.js/.exec(line);
        if (matches != null) {
          return matches[2];
        }
      }
    } else if (error.sourceURL) {
      // Internet Explorer
      throw new Error('TODO: error.sourceURL not supported yet.');
    } else {
      throw new Error('Could not determine script home directory.');
    }
  }
  return null;
};

// Main context namespace.
const contexts = new Namespace('contexts');

contexts.Default = new Context('default');

// The default context is always active.
contexts.Default.activate();

// If there is no explicit `exports`, take global namespace
//let exports;
//if(!exports) {
//  exports = this;
//}

// Export objects.
exports.Context = Context;
exports.Namespace = Namespace;
exports.Policy = Policy;
exports.Trait = Trait; // from traits.js
exports.Manager = Manager();

// Export namespaces.
exports.contexts = contexts;
