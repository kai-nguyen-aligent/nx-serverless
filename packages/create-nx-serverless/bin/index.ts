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
  cwd?: string
) {
  const message = `${command} ${args ? args.join(' ') : ''}`;
  const spinner = ora(`Executing '${message}'`).start();

  const options: cp.SpawnOptionsWithStdioTuple<
    cp.StdioNull,
    cp.StdioPipe,
    cp.StdioPipeNamed
  > = { cwd, detached: true, stdio: ['ignore', 'pipe', 'pipe'] };

  try {
    const result = await new Promise(function (resolve, reject) {
      const child = cp.spawn(command, args || [], options);

      // unref child process from parent
      // child.unref();

      child.stdout.on('data', (data) => {
        spinner.info(data.toString());
      });

      child.stderr.on('data', (data) => {
        spinner.warn(data.toString());
      });

      child.on('exit', function (code) {
        if (code !== 0) reject(code);
        resolve(code);
      });

      child.on('error', function (err) {
        reject(err);
      });
    });

    if (result !== 0) throw new Error(`ErrorCode: ${result}`);
    spinner.succeed(`Successfully executed '${message}'`);
  } catch (e) {
    spinner.fail(`Failed to execute '${message}'`);
  } finally {
    spinner.stop();
  }
}

async function main() {
  const commandIndex = process.argv.findIndex((text) =>
    text.includes('create-nx-serverless')
  );
  const argv = await yargs(process.argv.slice(commandIndex + 1))
    .options({
      name: {
        type: 'string',
        demandOption: true,
        description: 'Set workspace name & directory (normally client name)',
      },
      nodeVersion: {
        type: 'string',
        default: DEFAULT_NODE_VERSION,
        description: 'Set Nodejs version',
      },
      packageManager: {
        type: 'string',
        default: DEFAULT_PACKAGE_MANAGER,
        description: 'Set package manager',
        choices: ['npm', 'pnpm', 'yarn'],
      },
    })
    .usage('Usage: $0 --name [name]')
    .showHelpOnFail(false, 'Specify --help for available options')
    .version()
    .parse();

  const { name, nodeVersion, packageManager } = argv;

  // This assumes "nx-serverless", "create-nx-serverless" & "nx-serverless-pipeline" packages are at the same version
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const presetVersion = require('../package.json').version;

  ora(
    `Creating the workspace for: ${name}, using ${packageManager} and Nodejs v${nodeVersion}`
  ).succeed();

  const { directory } = await createWorkspace(
    `@aligent/nx-serverless@${presetVersion}`,
    {
      name,
      presetVersion,
      nodeVersion,
      nxCloud: 'skip',
      packageManager:
        packageManager as CreateWorkspaceOptions['packageManager'],
    }
  );

  ora('Prepare workspace dependencies').succeed();

  await installDependencies(packageManager, ['install'], directory);

  ora(`Successfully created workspace at: ${directory}`).succeed();
}

main();
