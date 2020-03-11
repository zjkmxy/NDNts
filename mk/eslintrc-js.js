module.exports = {
  extends: [
    "xo/esnext",
  ],
  plugins: [
    "simple-import-sort",
  ],
  env: {
    browser: true,
    es2020: true,
    jest: true,
    node: true,
  },
  globals: {
    page: "readonly",
  },
  rules: {
    "simple-import-sort/sort": "error",
    "array-element-newline": "off",
    "arrow-parens": ["error", "always"],
    "brace-style": ["error", "1tbs", { allowSingleLine: true }],
    "capitalized-comments": "off",
    "comma-dangle": ["error", "always-multiline"],
    "constructor-super": "off",
    "default-case": "off",
    "function-call-argument-newline": "off",
    "generator-star-spacing": ["error", { named: "after", anonymous: "neither", method: "before" }],
    indent: ["error", 2, {
      SwitchCase: 1,
      VariableDeclarator: "first",
      outerIIFEBody: 0,
      FunctionDeclaration: { parameters: 2 },
      FunctionExpression: { parameters: 2 },
      flatTernaryExpressions: true,
    }],
    "max-statements-per-line": ["error", { max: 3 }],
    "new-cap": "off",
    "no-await-in-loop": "off",
    "no-implicit-coercion": ["error", { allow: ["!!"] }],
    "no-inner-declarations": "off",
    "no-mixed-operators": "off",
    "no-return-assign": "off",
    "object-curly-spacing": ["error", "always"],
    "padded-blocks": ["error", "never", { allowSingleLineBlocks: true }],
    "padding-line-between-statements": "off",
    "prefer-destructuring": "off",
    "prefer-template": "error",
    quotes: ["error", "double"],
    "yield-star-spacing": ["error", "after"],
  },
};
