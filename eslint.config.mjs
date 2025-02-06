// @ts-check
import eslint from "@eslint/js";
import * as eslintPluginImport from "eslint-plugin-import";
import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["eslint.config.mjs", "node_modules", "test", "dist", "build"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 5,
      sourceType: "module",
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      prettier: eslintPluginPrettier,
      import: eslintPluginImport,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/no-require-imports": "off",
      "no-var": "error",
      semi: "error",
      "max-len": ["error", { code: 105 }],
      indent: ["error", 2, { SwitchCase: 1 }],
      "no-multi-spaces": "error",
      "space-in-parens": "error",
      "no-multiple-empty-lines": "error",
      "prefer-const": "error",
      "prettier/prettier": [
        "warn",
        {
          endOfLine: "auto",
          trailingComma: "all",
          printWidth: 105,
          tabWidth: 2,
          semi: true,
          singleQuote: false,
        },
      ],
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          pathGroups: [
            {
              pattern: "@nestjs/**",
              group: "external",
              position: "before",
            },
            {
              pattern: "typeorm",
              group: "external",
              position: "before",
            },
            {
              pattern: "class-validator",
              group: "external",
              position: "before",
            },
            {
              pattern: "class-transformer",
              group: "external",
              position: "before",
            },
            {
              pattern: "@prisma/**",
              group: "external",
              position: "before",
            },
            {
              pattern: "@modules/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "@common/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "@config/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "@utils/**",
              group: "internal",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
          "newlines-between": "always",
        },
      ],
    },
  },
);
