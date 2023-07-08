const shell = require("shelljs");

const workspace_raw = shell.exec("twilio api:taskrouter:v1:workspaces:list", {
  silent: true,
});

console.log(workspace_raw);
