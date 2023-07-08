// Import Libraries
const { updateEnvironmentVariables, copyFile } = require("./common");

// Set Variables
const EXAMPLE_ENVIRONMENT_FILE_NAME = ".env.example";

// Step 1: Process Environment Variable File
// -- Check: Environment Variable Passed
if (!process.argv[2]) {
  console.log(`Error in setup-environment: No Environment Detected`);
  return false;
}
const deployToEnvironment = process.argv[2];
const environmentFile = `.env.${deployToEnvironment}`;

// -- Copy Environment Variable File from Example
copyFile(EXAMPLE_ENVIRONMENT_FILE_NAME, environmentFile);
updateEnvironmentVariables(environmentFile);
