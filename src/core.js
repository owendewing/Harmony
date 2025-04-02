export function program(statements) {
  return {
    kind: "Program",
    statements,
  };
}

export function variableDeclaration(name, initializer) {
  return {
    kind: "VariableDeclaration",
    name,
    initializer,
  };
}

export function variable(name, type) {
  return {
    kind: "Variable",
    name,
    type,
  };
}

export function functionCall(callee, args) {
  return {
    kind: "FunctionCall",
    callee,
    args,
    type: callee.returnType,
  };
}

export function functionDeclaration(fun) {
  return {
    kind: "FunctionDeclaration",
    fun,
  };
}

export function fun(name, parameters, returnType, body) {
  return {
    kind: "Function",
    name,
    parameters,
    returnType,
    body,
    type: {
      kind: "FunctionType",
      paramTypes: parameters.map((p) => p.type),
      returnType: returnType,
    },
  };
}

export function functionType(parameters, returnType) {
  return {
    kind: "FunctionType",
    parameters,
    returnType,
  };
}

export function arrayType(baseType) {
  return {
    kind: "ArrayType",
    baseType,
  };
}

export function arrayExpression(elements, type = null) {
  return {
    kind: "ArrayExpression",
    elements,
    type: type || arrayType(elements[0].type),
  };
}

export function binary(op, left, right, type) {
  return {
    kind: "BinaryExpression",
    op,
    left,
    right,
    type,
  };
}

export function ifStatement(test, consequent, alternate) {
  return {
    kind: "IfStatement",
    test,
    consequent,
    alternate,
  };
}

export function whileStatement(test, body) {
  return {
    kind: "WhileStatement",
    test,
    body,
  };
}

export function forStatement(iterator, collection, body) {
  return {
    kind: "ForStatement",
    iterator,
    collection,
    body,
  };
}

export function returnStatement(argument) {
  return {
    kind: "ReturnStatement",
    argument,
  };
}

export function printStatement(expression) {
  return {
    kind: "PrintStatement",
    expression,
  };
}

export function classType(name, fields) {
  return {
    kind: "ClassType",
    name,
    fields,
  };
}

export function newInstance(classType, fields) {
  return {
    kind: "NewInstance",
    classType,
    fields,
    type: classType,
  };
}

export function fieldAccess(classInstance, field, value) {
  return {
    kind: "FieldAccess",
    classInstance,
    field,
    value,
    type: field.type,
  };
}

export function numberLiteral(value) {
  return {
    kind: "NumberLiteral",
    value,
    type: intType,
  };
}

export function stringLiteral(value) {
  return {
    kind: "StringLiteral",
    value,
    type: stringType,
  };
}

export const booleanType = { kind: "BooleanType" };
export const voidType = { kind: "VoidType" };
export const intType = { kind: "IntType" };
export const stringType = { kind: "StringType" };
export const anyType = { kind: "AnyType" };

export const standardLibrary = Object.freeze({
  bool: booleanType,
  int: intType,
  string: stringType,
  void: voidType,
  any: anyType,
});

String.prototype.type = stringType;
Number.prototype.type = intType;
Boolean.prototype.type = booleanType;
