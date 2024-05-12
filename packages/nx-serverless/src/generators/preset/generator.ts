import {
  Tree,
  formatFiles,
  generateFiles,
  updateJson,
  updateNxJson,
} from '@nx/devkit';
import * as path from 'path';
import { nxJson } from './config/nx-json';
import { packageJson } from './config/package-json';
import { vsCodeExtensions } from './config/vscode-extensions';
import { PresetGeneratorSchema } from './schema';

export async function presetGenerator(
  tree: Tree,
  options: PresetGeneratorSchema
) {
  const projectRoot = `.`;

  updateNxJson(tree, {
    ...nxJson,
    generators: {
      ...nxJson.generators,
      '@aligent/nx-serverless:service': { brand: options.name },
    },
  });

  updateJson(tree, 'package.json', (json) => {
    json = {
      name: `@${options.name}/integrations`,
      description: `${options.name} integrations mono-repository`,
      ...packageJson,
    };
    json.version = options.presetVersion;
    json.engines = { node: `^${options.nodeVersion}` };
    json.engines[`${options.packageManager}`] = 'latest';
    json.devDependencies = {
      '@aligent/nx-serverless': options.presetVersion,
      ...packageJson.devDependencies,
    };
    return json;
  });

  updateJson(tree, '.vscode/extensions.json', () => {
    return { ...vsCodeExtensions };
  });

  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, options);
  await formatFiles(tree);
}

export default presetGenerator;
