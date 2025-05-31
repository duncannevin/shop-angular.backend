import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerEvent } from 'aws-lambda';

/**
 * Generates an IAM policy.
 * @param effect - The policy effect ("Allow" or "Deny").
 * @param resource - The resource ARN.
 * @returns The IAM policy.
 */
function generatePolicy(effect: 'Allow' | 'Deny', resource: string): APIGatewayAuthorizerResult {
  return {
    principalId: 'user',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
}

/**
 * Main handler for the Basic Authorizer Lambda.
 * @param event - The API Gateway Token Authorizer event.
 * @returns The authorizer result.
 */
export async function main(event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> {
  try {
    const token = event.authorizationToken;

    if (!token || !token.startsWith('Basic ')) {
      throw new Error('Unauthorized');
    }

    // Decode the Basic Authorization token
    const base64Credentials = token.split(' ')[1];
    const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = decodedCredentials.split(':');

    if (!username || !password) {
      throw new Error('Unauthorized');
    }

    // Validate credentials against environment variables
    const expectedPassword = process.env[username];
    if (expectedPassword !== password) {
      throw new Error('Unauthorized');
    }

    // Return an IAM policy allowing access
    return generatePolicy('Allow', event.methodArn);
  } catch (error) {
    // Return an IAM policy denying access
    return generatePolicy('Deny', event.methodArn);
  }
}
