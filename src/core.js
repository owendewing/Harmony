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
  };
}

export function functionType(parameters, returnType) {
  return {
    kind: "FunctionType",
    parameters,
    returnType,
  };
}

export function arrayType(elementType) {
  return {
    kind: "ArrayType",
    elementType,
  };
}

export function arrayExpression(elements) {
  return {
    kind: "ArrayExpression",
    elements,
    type: arrayType(elements[0].type),
  };
}

export function unary(op, operand, type) {
  return {
    kind: "UnaryExpression",
    op,
    operand,
    type,
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

export function functionCall(callee, args) {
  return {
    kind: "FunctionCall",
    callee,
    args,
    type: callee.type.returnType,
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

export function conditionalExpression(test, consequent, alternate, type) {
  return {
    kind: "ConditionalExpression",
    test,
    consequent,
    alternate,
    type,
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

export function assignment(target, source) {
  return {
    kind: "Assignment",
    target,
    source,
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
