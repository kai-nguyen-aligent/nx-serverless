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

export async function presetGenerator(
  tree: Tree,
  options: PresetGeneratorSchema
) {
  const projectRoot = `.`;
  const { name, presetVersion, nodeVersionMajor, nodeVersionMinor } = options;

  // FIXME: We can't use latest-version and ora because if ESM issue.
  // https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c
  // https://github.com/microsoft/TypeScript/issues/43329#issuecomment-922544562
  const tsConfigNodePackageName = `@tsconfig/node${nodeVersionMajor}`;
  const tsConfigNodeVersion = await latestVersion(tsConfigNodePackageName);

  updateNxJson(tree, {
    ...NX_JSON,
    generators: {
      '@aligent/nx-serverless:service': {
        brand: name,
        nodeVersionMajor: nodeVersionMajor,
      },
      ...NX_JSON.generators,
    },
  });

  updateJson(tree, 'package.json', (json) => {
    json = {
      name: `@${name}/integrations`,
      description: `${name} integrations mono-repository`,
      ...packageJson,
    };
    json.version = presetVersion;
    json.engines = {
      node: `>=${nodeVersionMajor}.${nodeVersionMinor}.0`,
    };
    json.devDependencies = {
      '@aligent/nx-serverless': presetVersion,
      '@aligent/nx-serverless-pipeline': presetVersion,
      ...json.devDependencies,
    };
    json.devDependencies[tsConfigNodePackageName] = `^${tsConfigNodeVersion}`;

    return json;
  });

  updateJson(tree, '.vscode/extensions.json', () => {
    return { ...VS_CODE_EXTENSIONS };
  });

  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, options);

  await formatFiles(tree);
}

export default presetGenerator;
