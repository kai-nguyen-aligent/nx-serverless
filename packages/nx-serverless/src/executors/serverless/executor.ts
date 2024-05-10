import { ServerlessExecutorSchema } from './schema';

export default async function runExecutor(options: ServerlessExecutorSchema) {
  console.log('Executor ran for Serverless', options);
  return {
    success: true,
  };
}
