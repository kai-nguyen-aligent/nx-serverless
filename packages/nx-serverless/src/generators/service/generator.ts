import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  Tree,
} from '@nx/devkit';
import * as path from 'path';
import { ServiceGeneratorSchema } from './schema';

export async function serviceGenerator(
  tree: Tree,
  options: ServiceGeneratorSchema
) {
  const projectRoot = `services/${options.name}`;
  addProjectConfiguration(tree, options.name, {
    root: projectRoot,
    projectType: 'application',
    sourceRoot: `${projectRoot}/src`,
    targets: {
      build: {
        executor: 'nx:run-commands',
      },
      deploy: {
        executor: 'nx:run-commands',
      },
      remove: {
        executor: 'nx:run-commands',
      },
      lint: {
        executor: '@nx/linter:eslint',
      },
      test: {
        executor: '@nx/vite:test',
      },
    },
  });
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, options);
  await formatFiles(tree);
}

export default serviceGenerator;
