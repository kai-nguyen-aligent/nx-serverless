import {
  CreateNodesContext,
  createNodesFromFiles,
  CreateNodesV2,
  detectPackageManager,
  ProjectConfiguration,
  readJsonFile,
  TargetConfiguration,
  writeJsonFile,
} from '@nx/devkit';
import { calculateHashForCreateNodes } from '@nx/devkit/src/utils/calculate-hash-for-create-nodes';
import { getNamedInputs } from '@nx/devkit/src/utils/get-named-inputs';
import { getLockFileName } from '@nx/js';
import { existsSync, readdirSync } from 'fs';
import { hashObject } from 'nx/src/hasher/file-hasher';
import { workspaceDataDirectory } from 'nx/src/utils/cache-directory';
import { dirname, join } from 'path';
import {
  buildBuildTarget,
  buildCheckTypesTarget,
  buildDeployTarget,
  buildFormatTarget,
  buildLinkTarget,
  buildRemoveTarget,
  normalizeOptions,
  ServerlessPluginOptions,
} from '../utils/targets';

type ServerlessTargets = Pick<ProjectConfiguration, 'targets' | 'metadata'>;

const serverlessConfigPattern = '**/serverless.{yml,yaml}';
const serverlessBuildOutput = '{projectRoot}/.serverless';

// NOTE: [Nx 21.X] The CreateNodesV2 typing will be removed, as it has replaced CreateNodes
export const createNodesV2: CreateNodesV2<ServerlessPluginOptions> = [
  serverlessConfigPattern,
  async (
    configFilePaths: readonly string[],
    options,
    context: CreateNodesContext
  ) => {
    const cacheHash = hashObject(options);
    const cachePath = join(
      workspaceDataDirectory,
      `serverless-${cacheHash}.hash`
    );
    const targetsCache = readTargetsCache(cachePath);

    // Ensure configFilePaths is an array as glob returns a string if there is only one file
    configFilePaths = Array.isArray(configFilePaths)
      ? configFilePaths
      : [configFilePaths];

    const projects = getProjects(context.workspaceRoot, configFilePaths);
    const dependencies = getDependencies(projects);

    try {
      return await createNodesFromFiles(
        (configFile, options, context) =>
          createNodesInternal(
            configFile,
            options,
            context,
            dependencies,
            targetsCache
          ),
        configFilePaths,
        options,
        context
      );
    } finally {
      writeTargetsCache(cachePath, targetsCache);
    }
  },
];

async function createNodesInternal(
  configFilePath: string,
  options: ServerlessPluginOptions,
  context: CreateNodesContext,
  dependencies: Record<string, string[]>,
  targetsCache: Record<string, ServerlessTargets>
) {
  const projectRoot = dirname(configFilePath);

  if (!isProject(context.workspaceRoot, projectRoot)) {
    return {};
  }

  const normalizedOptions = normalizeOptions(options);

  // We do not want to alter how the hash is calculated, so appending the config file path to the hash
  // to prevent overwriting the target cache created by the other plugins.
  const hash =
    (await calculateHashForCreateNodes(
      projectRoot,
      // We also make sure that the cache tracks projects dependencies graph.
      { ...options, dependencies },
      context,
      [getLockFileName(detectPackageManager(context.workspaceRoot))]
    )) + configFilePath;

  targetsCache[hash] ??= await buildServerlessTargets(
    projectRoot,
    normalizedOptions,
    dependencies,
    context
  );

  const { targets, metadata } = targetsCache[hash];
  const project: ProjectConfiguration = {
    root: projectRoot,
    targets,
    metadata,
  };

  return {
    projects: {
      [projectRoot]: project,
    },
  };
}

async function buildServerlessTargets(
  projectRoot: string,
  options: Required<ServerlessPluginOptions>,
  dependencies: Record<string, string[]>,
  context: CreateNodesContext
): Promise<ServerlessTargets> {
  const name = readJsonFile(join(projectRoot, 'project.json')).name;
  const namedInputs = getNamedInputs(projectRoot, context);

  const targets: Record<string, TargetConfiguration> = {};

  targets[options.buildTargetName] = buildBuildTarget(
    name,
    projectRoot,
    namedInputs,
    [serverlessBuildOutput]
  );

  targets[options.deployTargetName] = buildDeployTarget(
    name,
    projectRoot,
    namedInputs
  );

  targets[options.removeTargetName] = buildRemoveTarget(
    name,
    projectRoot,
    dependencies,
    namedInputs
  );

  targets[options.checkTypesTargetName] = buildCheckTypesTarget(
    name,
    projectRoot,
    namedInputs
  );

  targets[options.formatTargetName] = buildFormatTarget(
    name,
    projectRoot,
    namedInputs
  );

  targets[options.linkTargetName] = buildLinkTarget(name);

  const metadata = {};
  return { targets, metadata };
}

function readTargetsCache(
  cachePath: string
): Record<string, ServerlessTargets> {
  return existsSync(cachePath) ? readJsonFile(cachePath) : {};
}

function writeTargetsCache(
  cachePath: string,
  cache: Record<string, ServerlessTargets>
) {
  writeJsonFile(cachePath, cache);
}

// It's a project if both package.json and project.json are there.
function isProject(workspaceRoot: string, projectRoot: string): boolean {
  const siblingFiles = readdirSync(join(workspaceRoot, projectRoot));

  return (
    siblingFiles.includes('package.json') &&
    siblingFiles.includes('project.json')
  );
}

function getProjects(
  workspaceRoot: string,
  configFilePaths: readonly string[]
) {
  return configFilePaths
    .map((path) => {
      const projectRoot = dirname(path);
      if (!isProject(workspaceRoot, projectRoot)) {
        return null;
      }

      return readJsonFile<ProjectConfiguration>(
        join(projectRoot, 'project.json')
      );
    })
    .filter(Boolean);
}

function getDependencies(projects: ProjectConfiguration[]) {
  const dependencies: Record<string, string[]> = {};

  projects.forEach(
    (project) =>
      (dependencies[project.name] = project.implicitDependencies || [])
  );

  return dependencies;
}
