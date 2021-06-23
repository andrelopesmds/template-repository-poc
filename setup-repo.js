const { Octokit } = require("@octokit/core");
const sodium = require('tweetsodium');

const { PERSONAL_TOKEN, NEW_REPOSITORY, DUMMY_SECRET_PROD } = process.env;

const octokit = new Octokit({ auth: PERSONAL_TOKEN });

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

const addSecrets = async (repoId, environment, secretName, secretValue) => {
  // Get an environment public key
  const response = await octokit.request("GET /repositories/{repository_id}/environments/{environment_name}/secrets/public-key", {
    repository_id: repoId,
    environment_name: environment
  });
  const { key_id, key } = response.data;

  // Encrypt secret
  const messageBytes = Buffer.from(secretValue);
  const keyBytes = Buffer.from(key, 'base64');
  const encryptedBytes = sodium.seal(messageBytes, keyBytes);
  const encryptedSecretValue = Buffer.from(encryptedBytes).toString('base64');

  await octokit.request("PUT /repositories/{repository_id}/environments/{environment_name}/secrets/{secret_name}", {
    repository_id: repoId,
    environment_name: environment,
    secret_name: secretName,
    encrypted_value: encryptedSecretValue,
    key_id
  });
}

const run = async () => {
  try {
    // create repo
    const repoId = await createRepositoryFromTemplate(OWNER, TEMPLATE_REPO, NEW_REPOSITORY);

    // add secrets (create env + add secrets)
    await createEnvironment(OWNER, NEW_REPOSITORY, 'prod');
    await createEnvironment(OWNER, NEW_REPOSITORY, 'dev');

    await addSecrets(repoId, 'prod', 'DUMMY_SECRET_PROD', DUMMY_SECRET_PROD);

    // add groups (?)

    // copy branch protection settings
    await protectBranch(OWNER, NEW_REPOSITORY, 'main');
    await protectBranch(OWNER, NEW_REPOSITORY, 'dev');

  } catch (err) {
    console.log('Something went wrong!');
    console.log(err);
  }
}

run();
