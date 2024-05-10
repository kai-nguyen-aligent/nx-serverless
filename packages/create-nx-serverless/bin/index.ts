#!/usr/bin/env node

import { intro, outro, text } from '@clack/prompts';
import type { CreateWorkspaceOptions } from 'create-nx-workspace';
import { createWorkspace } from 'create-nx-workspace';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const DEFAULT_NODE_VERSION = '20.13.1';
const DEFAULT_PACKAGE_MANAGER = 'npm';

async function main() {
  // TODO: add more meaningful intro
  intro('nx-serverless workspace generator');
  const argv = await yargs(hideBin(process.argv))
    .options({
      name: { type: 'string', alias: 'n', demandOption: true },
      brand: { type: 'string', alias: 'b', demandOption: true },
      'node-version': { type: 'string', default: DEFAULT_NODE_VERSION },
      'package-manager': { type: 'string', default: DEFAULT_PACKAGE_MANAGER },
    })
    .parse();

  console.log(argv);

  let name = argv.name;
  if (!name) {
    name = (await text({
      message: 'What is the name of your workspace?',
      initialValue: 'workspace-name',
      validate: (value) => {
        if (value.length < 1)
          return 'You need to provide a name for the workspace';
      },
    })) as string;

    if (!name) {
      throw new Error('Workspace name is required');
    }
  }

  let brand = argv.brand;
  if (!brand) {
    brand = (await text({
      message: 'Which brand will use this workspace?',
      initialValue: 'brand-name',
      validate: (value) => {
        if (value.length < 1)
          return 'You need to provide a brand for the workspace';
      },
    })) as string;

    if (!brand) {
      throw new Error('Workspace brand is required');
    }
  }

  const nodeVersion = argv['node-version'];
  const packageManager = argv['package-manager'];

  // This assumes "nx-serverless" and "create-nx-serverless" are at the same version
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const presetVersion = require('../package.json').version;

  console.log(
    `Creating the workspace for: ${name}, ${nodeVersion}, ${packageManager}`
  );

  // NOTE: update below to customize the workspace
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
