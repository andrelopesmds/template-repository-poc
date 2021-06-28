const { Octokit } = require("@octokit/core");

const { PERSONAL_TOKEN, NEW_REPOSITORY, DUMMY_SECRET_PROD } = process.env;

const octokit = new Octokit({ auth: PERSONAL_TOKEN });

// Better to have this defined in yml
const OWNER = 'andrelopesmds';
const TEMPLATE_REPO = 'template-repository-poc';

const createRepositoryFromTemplate = async (templateOwner, templateRepo, newRepoName) => {
  const response = await octokit.request("POST /repos/{template_owner}/{template_repo}/generate", {
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

  // For some reason the repository is not ready immediately after creation
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
  await delay(5000);

  return response.data.id;
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
    // create repo
    await createRepositoryFromTemplate(OWNER, TEMPLATE_REPO, NEW_REPOSITORY);   

    // add groups (?)

    // copy branch protection settings
    //await protectBranch(OWNER, NEW_REPOSITORY, 'main');
    await protectBranch(OWNER, NEW_REPOSITORY, 'dev');

  } catch (err) {
    console.log('Something went wrong!');
    console.log(err);
  }
}

run();
