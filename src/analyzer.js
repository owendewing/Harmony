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

  function mustHaveNumericOrStringType(e, at) {
    must([INT, STRING].includes(e.type), "Expected a number or string", at);
  }

  function mustHaveBooleanType(e, at) {
    must(e.type === BOOL, "Expected a boolean", at);
  }

  function mustHaveAnArrayType(e, at) {
    must(e.type?.kind === "ArrayType", "Expected an array", at);
  }

  function mustHaveAClassType(e, at) {
    must(e.type?.kind === "ClassType", "Expected a class", at);
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

  function includesAsField(classType, type) {
    return classType.fields.some(
      (f) =>
        f.type === type ||
        (f.type?.kind === "ClassType" && includesAsField(f.type, type))
    );
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
    switch (type.kind) {
      case "IntType":
        return "int";
      case "BooleanType":
        return "boolean";
      case "StringType":
        return "string";
      case "VoidType":
        return "void";
      case "AnyType":
        return "any";
      case "ArrayType":
        return `[${typeDescription(type.baseType)}]`;
      case "ClassType":
        return type.name;
      case "FunctionType":
        const paramTypes = type.paramTypes.map(typeDescription).join(", ");
        const returnType = typeDescription(type.returnType);
        return `(${paramTypes})->${returnType}`;
    }
  }

  function mustBeAssignable(e, { toType: type }, at) {
    const message = `Cannot assign a ${typeDescription(
      e.type
    )} to a ${typeDescription(type)}`;
    must(assignable(e.type, type), message, at);
  }

  function mustReturnSomething(e, at) {
    const returnsSomething = e.type.returnType !== core.voidType;
    must(returnsSomething, "Function must return a value", at);
  }

  function mustBeInLoop(at) {
    must(context.inLoop, "Full can only appear inside a loop", at);
  }

  function mustBeInAFunction(at) {
    must(context.function, "Return can only appear inside a function", at);
  }

  function mustHaveCorrectArgumentCount(argCount, paramCount, at) {
    const message = `Expected ${paramCount} arguments but got ${argCount}`;
    must(argCount === paramCount, message, at);
  }

  function mustBeReturnable(e, { from: f }, at) {
    mustBeAssignable(e, { toType: f.type.returnType }, at);
  }

  const builder = match.matcher.grammar.createSemantics().addOperation("rep", {
    Program(statements) {
      return core.program(statements.children.map((s) => s.rep()));
    },
  });
}
