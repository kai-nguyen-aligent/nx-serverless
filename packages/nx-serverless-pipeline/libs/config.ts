interface BitbucketEnvironments {
  branch?: string;
  cloneDir?: string;
  repoSlug?: string;
  workspace?: string;
}

interface DefaultParameters {
  cmd: string;
  debug: string;
  stage: string;
  timezone: string;
  uploadBadge: string;
}

export const DEPLOYMENT_PROFILE = 'bitbucket-deployer';

export const bitbucketEnvVars: BitbucketEnvironments = {
  branch: process.env['BITBUCKET_BRANCH'],
  cloneDir: process.env['BITBUCKET_CLONE_DIR'],
  repoSlug: process.env['BITBUCKET_REPO_SLUG'],
  workspace: process.env['BITBUCKET_WORKSPACE'],
};

export const defaultParameters: DefaultParameters = {
  cmd: 'deploy',
  debug: 'false',
  stage: 'stg',
  timezone: 'Australia/Adelaide',
  uploadBadge: 'false',
};
