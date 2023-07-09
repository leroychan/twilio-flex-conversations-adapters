const {
  parseExampleEnvironmentVariables,
  printContextVariables,
} = require("./scripts/common.js");

const test = parseExampleEnvironmentVariables();
printContextVariables(test);
