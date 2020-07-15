module.exports = {
  root: true,
  env: {
    node: true
  },
  plugins: ['vue', '@typescript-eslint', 'prettier'],
  extends: ['plugin:vue/essential', '@vue/typescript/recommended', '@vue/prettier', '@vue/prettier/@typescript-eslint'],
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off"
  },
  parserOptions: {
    parser: "@typescript-eslint/parser"
  },
  overrides: [
    {
      files: ["**/__tests__/*.{j,t}s?(x)"],
      env: {
        mocha: true
      }
    }
  ]
};
