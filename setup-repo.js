const { Octokit } = require("@octokit/core");

const { PERSONAL_TOKEN, NEW_REPOSITORY } = process.env;

const octokit = new Octokit({ auth: PERSONAL_TOKEN });

const OWNER = 'andrelopesmds';
const TEMPLATE_REPO = 'template-repository-poc';

const createRepositoryFromTemplate = async (templateOwner, templateRepo, newRepoName) => {
  await octokit.request("POST /repos/{template_owner}/{template_repo}/generate", {
    template_owner: templateOwner,
    template_repo: templateRepo,
    name: newRepoName,
    include_all_branches: true,
    mediaType: {
      previews: [
        'baptiste'
      ]
    }
  })
}

const createEnvironment = async (owner, repo, environmentName) => {
  await octokit.request("PUT /repos/{owner}/{repo}/environments/{environment_name}", {
    owner,
    repo,
    environment_name: environmentName,
  })
}

const protectBranch = async (owner, repo, branch) => {
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
    // also create repo from here?
    await createRepositoryFromTemplate(OWNER, TEMPLATE_REPO, NEW_REPOSITORY);

    // add secrets (create env + add secrets)
    await createEnvironment(OWNER, NEW_REPOSITORY, 'prod');
    await createEnvironment(OWNER, NEW_REPOSITORY, 'dev');

    // add groups (?)

    // copy branch protection settings
    await protectBranch(OWNER, NEW_REPOSITORY, 'main');


  } catch (err) {
    console.log('Something went wrong!');
    console.log(err);
  }
}

run();
