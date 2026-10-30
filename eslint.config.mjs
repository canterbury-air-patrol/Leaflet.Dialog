import globals from "globals";
import pluginJs from "@eslint/js";
import eslintReact from "@eslint-react/eslint-plugin";


export default [
  {files: ["**/*.{js,mjs,cjs,jsx}"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  eslintReact.configs.recommended,
];
