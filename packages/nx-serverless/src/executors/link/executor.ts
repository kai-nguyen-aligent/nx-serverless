import {
  ExecutorContext,
  ProjectConfiguration,
  readJsonFile,
  writeJsonFile,
} from '@nx/devkit';
import * as path from 'path';
import { LinkExecutorSchema } from './schema';

export default async function runExecutor(
  options: LinkExecutorSchema,
  context: ExecutorContext
) {
  const { dependOn } = options;
  console.log(dependOn);

  const projects = context.projectsConfigurations.projects;
  const currentProject = projects[context.projectName];

  for (const project in projects) {
    const { name } = projects[project];

    if (dependOn.includes(name)) {
      console.log(`Linking ${context.projectName} to ${name}`);

      const configFile = path.join(currentProject.root, 'project.json');
      const existingConfig = readJsonFile<ProjectConfiguration>(configFile);

      if (!existingConfig) {
        throw new Error(`Project config not found at ${configFile}`);
      }

      const { implicitDependencies } = existingConfig;

      const updatedImplicitDependencies: string[] = implicitDependencies
        ? [...implicitDependencies]
        : [];

      if (!updatedImplicitDependencies.includes(name)) {
        updatedImplicitDependencies.push(name);
      }

      writeJsonFile<ProjectConfiguration>(configFile, {
        ...existingConfig,
        implicitDependencies: updatedImplicitDependencies,
      });

      console.log(`${name} linked successfully`);
    }
  }

  return {
    success: true,
  };
}
