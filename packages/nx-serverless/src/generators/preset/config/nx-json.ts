import { NxJsonConfiguration } from '@nx/devkit';

export const nxJson: NxJsonConfiguration & { $schema: string } = {
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
