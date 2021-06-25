const { Octokit } = require("@octokit/core");

const { PERSONAL_TOKEN } = process.env;

const octokit = new Octokit({ auth: PERSONAL_TOKEN });

const owner = 'andrelopesmds';
const repo = 'template-repository-poc';

const protectBranch = async (branch) => {
  await octokit.request("PUT /repos/{owner}/{repo}/branches/{branch}/protection", {
    owner,
    repo,
    branch,
    required_status_checks: {
      strict: true,
      contexts: [
        'contexts'
      ]
    },
    enforce_admins: true,
    required_pull_request_reviews: null,
    restrictions: null
  });
}

const run = async () => {
  try {
    // copy secrets
    const r = await octokit.request('GET /repos/{owner}/{repo}/actions/secrets/{secret_name}', {
      owner,
      repo,
      secret_name: 'DUMMY_SECRET'  
    })

    console.log(r)

    // add groups

    // copy branch protection settings
    await protectBranch('main');


  } catch (err) {
    console.log('Something went wrong!');
    console.log(err);
  }
}

run();
