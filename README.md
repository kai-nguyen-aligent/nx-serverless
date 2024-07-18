# Nx Serverless Toolchains

This contains toolchains to help build and manage serverless applications using Nx, a powerful tool for monorepo management.

## Packages

This monorepo includes the following packages:

@aligent/create-nx-serverless: A CLI tool to create a new Nx Serverless workspace.
@aligent/nx-serverless: A collection of Nx generators, executors, and plugins for serverless development.
@aligent/serverless-pipeline: A library for defining and executing serverless deployment pipelines.

For more information, please check the ReadMe file within each package.

## Development

1. Install packages dependencies by `npm ci`.
2. Start Local Registry for development: `npx nx start-local-registry`.
3. Publish packages (to local registry): `npx nx release vX.X.X`.
4. Test run `@aligent/create-nx-serverless` and `@aligent/nx-serverless`:

- Open a new terminal and run `npx @aligent/create-nx-serverless --name=test`.
- Once the new workspace is generated, open it with VSCode by running `code ./test`.
- Generate a new service in your newly created workspace: `npx nx generate service test1`.

## Planning features

- [-] Deployment pipeline -> nodeJS container + pnpm
- [x] Typescript compilation to check types (`tsc --noEmit`)
- [x] Root client configuration (e.g. service name prefix)
- [-] Base vite configuration -> this works for service generator
- [ ] MICRO:46: Importing code from internal libraries
- [ ] Bespoke library generator? -> use same base vite configuration if we do this
- [x] MICRO-309: Develop workspace [preset](https://nx.dev/extending-nx/recipes/create-preset)
- [x] Pre-commit hooks
- [ ] MICRO-53: Add error notification service
- [ ] Add step function metric/notification configuration
- [ ] Add X-Ray configuration
- [x] MICRO-65: Handle service removal (serverless remove)
