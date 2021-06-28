const { Octokit } = require("@octokit/core");
const sodium = require('tweetsodium');

const { PERSONAL_TOKEN, NEW_REPOSITORY, DUMMY_SECRET_ENV } = process.env;

const octokit = new Octokit({ auth: PERSONAL_TOKEN });

// Better to have this defined in yml
const OWNER = 'andrelopesmds';

const createEnvironment = async (owner, repo, environmentName) => {
  await octokit.request("PUT /repos/{owner}/{repo}/environments/{environment_name}", {
    owner,
    repo,
    environment_name: environmentName,
  })
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

const getRepositoryId = async (owner, repo) => {
  const response = await octokit.request("GET /repos/{owner}/{repo}", {
    owner,
    repo
  })
  return response.data.id;
}

const run = async () => {
  try {
    const repoId = await getRepositoryId(OWNER, NEW_REPOSITORY);

    await createEnvironment(OWNER, NEW_REPOSITORY, 'dev');

    await addSecrets(repoId, 'dev', 'DUMMY_SECRET_ENV', DUMMY_SECRET_ENV);

  } catch (err) {
    console.log('Something went wrong!');
    console.log(err);
  }
}

run();