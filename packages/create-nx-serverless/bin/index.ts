#!/usr/bin/env node

import * as cp from 'child_process';
import type { CreateWorkspaceOptions } from 'create-nx-workspace';
import { createWorkspace } from 'create-nx-workspace';
import * as ora from 'ora';
import yargs from 'yargs';

const DEFAULT_NODE_VERSION = '20.13';
const DEFAULT_PACKAGE_MANAGER = 'npm';

async function installDependencies(
  command: string,
  args?: ReadonlyArray<string>,
  options?: cp.SpawnOptionsWithoutStdio
) {
  const spinner = ora('Installing workspace dependencies').start();

  try {
    const result = await new Promise(function (resolve, reject) {
      const process = cp.spawn(command, args, options);

      process.stdout.on('data', (data) => {
        spinner.info(data.toString());
      });

      process.stderr.on('data', (data) => {
        spinner.warn(data.toString());
      });

      process.on('exit', function (code) {
        if (code !== 0) reject(code);
        resolve(code);
      });

      process.on('error', function (err) {
        reject(err);
      });
    });

    if (result !== 0) throw new Error(`Installation failed`);
    spinner.succeed('Successfully install workspace dependencies');
  } catch (e) {
    spinner.fail(
      (e as Error).message || 'Unable to install workspace dependencies'
    );
  } finally {
    spinner.stop();
  }
}

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
      nodeVersion: { type: 'string', default: DEFAULT_NODE_VERSION },
      packageManager: { type: 'string', default: DEFAULT_PACKAGE_MANAGER },
    })
    .usage('Usage: $0 --name [name]')
    .showHelpOnFail(false, 'Specify --help for available options')
    .parse();

  const { name, packageManager } = argv;
  const nodeVersion = argv.nodeVersion.trim().split('.');

  // This assumes "nx-serverless", "create-nx-serverless" & "nx-serverless-pipeline" packages are at the same version
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const presetVersion = require('../package.json').version;

  ora(
    `Creating the workspace for: ${name}, using ${packageManager} and Nodejs v${nodeVersion.join(
      '.'
    )}`
  ).succeed();

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

  ora('Prepare workspace dependencies').succeed();

  await installDependencies(packageManager, ['install'], {
    cwd: directory,
  });
}

main();
