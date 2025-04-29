import * as core from "./core.js";

const INT = core.intType;
const BOOL = core.booleanType;
const VOID = core.voidType;
const STRING = core.stringType;
const ANY = core.anyType;

class Context {
  constructor({
    parent = null,
    locals = new Map(),
    inLoop = false,
    function: f = null,
  }) {
    Object.assign(this, { parent, locals, inLoop, function: f });
  }
  add(name, entity) {
    this.locals.set(name, entity);
  }
  lookup(name) {
    return this.locals.get(name) || this.parent?.lookup(name);
  }
  static root() {
    return new Context({
      locals: new Map(Object.entries(core.standardLibrary)),
    });
  }
  newChildContext(props) {
    return new Context({ ...this, ...props, parent: this, locals: new Map() });
  }
}

export default function analyze(match) {
  let context = Context.root();

  function must(condition, message, errorLocation) {
    if (!condition) {
      const prefix = errorLocation.at.source.getLineAndColumnMessage();
      throw new Error(`${prefix}: ${message}`);
    }
  }

  function mustNotAlreadyBeDeclared(name, at) {
    must(!context.lookup(name), `${name} is already declared`, at);
  }

  function mustHaveBeenFound(entity, name, at) {
    must(entity, `${name} is not declared`, at);
  }

  function mustHaveNumericType(e, at) {
    must([INT].includes(e.type), "Expected a number", at);
  }

  function mustHaveBooleanType(e, at) {
    must(e.type === core.booleanType, "Expected a boolean", at);
  }

  function mustHaveAnArrayType(e, at) {
    must(e.type?.kind === "ArrayType", "Expected an array", at);
  }

  function mustBothHaveTheSameType(e1, e2, at) {
    must(equivalent(e1.type, e2.type), "Incompatible types", at);
  }

  function mustAllHaveTheSameType(expressions, at) {
    must(
      expressions
        .slice(1)
        .every((e) => equivalent(e.type, expressions[0].type)),
      "Incompatible types",
      at
    );
  }

  function mustBeAFunction(e, at) {
    must(e?.kind === "Function", "Expected a function", at);
  }

  function equivalent(t1, t2) {
    return (
      t1 === t2 ||
      (t1?.kind === "ArrayType" &&
        t2?.kind === "ArrayType" &&
        equivalent(t1.baseType, t2.baseType))
    );
  }

  function assignable(t1, t2) {
    return t2 == ANY || equivalent(t1, t2);
  }

  function typeDescription(type) {
    if (typeof type === "string") return type;
    if (type.kind == "StructType") return type.name;
    if (type.kind == "FunctionType") {
      return `(${type.paramTypes
        .map(typeDescription)
        .join(", ")}) -> ${typeDescription(type.returnType)}`;
    }
    if (type.kind == "ArrayType") return `[${typeDescription(type.baseType)}]`;
    if (type.kind == "OptionalType")
      return `${typeDescription(type.baseType)}?`;
  }

  function mustBeAssignable(e, { toType: type }, at) {
    const source = typeDescription(e.type);
    const target = typeDescription(type);
    const message = `Cannot assign a ${source} to a ${target}`;
    must(assignable(e.type, type), message, at);
  }

  function mustBeInAFunction(at) {
    must(context.function, "Return can only appear inside a function", at);
  }

  function mustBeReturnable(e, { from: f }, at) {
    mustBeAssignable(e, { toType: f.returnType }, at);
  }

  const builder = match.matcher.grammar.createSemantics().addOperation("rep", {
    _iter(...children) {
      return children.map((child) => child.rep());
    },

    Program(statements) {
      return core.program(statements.children.map((s) => s.rep()));
    },

    PrintStmt(_print, _open, expression, _close, _semi) {
      const e = expression.rep();
      return core.printStatement(e);
    },

    ListOf(elements) {
      return elements.asIteration().children.map((e) => e.rep());
    },

    VarDec(_var, id, _colon, type, eq, exp, _semi) {
      let initializer = null;
      if (eq && exp) {
        initializer = exp.rep();
        if (Array.isArray(initializer)) {
          initializer = initializer[0];
        }
      }
      const variable = core.variable(id.sourceString, type.rep());
      if (initializer !== null) {
        variable.defaultValue = initializer;
      }
      mustNotAlreadyBeDeclared(id.sourceString, { at: id });
      if (initializer !== null) {
        mustBeAssignable(initializer, { toType: variable.type }, { at: id });
      }
      context.add(id.sourceString, variable);
      return core.variableDeclaration(variable, initializer);
    },

    ClassDecl(_class, id, _open, fields, _close) {
      const classType = core.classType(id.sourceString, fields.rep());
      mustNotAlreadyBeDeclared(id.sourceString, { at: id });
      context.add(id.sourceString, classType);
      return classType;
    },

    FieldDecl(id, _colon, type, _eq, exp, _semi) {
      return core.variable(id.sourceString, type.rep());
    },

    Stmt_newinstance(_var, id, eq, _new, id2, open, list, close, _semi) {
      const classEntity = context.lookup(id2.sourceString);
      mustHaveBeenFound(classEntity, id2.sourceString, { at: id2 });
      must(classEntity.kind === "ClassType", "Expected a class", { at: id2 });

      const fields = list.rep();

      const variable = core.variable(id.sourceString, classEntity);
      variable.defaultValue = core.newInstance(classEntity, fields);
      context.add(id.sourceString, variable);
      return variable;
    },

    Stmt_fieldaccess(id, _dot, field, _eq, exp, _semi) {
      const classInstance = context.lookup(id.sourceString);
      mustHaveBeenFound(classInstance, id.sourceString, { at: id });

      must(
        classInstance.type?.kind === "ClassType",
        "Expected a class instance",
        { at: id }
      );

      const classType = classInstance.type;
      const fieldEntity = classType.fields.find(
        (f) => f.name === field.sourceString
      );
      mustHaveBeenFound(fieldEntity, field.sourceString, { at: field });

      let expressionValue = null;
      if (exp) {
        expressionValue = exp.rep();
        mustBeAssignable(
          expressionValue,
          { toType: fieldEntity.type },
          { at: exp }
        );
      }

      return core.fieldAccess(classInstance, fieldEntity, expressionValue);
    },

    WhileStmt(_while, _open, exp, _close, block) {
      const test = exp.rep();
      mustHaveBooleanType(test, { at: exp });
      context = context.newChildContext({ inLoop: true });
      const body = block.rep();
      context = context.parent;
      return core.whileStatement(test, body);
    },

    FuncDecl(_func, id, _open, params, _close, _arrow, returnType, block) {
      const parameters = params.children
        ? params.children.map((p) => p.rep()).flat()
        : [];
      const paramTypes = parameters.map((p) => p.type);

      const fun = core.fun(id.sourceString, parameters, returnType.rep(), []);
      fun.type = core.functionType(paramTypes, returnType.rep());

      mustNotAlreadyBeDeclared(id.sourceString, { at: id });
      context.add(id.sourceString, core.functionDeclaration(fun));

      const functionContext = context.newChildContext({ function: fun });
      const savedContext = context;
      context = functionContext;

      parameters.forEach((param) => {
        context.add(param.name, param);
      });

      const body = block.rep();
      context = savedContext;

      fun.body = body;

      return core.functionDeclaration(fun);
    },

    Params_multi(_var, first, _comma, rest) {
      return [first.rep(), ...rest.children.map((r) => r.rep())].flat();
    },

    Params_none(_) {
      return [];
    },

    Param(_id, _colon, type, eq, exp) {
      const variable = core.variable(_id.sourceString, type.rep());
      if (eq && exp) {
        variable.defaultValue = exp.rep();
      }
      context.add(_id.sourceString, variable);
      return variable;
    },

    Block(_open, statements, _close) {
      return statements.children.map((s) => s.rep());
    },

    ReturnStmt_return(_return, exp, _semi) {
      const e = exp.rep();
      mustBeInAFunction({ at: exp });
      mustBeReturnable(e, { from: context.function }, { at: exp });
      return core.returnStatement(e);
    },

    ReturnStmt_empty(_return, _semi) {
      mustBeInAFunction({ at: _return });
      return core.returnStatement(null);
    },

    ForStmt(_for, _open, id, _in, exp, _close, block) {
      const array = exp.rep();
      mustHaveAnArrayType(array, { at: exp });

      const elementType = array.type.baseType || array.type.elementType;
      const variable = core.variable(id.sourceString, elementType);

      mustNotAlreadyBeDeclared(id.sourceString, { at: id });
      context.add(id.sourceString, variable);

      context = context.newChildContext({ inLoop: true });
      const body = block.rep();
      context = context.parent;

      return core.forStatement(variable, array, body);
    },

    IfStmt_else(_if, _open, test, _close, consequent, _else, alternate) {
      const t = test.rep();
      mustHaveBooleanType(t, { at: test });
      const c = consequent.rep();
      const a = alternate.rep();
      return core.ifStatement(t, c, a);
    },

    IfStmt_elif(_if, _open, test, _close, consequent, _else, alternate) {
      const t = test.rep();
      mustHaveBooleanType(t, { at: test });
      const c = consequent.rep();
      const a = alternate.rep();
      return core.ifStatement(t, c, a);
    },

    IfStmt_short(_if, _open, test, _close, consequent) {
      const t = test.rep();
      mustHaveBooleanType(t, { at: test });
      const c = consequent.rep();
      return core.ifStatement(t, c, null);
    },

    Type_array(array, _open, type, _close) {
      return core.arrayType(type.rep());
    },

    Type_boolean(_boolean) {
      return core.booleanType;
    },

    Type_int(_int) {
      return core.intType;
    },

    Type_string(_string) {
      return core.stringType;
    },

    Type_void(_void) {
      return core.voidType;
    },

    Exp_condition(left, op, right) {
      const l = left.rep();
      const r = right.rep();
      mustBothHaveTheSameType(l, r, { at: op });
      mustHaveNumericType(l, { at: left });
      return core.binary(op.sourceString, l, r, core.booleanType);
    },

    Exp1_add(left, _op, right) {
      const l = left.rep();
      const r = right.rep();
      if (_op) {
        mustHaveNumericType(l, { at: left });
      }
      mustBothHaveTheSameType(l, r, { at: right });
      return core.binary(_op.sourceString, l, r, l.type);
    },

    Exp2_mul(left, _op, right) {
      const l = left.rep();
      const r = right.rep();
      mustHaveNumericType(l, { at: left });
      mustHaveNumericType(r, { at: right });
      return core.binary(_op.sourceString, l, r, core.intType);
    },

    Exp3_exponent(left, _op, right) {
      const l = left.rep();
      const r = right.rep();
      mustHaveNumericType(l, { at: left });
      mustHaveNumericType(r, { at: right });
      return core.binary("**", l, r, core.intType);
    },

    Exp4_arrayexp(_open, expList, _close) {
      const elements = expList.asIteration().children.map((e) => e.rep());
      mustAllHaveTheSameType(elements, { at: _open });
      return core.arrayExpression(elements);
    },

    Exp4_call(id, _open, args, _close) {
      const entity = context.lookup(id.sourceString);
      mustHaveBeenFound(entity, id.sourceString, { at: id });
      const fun = entity.kind === "FunctionDeclaration" ? entity.fun : entity;
      mustBeAFunction(fun, { at: id });
      const actuals = args.rep();
      return core.functionCall(fun, actuals);
    },

    Stmt_call(id, _open, args, _close, _semi) {
      const entity = context.lookup(id.sourceString);
      mustHaveBeenFound(entity, id.sourceString, { at: id });
      const fun = entity.kind === "FunctionDeclaration" ? entity.fun : entity;
      mustBeAFunction(fun, { at: id });
      const actuals = args.rep();
      return core.functionCall(fun, actuals);
    },

    Exp4_id(id) {
      const entity = context.lookup(id.sourceString);
      mustHaveBeenFound(entity, id.sourceString, { at: id });
      return core.variable(id.sourceString, entity.type);
    },

    true(_) {
      return true;
    },

    false(_) {
      return false;
    },

    num(_digits) {
      return core.numberLiteral(Number(this.sourceString));
    },

    stringlit(_openQuote, _chars, _closeQuote) {
      const stringValue = this.sourceString.slice(1, -1);
      return core.stringLiteral(stringValue);
    },
  });
  return builder(match).rep();
}
