module.exports = {
  extends: ["@affinidi/eslint-config"],
  parserOptions: {
    project: './tsconfig.json'
  },
  env: {
    "commonjs": true,
    "node": true,
    "mocha": true
  }
};
