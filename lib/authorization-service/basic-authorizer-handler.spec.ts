import { main } from './basic-authorizer-handler';
import { APIGatewayTokenAuthorizerEvent } from 'aws-lambda';

describe('Basic Authorizer Handler', () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock environment variables
    process.env.username = 'PASSWORD';
    process.env.anotheruser = 'ANOTHER_PASSWORD';

    // @ts-ignore
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    // Clear environment variables
    delete process.env.username;
    delete process.env.anotheruser;

    // Restore console.log
    consoleLogSpy.mockRestore();
  });

  it('should allow access for valid credentials', async () => {
    const event: APIGatewayTokenAuthorizerEvent = {
      type: 'TOKEN',
      authorizationToken: 'Basic dXNlcm5hbWU6UEFTU1dPUkQ=', // Base64 for "username:PASSWORD"
      methodArn: 'arn:aws:execute-api:region:account-id:api-id/stage/GET/resource',
    };

    const result = await main(event);

    const statement = result.policyDocument.Statement[0] as { Resource: string };
    expect(result.policyDocument.Statement[0].Effect).toBe('Allow');
    expect(statement.Resource).toBe(event.methodArn);

    expect(consoleLogSpy).toHaveBeenCalledWith('Event:', JSON.stringify(event, null, 2));
    expect(consoleLogSpy).toHaveBeenCalledWith('Access Granted: Valid credentials provided');
  });

  it('should deny access for invalid credentials', async () => {
    const event: APIGatewayTokenAuthorizerEvent = {
      type: 'TOKEN',
      authorizationToken: 'Basic dXNlcm5hbWU6SU5WQUxJRF9QQVNTV09SRA==', // Base64 for "username:INVALID_PASSWORD"
      methodArn: 'arn:aws:execute-api:region:account-id:api-id/stage/GET/resource',
    };

    const result = await main(event);

    const statement = result.policyDocument.Statement[0] as { Resource: string };
    expect(result.policyDocument.Statement[0].Effect).toBe('Deny');
    expect(statement.Resource).toBe(event.methodArn);

    expect(consoleLogSpy).toHaveBeenCalledWith('Event:', JSON.stringify(event, null, 2));
    expect(consoleLogSpy).toHaveBeenCalledWith('Access Denied: Invalid credentials');
  });

  it('should deny access for missing token', async () => {
    const event: APIGatewayTokenAuthorizerEvent = {
      type: 'TOKEN',
      authorizationToken: '',
      methodArn: 'arn:aws:execute-api:region:account-id:api-id/stage/GET/resource',
    };

    const result = await main(event);

    const statement = result.policyDocument.Statement[0] as { Resource: string };
    expect(result.policyDocument.Statement[0].Effect).toBe('Deny');
    expect(statement.Resource).toBe(event.methodArn);

    expect(consoleLogSpy).toHaveBeenCalledWith('Event:', JSON.stringify(event, null, 2));
    expect(consoleLogSpy).toHaveBeenCalledWith('Unauthorized: No Basic Authorization token provided');
    expect(consoleLogSpy).toHaveBeenCalledWith('Access Denied:', 'Unauthorized');
  });

  it('should deny access for malformed token', async () => {
    const event: APIGatewayTokenAuthorizerEvent = {
      type: 'TOKEN',
      authorizationToken: 'Bearer some-invalid-token',
      methodArn: 'arn:aws:execute-api:region:account-id:api-id/stage/GET/resource',
    };

    const result = await main(event);

    const statement = result.policyDocument.Statement[0] as { Resource: string };
    expect(result.policyDocument.Statement[0].Effect).toBe('Deny');
    expect(statement.Resource).toBe(event.methodArn);

    expect(consoleLogSpy).toHaveBeenCalledWith('Event:', JSON.stringify(event, null, 2));
    expect(consoleLogSpy).toHaveBeenCalledWith('Unauthorized: No Basic Authorization token provided');
    expect(consoleLogSpy).toHaveBeenCalledWith('Access Denied:', 'Unauthorized');
  });
});