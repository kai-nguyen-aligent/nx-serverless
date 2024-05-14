import * as cp from 'child_process';
import { bitbucketEnvVars } from './config';

interface Command {
  command: string;
  args: ReadonlyArray<string>;
}

function splitCommandAndArgs(command: string): Command {
  // Split the command string at all white spaces excluding white spaces wrapped with single quotes
  const cmd = command.split(/\s(?=(?:[^']*'[^']*')*[^']*$)/g);
  return {
    command: cmd.shift() as string,
    args: cmd,
  };
}

// Wrap spawn in a promise
function asyncSpawn(
  command: string,
  args?: ReadonlyArray<string>,
  options?: cp.SpawnOptionsWithoutStdio,
  debug = false
): Promise<number | null> {
  return new Promise(function (resolve, reject) {
    const process = cp.spawn(command, args, options);
    if (debug)
      console.log(
        `ℹ️ Executing command: ${command} ${args?.join(
          ' '
        )} with options: ${JSON.stringify(options)}`
      );

    process.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    process.stderr.on('data', (data) => {
      console.log(`Error: ${data.toString()}`);
    });

    process.on('exit', function (code) {
      if (code !== 0) reject(code);
      resolve(code);
    });

    process.on('error', function (err) {
      reject(err);
    });
  });
}

function runCommandString(
  command: string,
  workDir?: string,
  debug?: boolean
): Promise<number | null> {
  console.log(`Running command: ${command}`);
  const cmd = splitCommandAndArgs(command);
  return asyncSpawn(cmd.command, cmd.args, { cwd: workDir }, debug);
}

export async function runCLICommand(commandStr: Array<string>, debug: boolean) {
  const workDir = bitbucketEnvVars.cloneDir;
  console.log(`Running commands in ${workDir}`);

  for (const cmd of commandStr) {
    await runCommandString(cmd, workDir, debug);
  }
}
