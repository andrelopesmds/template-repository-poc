const { Octokit } = require("@octokit/core");

const octokit = new Octokit({ auth: process.env.PERSONAL_TOKEN });

const run = async () => {
  const response = await octokit.request("GET /orgs/{org}/repos", {
    org: "andrelopesmds",
    type: "private",
  });
  
  console.log(response);
}


run();