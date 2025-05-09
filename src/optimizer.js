import * as core from "./core.js";

export default function optimize(node) {
  return optimizers?.[node.kind]?.(node) ?? node;
}

const isZero = (n) =>
  n === 0 || (n?.constructor === Number && n.valueOf() === 0);
const isOne = (n) =>
  n === 1 || (n?.constructor === Number && n.valueOf() === 1);

const ensureNumber = (value) => {
  if (value?.constructor === Number) {
    return value.valueOf();
  }
  if (value?.kind === "NumberLiteral") {
    return Number(value.value);
  }
  return value;
};

const optimizers = {
  Program(p) {
    p.statements = p.statements.flatMap(optimize);
    return p;
  },

  VariableDeclaration(d) {
    d.name = optimize(d.name);
    d.initializer = optimize(d.initializer);
    return d;
  },

  Variable(v) {
    return v;
  },

  FunctionDeclaration(d) {
    d.fun = optimize(d.fun);
    return d;
  },

  Function(f) {
    if (f.body) f.body = f.body.flatMap(optimize);
    return f;
  },

  ReturnStatement(s) {
    s.argument = optimize(s.argument);
    return s;
  },

  PrintStatement(s) {
    s.expression = optimize(s.expression);
    return s;
  },

  IfStatement(s) {
    s.test = optimize(s.test);
    s.consequent = s.consequent.flatMap(optimize);
    if (s.alternate?.kind?.endsWith?.("IfStatement")) {
      s.alternate = optimize(s.alternate);
    } else if (s.alternate) {
      s.alternate = s.alternate.flatMap(optimize);
    }

    if (s.test === true || s.test === false) {
      return s.test ? s.consequent : s.alternate || [];
    }

    return s;
  },

  WhileStatement(s) {
    s.test = optimize(s.test);
    if (s.test === false) {
      return [];
    }
    s.body = s.body.flatMap(optimize);
    return s;
  },

  ForStatement(s) {
    s.iterator = optimize(s.iterator);
    s.collection = optimize(s.collection);
    s.body = s.body.flatMap(optimize);
    if (
      s.collection?.kind === "ArrayExpression" &&
      s.collection.elements.length === 0
    ) {
      return [];
    }
    return s;
  },

  BinaryExpression(e) {
    e.left = optimize(e.left);
    e.right = optimize(e.right);

    const left = ensureNumber(e.left);
    const right = ensureNumber(e.right);

    if (typeof left === "number" && typeof right === "number") {
      if (e.op === "+") return left + right;
      if (e.op === "-") return left - right;
      if (e.op === "*") return left * right;
      if (e.op === "/") return left / right;
      if (e.op === "**") return left ** right;
      if (e.op === "%") return left % right;
      if (e.op === "<") return left < right;
      if (e.op === "<=") return left <= right;
      if (e.op === "==") return left === right;
      if (e.op === "!=") return left !== right;
      if (e.op === ">=") return left >= right;
      if (e.op === ">") return left > right;
    }

    if (isZero(right) && ["+", "-"].includes(e.op)) return left;
    if (isOne(right) && ["*", "/"].includes(e.op)) return left;
    if (isZero(left) && e.op === "+") return right;
    if (isZero(left) && e.op === "-") return core.unary("-", right);
    if (isOne(left) && e.op === "*") return right;
    if (isZero(left) && ["*", "/"].includes(e.op)) return 0;
    if (isOne(left) && e.op === "**") return 1;
    if (isZero(right) && e.op === "**") return 1;
    if (isZero(right) && e.op === "*") return 0;

    return e;
  },

  UnaryExpression(e) {
    e.operand = optimize(e.operand);
    const operand = ensureNumber(e.operand);

    if (typeof operand === "number") {
      if (e.op === "-") return -operand;
    }

    return e;
  },

  NumberLiteral(e) {
    return Number(e.value);
  },

  StringLiteral(e) {
    return e;
  },

  ArrayExpression(e) {
    e.elements = e.elements.map(optimize);
    return e;
  },

  FunctionCall(c) {
    c.callee = optimize(c.callee);
    c.args = c.args.map(optimize);
    return c;
  },
};
