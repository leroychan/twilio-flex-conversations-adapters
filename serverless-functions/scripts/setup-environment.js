// Import Libraries
const {
  copyFile,
  parseExampleEnvironmentVariables,
  replaceEnvironmentVariables,
  printContextVariables,
} = require("./common");

// Set Variables
const EXAMPLE_ENVIRONMENT_FILE_NAME = ".env.example";

// Step 1: Check Environment Variable Passed
if (!process.argv[2]) {
  console.log(`Error in setup-environment: No Environment Detected`);
  return false;
}

// Step 2: Create ".env" Environment File
const deployToEnvironment = process.argv[2];
const environmentFile = `.env.${deployToEnvironment}`;
console.log(`Environment Selected: ${deployToEnvironment}`);
console.log(`Environment File (To Be Created): ${environmentFile}`);

// Step 3: Copy Environment Variable File from Example
copyFile(EXAMPLE_ENVIRONMENT_FILE_NAME, environmentFile);

// Step 4: Parse Example Environment Variable and Get Context
let context = parseExampleEnvironmentVariables(EXAMPLE_ENVIRONMENT_FILE_NAME);

// Step 5: Replace Environment Variable File with Actual Values
context = replaceEnvironmentVariables(context, environmentFile);
printContextVariables(context, "Summary of Environment");
