#!/usr/bin/env node

import { runCLICommand } from '../libs/cmd';
import { DEPLOYMENT_PROFILE, bitbucketEnvVars } from '../libs/config';
import { findServerlessYaml } from '../libs/find-serverless-yaml';
import { injectCfnRole } from '../libs/inject-cfn-role';
import { parseArguments } from '../libs/parse-arguments';
import { uploadDeploymentBadge } from '../libs/upload-deployment-badge';

async function main() {
  let deploymentStatus = false;

  const argv = await parseArguments();

  try {
    if (!argv.awsAccessKeyId || !argv.awsSecretAccessKey) {
      throw new Error('AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY not set');
    }

    const serverlessFiles = await findServerlessYaml(
      `${bitbucketEnvVars.cloneDir}/services`
    );
    await Promise.all(
      serverlessFiles.map((file) => injectCfnRole(file, argv.cfnRole))
    );

    await runCLICommand(
      [
        'npm ci',
        `npx serverless config credentials --provider aws --profile ${DEPLOYMENT_PROFILE}} --key ${argv.awsAccessKeyId} --secret ${argv.awsSecretAccessKey}`,
        `npx nx run-many -t deploy -- --verbose --stage ${argv.stage} --aws-profile ${DEPLOYMENT_PROFILE}`,
      ],
      argv.debug === 'true'
    );

    deploymentStatus = true;
  } catch (error) {
    console.error(
      'Deployment failed! Please check the logs for more details.Error:',
      error as Error
    );
    deploymentStatus = false;
  } finally {
    const statusCode = await uploadDeploymentBadge({
      deploymentStatus,
      uploadBadge: argv.uploadBadge === 'true',
      username: argv.appUsername,
      password: argv.appPassword,
      timezone: argv.timezone,
    });
    process.exit(statusCode);
  }
}

main();
