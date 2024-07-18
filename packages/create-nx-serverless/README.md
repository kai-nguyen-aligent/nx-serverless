# create-nx-serverless

A CLI tool to create a new Nx Serverless workspace, powered by Nx, a powerful tool for monorepo management.
This CLI tool utilises the `preset` generator in `@aligent/nx-serverless` package for generating new workspace.

## Usage

To create a new Nx Serverless workspace, run the following command in your terminal:

```bash
npx @aligent/create-nx-serverless --name=my-serverless-workspace
```

### Accepted arguments

- `name`: (Required) The name of the workspace to generate.
- `nodeVersion`: The Nodejs version to use in the generated workspace. Default: `20.13`
- `packageManager`: The package manager to use for generating the workspace. Default: `npm`
