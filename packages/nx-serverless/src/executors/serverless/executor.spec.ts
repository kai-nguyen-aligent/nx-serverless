import { ServerlessExecutorSchema } from './schema';
import executor from './executor';

const options: ServerlessExecutorSchema = {};

describe('Serverless Executor', () => {
  it('can run', async () => {
    const output = await executor(options);
    expect(output.success).toBe(true);
  });
});
