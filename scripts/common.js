// Import Libraries
const shell = require("shelljs");

exports.getEnvironmentVariables = () => {
  try {
    return process.env;
  } catch (e) {
    console.log("Error in getEnvironmentVariables:");
    console.log(e);
  }
};
