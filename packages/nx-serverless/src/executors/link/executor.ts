import {
  ExecutorContext,
  ProjectConfiguration,
  readJsonFile,
  writeJsonFile,
} from '@nx/devkit';
import * as ora from 'ora';
import * as path from 'path';
import { LinkExecutorSchema } from './schema';

export default async function runExecutor(
  options: LinkExecutorSchema,
  context: ExecutorContext
) {
  const { from, to } = options;

  try {
    if ((from && to) || (!from && !to)) {
      throw new Error('Only specify "--from" or "--to"');
    }

    const projects = context.projectsConfigurations.projects;
    const currentProject = projects[context.projectName];

    for (const project in projects) {
      const targetProject = projects[project];

      if (to.includes(targetProject.name)) {
        const configFile = path.join(currentProject.root, 'project.json');
        const existingConfig = readJsonFile<ProjectConfiguration>(configFile);

        if (!existingConfig) {
          throw new Error(`Project config not found at ${configFile}`);
        }

        const implicitDependencies = updateProjectImplicitDependencies(
          existingConfig,
          targetProject.name
        );

        writeJsonFile<ProjectConfiguration>(configFile, {
          ...existingConfig,
          implicitDependencies,
        });

        ora(
          `${currentProject.name} successfully linked TO ${targetProject.name}`
        ).succeed();
      }

      if (from.includes(targetProject.name)) {
        const configFile = path.join(targetProject.root, 'project.json');
        const existingConfig = readJsonFile<ProjectConfiguration>(configFile);

        if (!existingConfig) {
          throw new Error(`Project config not found at ${configFile}`);
        }

        const implicitDependencies = updateProjectImplicitDependencies(
          existingConfig,
          currentProject.name
        );

        writeJsonFile<ProjectConfiguration>(configFile, {
          ...existingConfig,
          implicitDependencies,
        });

        ora(
          `${currentProject.name} successfully linked FROM ${targetProject.name}`
        ).succeed();
      }
    }

    return { success: true };
  } catch (err) {
    ora((err as Error).message).fail();
    return { success: false };
  }
}

function updateProjectImplicitDependencies(
  targetConfig: ProjectConfiguration,
  projectName: string
) {
  const implicitDependencies = targetConfig.implicitDependencies || [];

  if (!implicitDependencies.includes(projectName)) {
    implicitDependencies.push(projectName);
  }

  return implicitDependencies;
}
