import {
  getPackageManagerCommand,
  joinPathFragments,
  TargetDependencyConfig,
} from '@nx/devkit';

const pmc = getPackageManagerCommand();

export interface ServerlessPluginOptions {
  linkTargetName?: string;
  buildTargetName?: string;
  deployTargetName?: string;
  removeTargetName?: string;
}

export function buildLinkTarget(name: string) {
  return {
    executor: '@aligent/nx-serverless:link',
    cache: true,
    inputs: [{ externalDependencies: ['@aligent/nx-serverless'] }],
    outputs: [],
    metadata: {
      technologies: ['Nx'],
      description: `Link with Nx`,
      help: {
        command: `${pmc.exec} nx run ${name}:link`,
        example: {
          options: {
            dependOn: 'other,projects,list',
          },
        },
      },
    },
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
        command: `${pmc.exec} nx run ${name}:build`,
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
        command: `${pmc.exec} nx run ${name}:deploy`,
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
  namedInputs: Record<string, unknown>
) {
  // TODO: implement the dependency injection
  const dependenciesConfig: TargetDependencyConfig = {
    projects: '{dependencies}',
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
        command: `${pmc.exec} nx run ${name}:remove`,
        example: {},
      },
    },
  };
}
