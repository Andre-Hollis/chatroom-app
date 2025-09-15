import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
        rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "indent": [
        "error",
        4,
        {
          "SwitchCase": 1,
          "MemberExpression": 1,
          // "ignoredNodes": [
          //   "JSXElement",
          //   "JSXElement *"
          // ]
        }
      ],
      "no-multi-spaces": "error",
      "comma-dangle": [
        "warn",
        {
          "arrays": "always-multiline",
          "objects": "always-multiline",
          "imports": "always-multiline",
          "exports": "always-multiline",
          "functions": "always-multiline"
        }
      ],
      "semi": "error",
      "quotes": [
        "error",
        "single",
        "avoid-escape"
      ],
      "@typescript-eslint/no-non-null-assertion": "warn"
    }
  },
])
