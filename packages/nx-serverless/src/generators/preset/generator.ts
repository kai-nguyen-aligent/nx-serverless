import {
  NxJsonConfiguration,
  Tree,
  formatFiles,
  generateFiles,
  updateJson,
  updateNxJson,
} from '@nx/devkit';
import * as latestVersion from 'latest-version';
import * as path from 'path';
import * as packageJson from './package.json';
import { PresetGeneratorSchema } from './schema';

const VS_CODE_EXTENSIONS = {
  recommendations: [
    'nrwl.angular-console',
    'esbenp.prettier-vscode',
    'dbaeumer.vscode-eslint',
    'editorconfig.editorconfig',
  ],
};

const NX_JSON: NxJsonConfiguration & { $schema: string } = {
  $schema: './node_modules/nx/schemas/nx-schema.json',
  defaultBase: 'origin/staging',
  plugins: [
    { plugin: '@aligent/nx-serverless', options: {} },
    { plugin: '@nx/eslint/plugin', options: {} },
    { plugin: '@nx/vite/plugin', options: {} },
  ],
  generators: {
    '@nx/js:library': {
      projectNameAndRootFormat: 'derived',
      bundler: 'none',
      unitTestRunner: 'vitest',
    },
  },
  namedInputs: {
    default: ['{projectRoot}/**/*', 'sharedGlobals'],
    production: [
      'default',
      '!{projectRoot}/.eslintrc.json',
      '!{projectRoot}/**/?(*.)+(spec|test).[jt]s?(x)?(.snap)',
      '!{projectRoot}/tsconfig.spec.json',
      '!{projectRoot}/jest.config.[jt]s',
      '!{projectRoot}/src/test-setup.[jt]s',
    ],
    sharedGlobals: [],
  },
  targetDefaults: {
    'check-types': { cache: true },
  },
  workspaceLayout: {
    appsDir: 'services',
    libsDir: 'libs',
  },
};

// FIXME: We can't use latest-version and ora because if ESM issue.
// https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c
// https://github.com/microsoft/TypeScript/issues/43329#issuecomment-922544562
async function getPackageVersion(
  packageName: string,
  semver: 'minor' | 'patch',
  version?: string
): Promise<string> {
  const latest = await latestVersion(packageName, { version });

  if (semver === 'minor') {
    return `^${latest}`;
  }

  return `~${latest}`;
}

export async function presetGenerator(
  tree: Tree,
  options: PresetGeneratorSchema
) {
  const { name, presetVersion, nodeVersion } = options;

  updateNxJson(tree, {
    ...NX_JSON,
    generators: {
      '@aligent/nx-serverless:service': {
        brand: name,
      },
      ...NX_JSON.generators,
    },
  });

  updateJson(tree, 'package.json', async () => {
    const [nodeVersionMajor, nodeVersionMinor] = nodeVersion.split('.');
    const tsConfigNode = `@tsconfig/node${nodeVersionMajor}`;

    const devDependencies = Object.fromEntries(
      Object.entries({
        '@aligent/nx-serverless': presetVersion,
        '@aligent/nx-serverless-pipeline': presetVersion,
        [tsConfigNode]: await getPackageVersion(tsConfigNode, 'minor'),
        ...packageJson.devDependencies,
      }).sort()
    );

    return {
      name: `@${name}/integrations`,
      description: `${name} integrations mono-repository`,
      version: presetVersion,
      engines: {
        node: `^${nodeVersionMajor}.${nodeVersionMinor}.0`,
      },
      devDependencies,
      ...packageJson,
    };
  });

  updateJson(tree, '.vscode/extensions.json', () => {
    return { ...VS_CODE_EXTENSIONS };
  });

  generateFiles(tree, path.join(__dirname, 'files'), '.', options);

  await formatFiles(tree);
}

export default presetGenerator;
