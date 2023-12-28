module.exports = {
  "root": true,
  "extends": [
    "eslint:recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    'plugin:prettier/recommended'
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": { "project": ["./tsconfig.json"] },
  "plugins": [
    "@typescript-eslint"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/strict-boolean-expressions": [
      2,
      {
        "allowString": false,
        "allowNumber": false
      }
    ]
  },
  "ignorePatterns": ["src/**/*.test.ts", "src/frontend/generated/*", ".eslintrc.js"],
  "overrides": [
    {
      "files": ['*.ts', '*.tsx'],
      "extends": [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],

      "parserOptions": {
        "project": ['./tsconfig.json'],
      },
    },
  ],
}