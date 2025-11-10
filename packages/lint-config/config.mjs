import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";
import prettierRecommended from "eslint-plugin-prettier/recommended";

export default tseslint.config(
  {
    ignores: ["**/node_modules", "**/dist", "eslint.config.mjs"],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: pluginVue.parser,
      parserOptions: {
        parser: "@typescript-eslint/parser",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },
  {
    rules: {
      "no-debugger": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "vue/multi-word-component-names": "off", // 可选：关闭 Vue 组件名检查
      "vue/require-default-prop": "off",
    },
  },
  prettierRecommended, // 必须放在最后
);
