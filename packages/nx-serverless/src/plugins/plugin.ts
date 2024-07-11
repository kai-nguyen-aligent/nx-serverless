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
    const optionsHash = hashObject(options);
    const cachePath = join(workspaceDataDirectory, `sls-${optionsHash}.hash`);
    const targetsCache = readTargetsCache(cachePath);

    configFilePaths = Array.isArray(configFilePaths)
      ? configFilePaths
      : [configFilePaths];

    try {
      return await createNodesFromFiles(
        (configFile, options, context) =>
          createNodesInternal(configFile, options, context, targetsCache),
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
  targetsCache: Record<string, ServerlessTargets>
) {
  const projectRoot = dirname(configFilePath);
  // Do not create a project if package.json and project.json isn't there.
  const siblingFiles = readdirSync(join(context.workspaceRoot, projectRoot));
  if (
    !siblingFiles.includes('package.json') &&
    !siblingFiles.includes('project.json')
  ) {
    return {};
  }

  const normalizedOptions = normalizeOptions(options);

  // We do not want to alter how the hash is calculated, so appending the config file path to the hash
  // to prevent serverless files overwriting the target cache created by the other
  const hash =
    (await calculateHashForCreateNodes(
      projectRoot,
      normalizedOptions,
      context,
      [getLockFileName(detectPackageManager(context.workspaceRoot))]
    )) + configFilePath;

  targetsCache[hash] ??= await buildServerlessTargets(
    projectRoot,
    normalizedOptions,
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
  options: ServerlessPluginOptions,
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
