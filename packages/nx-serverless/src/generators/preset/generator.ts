import {
  addDependenciesToPackageJson,
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  Tree,
  updateJson,
} from '@nx/devkit';
import * as path from 'path';
import { dependencies, devDependencies, scripts } from './config';
import { PresetGeneratorSchema } from './schema';

export async function presetGenerator(
  tree: Tree,
  options: PresetGeneratorSchema
) {
  const projectRoot = `.`;
  addProjectConfiguration(tree, options.brand, {
    root: projectRoot,
    projectType: 'application',
    targets: {
      // NOTE: this update project.json file
      build: {
        executor: '@nx/next:build',
      },
    },
  });

  // NOTE: this update our package.json
  updateJson(tree, 'package.json', (json) => {
    const originalScripts = json.scripts || {};
    json.scripts = { ...originalScripts, ...scripts };
    return json;
  });

  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, options);
  await formatFiles(tree);

  return addDependenciesToPackageJson(tree, dependencies, devDependencies);
}

export default presetGenerator;
