interface PackageJson {
  name?: string;
  author: string;
  private: boolean;
  description?: string;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  license: string;
}

export const packageJson: PackageJson = {
  author: 'Aligent Consulting',
  private: true,
  license: 'MIT',
  scripts: {
    test: 'nx affected -t test --coverage',
    'test:all': 'nx run-many -t test --coverage',
    lint: 'nx affected -t lint',
    'lint:all': 'nx run-many -t lint',
    format: 'nx format:check',
    'format:write': 'nx format:write',
    'check-types': 'nx affected -t check-types',
    'check-types:all': 'nx run-many -t check-types',
    prepare: "[ -d .git ] && git config core.hooksPath '.git-hooks' || true",
  },
  dependencies: {
    // NOTE: add common dependencies here
  },
  devDependencies: {
    '@aligent/serverless-conventions': 'latest',
    '@nx/js': '19.0.2',
    '@nx/vite': '19.0.2',
    '@nx/workspace': '19.0.2',
    '@tsconfig/node20': '^20.1.4',
    '@tsconfig/strictest': '^2.0.5',
    '@types/aws-lambda': '^8.10.137',
    '@types/node': '20.12.11',
    '@typescript-eslint/eslint-plugin': '^7.8.0',
    '@typescript-eslint/parser': '^7.8.0',
    '@vitest/coverage-v8': '^1.6.0',
    '@vitest/ui': '~1.6.0',
    dotenv: '^16.4.5',
    esbuild: '^0.20.2',
    eslint: '~8.56.0',
    'eslint-config-prettier': '9.1.0',
    'eslint-plugin-import': '^2.29.1',
    nx: '19.0.2',
    prettier: '^3.2.5',
    serverless: '^3.38.0',
    'serverless-esbuild': '^1.52.1',
    'serverless-step-functions': '^3.21.0',
    'ts-node': '10.9.2',
    tslib: '^2.6.2',
    typescript: '~5.4.5',
    vite: '~5.2.11',
    'vite-tsconfig-paths': '~4.3.2',
    vitest: '~1.6.0',
  },
};
