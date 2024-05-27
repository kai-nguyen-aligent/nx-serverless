import { ExecutorContext, readProjectConfiguration, Tree } from '@nx/devkit';
import { LinkExecutorSchema } from './schema';

export default async function runExecutor(
  options: LinkExecutorSchema,
  context: ExecutorContext,
  tree: Tree
) {
  const { dependOn } = options;
  console.log(dependOn);

  const projects = context.projectsConfigurations.projects;

  for (const project in projects) {
    const name = projects[project].name;
    console.log('Project:', name);
    const configuration = readProjectConfiguration(tree, name);
    console.log(configuration.implicitDependencies);
  }
}
