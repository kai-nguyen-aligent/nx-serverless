#!/usr/bin/env node

import { runCLICommand } from '../libs/cmd';
import { DEPLOYMENT_PROFILE, bitbucketEnvVars } from '../libs/config';
import { findServerlessYaml } from '../libs/find-serverless-yaml';
import { injectCfnRole } from '../libs/inject-cfn-role';
import { getPackageManagerCommands } from '../libs/package-manager';
import { parseArguments } from '../libs/parse-arguments';
import { uploadDeploymentBadge } from '../libs/upload-deployment-badge';

async function main() {
  let deploymentStatus = false;

  const argv = await parseArguments();

  try {
    if (!argv.awsAccessKeyId || !argv.awsSecretAccessKey) {
      throw new Error('AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY not set');
    }

    if (argv.stage.length !== 3) {
      throw new Error('Stage must be 3 characters');
    }

    if (argv.cmd !== 'deploy' && argv.cmd !== 'remove') {
      throw new Error('Invalid serverless command');
    }

    const serverlessFiles = await findServerlessYaml(
      `${bitbucketEnvVars.cloneDir}/services`
    );
    await Promise.all(
      serverlessFiles.map((file) => injectCfnRole(file, argv.cfnRole))
    );

    const { cleanInstall, execute } = await getPackageManagerCommands(
      bitbucketEnvVars.cloneDir
    );

    await runCLICommand(
      [
        cleanInstall,
        `${execute} serverless config credentials --provider aws --profile ${DEPLOYMENT_PROFILE}} --key ${argv.awsAccessKeyId} --secret ${argv.awsSecretAccessKey}`,
        `${execute} nx run-many -t ${argv.cmd} -- --verbose --stage ${argv.stage} --aws-profile ${DEPLOYMENT_PROFILE}`,
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
