import { NxJsonConfiguration } from '@nx/devkit';

export const nxJson: NxJsonConfiguration & { $schema: string } = {
  $schema: './node_modules/nx/schemas/nx-schema.json',
  defaultBase: 'origin/staging',
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
      executor: 'nx:run-commands',
      options: {
        command: 'serverless package',
        cwd: '{projectRoot}',
        color: true,
      },
      dependsOn: ['^build'],
      inputs: ['production', '^production'],
      outputs: ['{projectRoot}/.serverless'],
      cache: true,
    },
    deploy: {
      executor: 'nx:run-commands',
      options: {
        command: 'serverless deploy',
        cwd: '{projectRoot}',
        color: true,
      },
      cache: false,
    },
    remove: {
      executor: 'nx:run-commands',
      options: {
        command: 'serverless remove',
        cwd: '{projectRoot}',
        color: true,
      },
      cache: false,
    },
    lint: {
      executor: '@nx/linter:eslint',
      options: {
        lintFilePatterns: ['{projectRoot}/**/*.ts'],
        maxWarnings: 0,
      },
      inputs: [
        'default',
        '{workspaceRoot}/.eslintrc.json',
        '{workspaceRoot}/.eslintignore',
      ],
      outputs: ['{options.outputFile}'],
      cache: true,
    },
    test: {
      executor: '@nx/vite:test',
      options: {
        passWithNoTests: true,
        reportsDirectory: '{workspaceRoot}/coverage/{projectRoot}',
      },
      inputs: ['default', '^production'],
      outputs: ['{options.reportsDirectory}'],
      cache: true,
    },
  },
  workspaceLayout: {
    appsDir: 'services',
    libsDir: 'libs',
  },
};
