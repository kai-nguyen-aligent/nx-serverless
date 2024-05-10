#!/usr/bin/env node

import { intro, outro, select, text } from '@clack/prompts';
import type { CreateWorkspaceOptions } from 'create-nx-workspace';
import { createWorkspace } from 'create-nx-workspace';

async function main() {
  // TODO: add more meaningful intro
  intro('nx-serverless workspace generator');

  let brand = process.argv[2]; // TODO: use libraries like yargs or enquirer to set your workspace name
  if (!brand) {
    brand = (await text({
      message: 'What brand would you like to bootstrap this workspace for?',
      validate(value) {
        if (value.length < 3) {
          return 'Brand is required';
        }
      },
    })) as string;

    if (!brand) {
      throw new Error('Please provide a brand name for the workspace');
    }
  }

  // let targetDirectory = process.argv[3];
  // if (!targetDirectory) {
  //   targetDirectory = (await text({
  //     message: 'What directory would you like to create this workspace in?',
  //     initialValue: brand,
  //     validate(value) {
  //       if (value === brand) {
  //         return 'Using brand name as directory for bootstrapping';
  //       }
  //     },
  //   })) as string;

  //   if (!targetDirectory) {
  //     throw new Error('Please provide a directory name for the workspace');
  //   }
  // }

  let nodeVersion = process.argv[3];
  if (nodeVersion) {
    nodeVersion = (await select({
      message: 'What version of Node.js do you want to use?',
      options: [
        { value: 'nodejs20.x', label: 'Node.js v20' },
        { value: 'nodejs22.x', label: 'Node.js v22' },
      ],
    })) as string;
  }

  let packageManager = process.argv[4];
  if (packageManager) {
    packageManager = (await select({
      message: 'Which package manager do you want to use?',
      options: [
        { value: 'npm', label: 'npm' },
        { value: 'pnpm', label: 'pnpm' },
        { value: 'yarn', label: 'yarn' },
      ],
    })) as string;
  }

  console.log(`Creating the workspace for: ${brand}`);

  // This assumes "nx-serverless" and "create-nx-serverless" are at the same version
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const presetVersion = require('../package.json').version;

  // TODO: update below to customize the workspace
  const { directory } = await createWorkspace(
    `nx-serverless@${presetVersion}`,
    {
      name: brand,
      nodeVersion,
      nxCloud: 'skip',
      packageManager:
        packageManager as CreateWorkspaceOptions['packageManager'],
    }
  );

  outro(`Successfully created the workspace: ${directory}.`);
}

main();
