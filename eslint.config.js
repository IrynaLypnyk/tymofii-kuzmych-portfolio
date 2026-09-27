import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

export default [
  {
    ignores: ["_site/**", "node_modules/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
  {
    files: [".eleventy.js"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["src/js/**/*.js"],
    languageOptions: {
      globals: globals.browser,
    },
  },
  eslintConfigPrettier,
];
