// eslint.config.js (in the project root)
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  // Global configuration
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // Not needed with modern React
    },
    settings: {
      react: { version: "detect" },
    },
  },
  
  // Base JavaScript rules
  pluginJs.configs.recommended,

  // TypeScript specific rules
  ...tseslint.configs.recommended,

  // React specific rules
  pluginReactConfig,
  
  // Override for TypeScript files to set parser project
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: "tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  
  // Explicitly ignore the functions directory for this config
  {
    ignores: ["dist/", "functions/"],
  },
];