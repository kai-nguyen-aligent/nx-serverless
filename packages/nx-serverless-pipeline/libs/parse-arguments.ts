import yargs from 'yargs';
import { defaultParameters } from '../libs/config';

export async function parseArguments() {
  return await yargs(process.argv.slice(1))
    .options({
      awsAccessKeyId: {
        type: 'string',
        demandOption: true,
        description: 'Injects AWS Access',
      },
      awsSecretAccessKey: {
        type: 'string',
        demandOption: true,
        description: 'Injects AWS Secret',
      },
      appUsername: {
        type: 'string',
        description:
          'The user to upload the badge as. Required if uploadBadge is true',
      },
      appPassword: {
        type: 'string',
        description:
          'The app password of the user uploading the badge. Required if uploadBadge is true',
      },
      cfnRole: {
        type: 'string',
        demandOption: true,
        description: 'CloudFormation service role to use for deployment',
      },
      debug: {
        type: 'string',
        default: defaultParameters.debug,
        description: 'Turn on extra debug information (Accept: true/false)',
      },
      stage: {
        type: 'string',
        default: defaultParameters.stage,
        description:
          'Define the stage to deploy. Must be exact three characters.',
      },
      timezone: {
        type: 'string',
        default: defaultParameters.timezone,
        description: 'Which time zone the time in the badge should use',
      },
      uploadBadge: {
        type: 'string',
        default: defaultParameters.uploadBadge,
        description:
          'Whether or not to upload a deployment badge to the repositories downloads section (Accept: true/false)',
      },
    })
    .parse();
}
