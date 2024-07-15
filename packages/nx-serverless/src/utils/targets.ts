import {
  getPackageManagerCommand,
  joinPathFragments,
  TargetDependencyConfig,
} from '@nx/devkit';

const pmc = getPackageManagerCommand();

export interface ServerlessPluginOptions {
  buildTargetName?: string;
  deployTargetName?: string;
  removeTargetName?: string;
  checkTypesTargetName?: string;
  formatTargetName?: string;
  linkTargetName?: string;
  unlinkTargetName?: string;
}

export function normalizeOptions(
  options: ServerlessPluginOptions
): Required<ServerlessPluginOptions> {
  return {
    buildTargetName: options.buildTargetName || 'build',
    deployTargetName: options.deployTargetName || 'deploy',
    removeTargetName: options.removeTargetName || 'remove',
    checkTypesTargetName: options.checkTypesTargetName || 'check-types',
    formatTargetName: options.formatTargetName || 'format',
    linkTargetName: options.linkTargetName || 'link',
    unlinkTargetName: options.unlinkTargetName || 'unlink',
  };
}

export function buildBuildTarget(
  name: string,
  projectRoot: string,
  namedInputs: Record<string, unknown>,
  outputs: string[]
) {
  const dependenciesConfig: TargetDependencyConfig = {
    projects: '{dependencies}',
    target: 'build',
    params: 'forward',
  };

  return {
    command: 'serverless package',
    options: { cwd: joinPathFragments(projectRoot) },
    cache: true,
    dependsOn: [dependenciesConfig],
    inputs: [
      ...('production' in namedInputs
        ? ['production', '^production']
        : ['default', '^default']),
      { externalDependencies: ['serverless'] },
    ],
    outputs,
    metadata: {
      technologies: ['Serverless'],
      description: `Build for Serverless`,
      help: {
        command: `${pmc.exec} nx run ${name}:build --help`,
        example: {
          options: {
            stage: 'dev',
            profile: 'development',
          },
        },
      },
    },
  };
}

export function buildDeployTarget(
  name: string,
  projectRoot: string,
  namedInputs: Record<string, unknown>
) {
  const dependenciesConfig: TargetDependencyConfig = {
    projects: '{dependencies}',
    target: 'deploy',
    params: 'forward',
  };

  return {
    command: 'serverless deploy',
    options: { cwd: joinPathFragments(projectRoot) },
    cache: false,
    dependsOn: [dependenciesConfig],
    inputs: [
      ...('production' in namedInputs
        ? ['production', '^production']
        : ['default', '^default']),
      { externalDependencies: ['serverless'] },
    ],
    metadata: {
      technologies: ['Serverless'],
      description: `Deploy to Serverless`,
      help: {
        command: `${pmc.exec} nx run ${name}:deploy --help`,
        example: {
          options: {
            stage: 'dev',
            profile: 'development',
          },
        },
      },
    },
  };
}

export function buildRemoveTarget(
  name: string,
  projectRoot: string,
  dependencies: Record<string, string[]>,
  namedInputs: Record<string, unknown>
) {
  // Find and collect all the project names where this project is a dependency
  const projects = Object.keys(dependencies).filter((dep) =>
    dependencies[dep].includes(name)
  );

  const dependenciesConfig: TargetDependencyConfig = {
    projects,
    target: 'remove',
    params: 'forward',
  };

  return {
    command: 'serverless remove',
    options: { cwd: joinPathFragments(projectRoot) },
    cache: false,
    dependsOn: [dependenciesConfig],
    inputs: [
      ...('production' in namedInputs
        ? ['production', '^production']
        : ['default', '^default']),
      { externalDependencies: ['serverless'] },
    ],
    metadata: {
      technologies: ['Serverless'],
      description: `Remove from Serverless`,
      help: {
        command: `${pmc.exec} nx run ${name}:remove --help`,
        example: {
          options: {
            stage: 'dev',
            profile: 'development',
          },
        },
      },
    },
  };
}

export function buildCheckTypesTarget(
  name: string,
  projectRoot: string,
  namedInputs: Record<string, unknown>
) {
  return {
    command: 'tsc --noEmit --pretty',
    options: { cwd: joinPathFragments(projectRoot) },
    inputs: [
      ...('production' in namedInputs
        ? ['production', '^production']
        : ['default', '^default']),
      { externalDependencies: ['typescript'] },
    ],
    metadata: {
      technologies: ['TypeScript'],
      description: 'Check TypeScript types',
      help: {
        command: `${pmc.exec} nx run ${name}:check-types --help`,
        example: {},
      },
    },
  };
}

export function buildFormatTarget(
  name: string,
  projectRoot: string,
  namedInputs: Record<string, unknown>
) {
  return {
    command: 'prettier .',
    options: { cwd: joinPathFragments(projectRoot) },
    input: [
      ...('production' in namedInputs
        ? ['production', '^production']
        : ['default', '^default']),
      { externalDependencies: ['prettier'] },
    ],
    metadata: {
      technologies: ['Prettier'],
      description: 'Format files with Prettier',
      help: {
        command: `${pmc.exec} nx run ${name}:format --help`,
        example: {
          options: {
            write: false,
          },
        },
      },
    },
  };
}

export function buildLinkTarget(name: string) {
  return {
    executor: '@aligent/nx-serverless:link',
    cache: true,
    inputs: [{ externalDependencies: ['@aligent/nx-serverless'] }],
    metadata: {
      technologies: ['Nx'],
      description: `Link with Nx`,
      help: {
        command: `${pmc.exec} nx run ${name}:link --help`,
        example: {
          options: {
            dependOn: 'other,projects,list',
          },
        },
      },
    },
  };
}
