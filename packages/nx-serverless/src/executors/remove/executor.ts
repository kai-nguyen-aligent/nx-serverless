import { ExecutorContext, runExecutor } from '@nx/devkit';
import { glob } from 'glob';
import { runCommandString } from '../../libs/cmd';
import { SlsRemoveExecutorSchema } from './schema';

export default async function execute(
  options: SlsRemoveExecutorSchema,
  context: ExecutorContext
) {
  console.log(`Current Project: ${context.projectName}`);
  console.log(`Options: ${JSON.stringify(options, null, 2)}`);

  // Find if project has any implicitDependencies.
  const implicitDependencies =
    context.projectsConfigurations.projects[context.projectName]
      .implicitDependencies || [];
  console.log(
    `Implicit Dependencies (${implicitDependencies.length}): ${implicitDependencies}`
  );

  if (options.removeDependencies && implicitDependencies.length) {
    // Run this executor for each of the implicitDependencies projects
    for (const dependency of implicitDependencies) {
      const results = await runExecutor(
        { project: dependency, target: 'remove' },
        {},
        context
      );
      for await (const result of results) {
        if (!result.success) {
          console.error(`Failed to remove project ${dependency}`);
          return { success: false };
        }
      }
    }
  }

  const workDir =
    context.projectsConfigurations.projects[context.projectName].root || '.';

  const serverlessFiles = await glob('serverless.{yml,yaml}', {
    cwd: workDir,
  });

  if (serverlessFiles.length !== 1) {
    console.error(
      `There are ${serverlessFiles.length} serverless.{yml,yaml} file(s) in ${workDir}`
    );
    return { success: false };
  }

  const result = await runCommandString(
    `echo 'serverless remove'`,
    workDir,
    options.debug
  );

  return { success: result !== 0 };
}
