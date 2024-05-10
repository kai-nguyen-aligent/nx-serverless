import { NxJsonConfiguration } from '@nx/devkit';

export const nxJson: NxJsonConfiguration = {
  affected: {
    defaultBase: 'origin/staging',
  },
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
    build: {
      dependsOn: ['^build'],
      inputs: ['production', '^production'],
      outputs: ['{projectRoot}/.serverless'],
      cache: true,
    },
    lint: {
      inputs: [
        'default',
        '{workspaceRoot}/.eslintrc.json',
        '{workspaceRoot}/.eslintignore',
      ],
      cache: true,
    },
    '@nx/vite:test': {
      inputs: ['default', '^production'],
      cache: true,
    },
  },
  workspaceLayout: {
    appsDir: 'services',
    libsDir: 'libs',
  },
};
