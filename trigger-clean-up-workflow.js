const { Octokit } = require("@octokit/core");

const { PERSONAL_TOKEN, NEW_REPOSITORY, OWNER } = process.env;

const octokit = new Octokit({ auth: PERSONAL_TOKEN });

const triggerCleanUpWorkflow = async (owner, repo) => {
  console.log('Triggering workflow ...')
  const response = await octokit.request('POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches', {
    owner,
    repo,
    workflow_id: 'clean-up-after-cloning.yml',
    ref: 'main'
  })

  console.log('workflow triggered')
  console.log(response);
}

const run = async () => {
  try {
    await triggerCleanUpWorkflow(OWNER, NEW_REPOSITORY);

  } catch (err) {
    console.log('Something went wrong!');
    console.log(err);
  }
}

run();
