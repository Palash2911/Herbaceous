import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import "dotenv/config";

const hasStaticCredentials =
  !!process.env.AWS_ACCESS_KEY_ID && !!process.env.AWS_SECRET_ACCESS_KEY;

if (!hasStaticCredentials) {
  console.warn(
    "[config/aws] AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY are not set. " +
      "Falling back to the AWS SDK default credential provider chain. " +
      "Cognito admin calls will fail at request time if that chain has nothing to resolve.",
  );
}

const clientConfig = {
  region: process.env.COGNITO_REGION,
  ...(hasStaticCredentials
    ? {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      }
    : {}),
};

export const cognitoClient = new CognitoIdentityProviderClient(clientConfig);
