#!/usr/bin/env node

import { intro, outro } from '@clack/prompts';
import type { CreateWorkspaceOptions } from 'create-nx-workspace';
import { createWorkspace } from 'create-nx-workspace';
import yargs from 'yargs';

const DEFAULT_NODE_VERSION = '20.13.1';
const DEFAULT_PACKAGE_MANAGER = 'npm';

async function main() {
  const argv = await yargs(process.argv.slice(1))
    .options({
      name: {
        type: 'string',
        demandOption: true,
        description: 'Set workspace name & directory',
      },
      brand: {
        type: 'string',
        demandOption: true,
        description: 'Set brand name (normally client name)',
      },
      'node-version': { type: 'string', default: DEFAULT_NODE_VERSION },
      'package-manager': { type: 'string', default: DEFAULT_PACKAGE_MANAGER },
    })
    .parse();

  const { name, brand } = argv;
  const nodeVersion = argv['node-version'];
  const packageManager = argv['package-manager'];

  // This assumes "nx-serverless" and "create-nx-serverless" are at the same version
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const presetVersion = require('../package.json').version;

  intro(
    `Creating the workspace for: ${name}, ${nodeVersion}, ${packageManager}`
  );

  const { directory } = await createWorkspace(
    `nx-serverless@${presetVersion}`,
    {
      name,
      brand,
      presetVersion,
      nodeVersion,
      nxCloud: 'skip',
      packageManager:
        packageManager as CreateWorkspaceOptions['packageManager'],
    }
  );

  outro(`Successfully created the workspace: ${directory}.`);
  process.exit(0);
}

main();
