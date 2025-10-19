/* @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  ignorePatterns: ["**/dist/**", "**/node_modules/**"],

  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    // Base config; per-package tsconfigs are specified in overrides below
    project: ["./tsconfig.base.json"],
    sourceType: "module",
  },

  plugins: ["@typescript-eslint", "import"],

  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],

  settings: {
    // Let eslint-plugin-import resolve TS + NodeNext style ESM paths
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: [
          "apps/api/tsconfig.json",
          "apps/web/tsconfig.json",
          "packages/domain/tsconfig.json",
        ],
      },
      node: {
        extensions: [".js", ".mjs", ".cjs", ".ts", ".tsx"],
      },
    },
  },

  rules: {
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "import/no-default-export": "error",
  },

  overrides: [
    // Allow default exports in tool/config files (vite, tsup, eslint, etc.)
    {
      files: [
        "**/*.{config,configs}.*",
        "**/vite.config.*",
        "**/eslint.config.*",
        "**/postcss.config.*",
        "**/tailwind.config.*",
      ],
      rules: {
        "import/no-default-export": "off",
      },
    },

    // Web app: enable React rules (kept out of the API to avoid the warning)
    {
      files: ["apps/web/**/*.{ts,tsx}"],
      plugins: ["react"],
      extends: ["plugin:react/recommended", "plugin:react/jsx-runtime"],
      settings: { react: { version: "detect" } },
      rules: {
        "react/prop-types": "off",      
        "react/react-in-jsx-scope": "off"
      },
    },

    // API + Domain: ensure Node env and no React requirements
    {
      files: ["apps/api/**/*.{ts,tsx}", "packages/domain/**/*.{ts,tsx}"],
      env: { node: true },
      rules: {
        // (nothing special—this block exists to make intent explicit)
      },
    },

    // Tests: Vitest globals (optional but nice)
    {
      files: ["**/*.{test,spec}.ts?(x)"],
      env: { node: true },
      // If you install eslint-plugin-vitest:
      // plugins: ["vitest"],
      // extends: ["plugin:vitest/recommended"],
    },
  ],
};
