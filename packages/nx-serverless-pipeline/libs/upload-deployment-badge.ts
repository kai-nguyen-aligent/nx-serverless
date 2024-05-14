import axios from 'axios';
import { makeBadge } from 'badge-maker';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import FormData from 'form-data';
import { bitbucketEnvVars } from './config';

dayjs.extend(utc);
dayjs.extend(timezone);

interface UploadBadgeInput {
  deploymentStatus: boolean;
  uploadBadge: boolean;
  username?: string;
  password?: string;
  timezone: string;
}

// This function try to upload deployment badge the return exit status code
// Return 0 when both deployment & uploading badge was successful. Return 1 otherwise
export async function uploadDeploymentBadge(
  input: UploadBadgeInput
): Promise<number> {
  const { deploymentStatus, uploadBadge, username, password, timezone } = input;
  let statusCode = deploymentStatus ? 0 : 1;

  try {
    if (!uploadBadge) {
      console.log('Skipping badge upload');
      return statusCode;
    }

    if (!username || !password) {
      throw new Error(
        'APP_USERNAME or APP_PASSWORD not set, we cannot upload badge without them.'
      );
    }

    const badge = generateDeploymentBadge(deploymentStatus, timezone);

    const formData = new FormData();
    formData.append('files', badge, {
      filename: `${bitbucketEnvVars.branch}_status.svg`,
      contentType: 'image/svg+xml',
    });

    await axios.post(
      `https://api.bitbucket.org/2.0/repositories/${bitbucketEnvVars.workspace}/${bitbucketEnvVars.repoSlug}/downloads`,
      formData,
      {
        auth: {
          username,
          password,
        },
      }
    );
  } catch (error) {
    console.error(`Error: ${error as Error}`);
    statusCode = 1;
  }

  return statusCode;
}

function generateDeploymentBadge(deploymentStatus: boolean, timezone: string) {
  const time = dayjs(new Date()).tz(timezone).format('DD MMM, YYYY, HH:mm');

  return makeBadge({
    label: 'deployment',
    message: time,
    color: deploymentStatus ? 'green' : 'red',
  });
}
