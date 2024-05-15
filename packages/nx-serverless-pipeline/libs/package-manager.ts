import { glob } from 'glob';

export async function getPackageManagerCommands(directory = '.') {
  const globPattern = `${directory}/{package-lock,pnpm-lock,yarn}.{json,lock,yaml}`;
  const lockFiles = await glob(globPattern, {
    absolute: true,
  });

  if (lockFiles.length !== 1) {
    throw new Error(
      `Expected exactly one lock file, found: ${lockFiles.toString()}`
    );
  }

  const lockFile = lockFiles[0] as string;

  if (lockFile === 'package-lock.json') {
    return {
      cleanInstall: 'npm ci',
      execute: 'npx',
    };
  }

  if (lockFile === 'pnpm-lock.yaml') {
    return {
      cleanInstall: 'pnpm install --frozen-lockfile',
      execute: 'pnpm',
    };
  }

  if (lockFile === 'yarn.lock') {
    return {
      cleanInstall: 'yarn install --frozen-lockfile',
      execute: 'npx',
    };
  }

  throw new Error(`Unknown lock file: ${lockFile}`);
}
