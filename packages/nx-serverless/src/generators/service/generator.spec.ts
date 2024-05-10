import { Tree, readProjectConfiguration } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { serviceGenerator } from './generator';
import { ServiceGeneratorSchema } from './schema';

describe('service generator', () => {
  let tree: Tree;
  const options: ServiceGeneratorSchema = { brand: 'test', name: 'test' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await serviceGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });
});
