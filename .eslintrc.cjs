/* @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  ignorePatterns: ["**/dist/**", "**/node_modules/**"],
  parser: "@typescript-eslint/parser",
  parserOptions: { tsconfigRootDir: __dirname, project: ["./tsconfig.base.json"] },
  plugins: ["@typescript-eslint", "react"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "prettier"
  ],
  settings: {
    react: { version: "detect" }
  },
  rules: {
    // mild defaults; we can tighten later
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
  }
};
