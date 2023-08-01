// Import Libraries
const shell = require("shelljs");
const fs = require("fs");
const dotenv = require("dotenv");

exports.copyFile = (
  exampleFileName = ".env.example",
  destinationFileName = ".env"
) => {
  try {
    // Check if exampleFileName exist
    if (!shell.test("-e", exampleFileName)) {
      console.log("copyFile", `exampleFileName does not exist`);
      return false;
    }
    // Check if destinationFileName exist
    if (shell.test("-e", destinationFileName)) {
      console.log(
        "copyFile",
        `destinationFileName already exist. No copy is needed`
      );
      return false;
    }
    shell.cp(exampleFileName, destinationFileName);
    console.log(
      "copyFile",
      `Successfully copied ${exampleFileName} into ${destinationFileName}`
    );
    return true;
  } catch (e) {
    console.log("Error in copyFile:");
    console.log(e);
    return false;
  }
};

exports.parseExampleEnvironmentVariables = (
  exampleEnvironmentFileName = ".env.example"
) => {
  try {
    // Step 1: Set Variables
    const defaultTwilioVariables = ["ACCOUNT_SID", "AUTH_TOKEN"];
    let context = {
      twilio: {},
      conversations_adapters: {},
      env_requires_replacement: {},
      env_error: {},
      env_raw: {},
    };

    // Step 2: Parse Example Environment Variables into JSON Object
    const exampleEnvironmentVariables = dotenv.parse(
      fs.readFileSync(exampleEnvironmentFileName)
    );
    context.env_raw = {
      ...exampleEnvironmentVariables,
    };

    // Step 3: Process Environment Variables and Set into Context
    for (const jsonKey of Object.keys(exampleEnvironmentVariables)) {
      // Set Default Twilio Variables into Context
      if (defaultTwilioVariables.includes(jsonKey)) {
        context.twilio[jsonKey] = exampleEnvironmentVariables[jsonKey];
      }
      // Set Variables That Requires Replacement into Context - Value to conform with naming convention of "<YOUR_[ENV_VARIABLE_NAME]>"
      else if (
        exampleEnvironmentVariables[jsonKey].startsWith(`<YOUR_${jsonKey}>`)
      ) {
        context.env_requires_replacement[jsonKey] =
          exampleEnvironmentVariables[jsonKey];
      }
      // Set Ready-to-Use Variables into Context
      else if (exampleEnvironmentVariables[jsonKey]) {
        context.conversations_adapters[jsonKey] =
          exampleEnvironmentVariables[jsonKey];
      }
      // Set Error/Empty Variables into Context
      else {
        context.env_error[jsonKey] = exampleEnvironmentVariables[jsonKey];
      }
    }
    // Step 4: Return Context
    return context;
  } catch (err) {
    console.log("Error in parseExampleEnvironments:");
    console.log(err);
    return false;
  }
};

exports.replaceEnvironmentVariables = (context, destinationFileName) => {
  try {
    if (
      context &&
      context.env_requires_replacement &&
      Object.keys(context.env_requires_replacement).length > 0
    ) {
      // Process Environment Variables That Requires Replacement
      for (const key of Object.keys(context.env_requires_replacement)) {
        const regexExpression = new RegExp(`<YOUR_${key}>`, "g");
        if (process.env[key] && process.env[key].length <= 255) {
          // Replace Variable
          shell.sed(
            "-i",
            regexExpression,
            `${process.env[key]}`,
            destinationFileName
          );
          context.conversations_adapters[key] = process.env[key];
          // Remove From Context
          delete context.env_requires_replacement[key];
        } else if (process.env[key] && process.env[key].length >= 255) {
          // Twilio Functions only allow a maximum of 255 characters for it's environment variable
          // Supports only base64 encoded JSON - will write it to a private Asset file in Twilio Functions
          console.log(
            `${key} has a value of more than 255 characters - processing now`
          );
          // -- Set Variables
          const splitVariableName = key.split("_");
          const adapterName = splitVariableName[0].toLowerCase();
          const suffix = "-credentials.private.json";
          // -- Check if variable's value is base64
          const base64RegExp =
            /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=|[A-Za-z0-9+\/]{4})$/;
          const isBase64 = base64RegExp.test(process.env[key]);
          if (isBase64) {
            console.log(`${key}'s content is formatted in base64`);
            const content = Buffer.from(process.env[key], "base64").toString(
              "utf-8"
            );
            try {
              const parsedContentJSON = JSON.parse(content);
              const contentJSON = JSON.stringify(parsedContentJSON);
              console.log("Current directory:", __dirname);
              fs.writeFileSync(
                `./src/assets/${adapterName}${suffix}`,
                contentJSON
              );
              console.log(
                `${key}'s content is successfully parsed and written into a JSON file under Twilio Assets`
              );
              // Replace Variable
              shell.sed(
                "-i",
                regexExpression,
                `SUCCESSFULLY_CREATED_FILE_${adapterName}${suffix}`,
                destinationFileName
              );
              context.conversations_adapters[key] = process.env[key];
              // Remove From Context
              delete context.env_requires_replacement[key];
            } catch (err) {
              console.log("Error in Parsing JSON", err);
              // Replace Variable
              shell.sed(
                "-i",
                regexExpression,
                `VALUE_IS_MORE_THAN_255_CHARACTERS_AND_UNABLE_TO_PARSE_JSON`,
                destinationFileName
              );
              context.conversations_adapters[key] = process.env[key];
              // Remove From Context
              delete context.env_requires_replacement[key];
            }
          } else {
            // Replace Variable
            shell.sed(
              "-i",
              regexExpression,
              `VALUE_IS_MORE_THAN_255_CHARACTERS`,
              destinationFileName
            );
            context.conversations_adapters[key] = process.env[key];
            // Remove From Context
            delete context.env_requires_replacement[key];
          }
        }
      }
    }
    return context;
  } catch (err) {
    console.log("Error in updateEnvironmentVariables:");
    console.log(err);
    return false;
  }
};

exports.printContextVariables = (context, headerMessage = "Context") => {
  try {
    console.log(`======== Start: ${headerMessage} =======`);
    console.log("");
    // Print Twilio Default Variables
    if (context.twilio && Object.keys(context.twilio).length > 0) {
      console.log("=== Twilio Default Variables ===");
      for (const key of Object.keys(context.twilio)) {
        console.log(`${key}: ${context.twilio[key]}`);
      }
      console.log("");
      console.log(
        `Note: ACCOUNT_SID and AUTH_TOKEN can be empty as it will be auto-populated during deployment`
      );
      console.log("");
    }
    // Print Flex Default Variables
    if (context.flex && Object.keys(context.flex).length > 0) {
      console.log("=== Flex Default Variables ===");
      for (const key of Object.keys(context.flex)) {
        console.log(`${key}: ${context.flex[key]}`);
      }
      console.log("");
    }
    // Print Conversation Adapters Ready-to-Use Variables
    if (
      context.conversations_adapters &&
      Object.keys(context.conversations_adapters).length > 0
    ) {
      console.log("=== Conversations Adapters: Ready-to-Use Variables ===");
      for (const key of Object.keys(context.conversations_adapters)) {
        console.log(`${key}: ${context.conversations_adapters[key]}`);
      }
      console.log("");
    }
    // Print Conversation Adapters Need-to-Replace Variables
    if (
      context.env_requires_replacement &&
      Object.keys(context.env_requires_replacement).length > 0
    ) {
      console.log("=== Conversations Adapters: Need-To-Replace Variables ===");
      for (const key of Object.keys(context.env_requires_replacement)) {
        console.log(`${key}: ${context.env_requires_replacement[key]}`);
      }
      console.log("");
      console.log(
        `Note: These variables are not being replaced as no corresponding values (either in .env or Github Actions) have been found`
      );
      console.log("");
    }
    // Print Error Variables
    if (context.env_error && Object.keys(context.env_error).length > 0) {
      console.log("=== Conversations Adapters: Error Variables ===");
      for (const key of Object.keys(context.env_error)) {
        console.log(`${key}: ${context.env_error[key]}`);
      }
      console.log("");
    }
    console.log(`======== End: ${headerMessage} ========`);
  } catch (err) {
    console.log("Error in printContextVariables:");
    console.log(err);
    return false;
  }
};
