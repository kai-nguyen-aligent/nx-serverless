#!/usr/bin/env node

import { intro, outro } from '@clack/prompts';
import type { CreateWorkspaceOptions } from 'create-nx-workspace';
import { createWorkspace } from 'create-nx-workspace';
import yargs from 'yargs';

const DEFAULT_NODE_VERSION = '20.13';
const DEFAULT_PACKAGE_MANAGER = 'npm';

async function main() {
  const commandIndex = process.argv.findIndex((text) =>
    text.endsWith('create-nx-serverless')
  );
  const argv = await yargs(process.argv.slice(commandIndex + 1))
    .options({
      name: {
        type: 'string',
        demandOption: true,
        description: 'Set workspace name & directory (normally client name)',
      },
      'node-version': { type: 'string', default: DEFAULT_NODE_VERSION },
      'package-manager': { type: 'string', default: DEFAULT_PACKAGE_MANAGER },
    })
    .usage('Usage: $0 --name [name]')
    .showHelpOnFail(false, 'Specify --help for available options')
    .parse();

  const { name } = argv;
  const nodeVersion = argv['node-version'].trim().split('.');
  const packageManager = argv['package-manager'];

  // This assumes "nx-serverless" and "create-nx-serverless" are at the same version
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const presetVersion = require('../package.json').version;

  intro(
    `Creating the workspace for: ${name}, using ${packageManager} and Nodejs v${nodeVersion.join(
      '.'
    )}`
  );

  const { directory } = await createWorkspace(
    `@aligent/nx-serverless@${presetVersion}`,
    {
      name,
      presetVersion,
      nodeVersionMajor: nodeVersion[0],
      nodeVersionMinor: nodeVersion[1],
      nxCloud: 'skip',
      packageManager:
        packageManager as CreateWorkspaceOptions['packageManager'],
    }
  );

  outro(`Successfully created the workspace: ${directory}.`);
  process.exit(0);
}

main();
