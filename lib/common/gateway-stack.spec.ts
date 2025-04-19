import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';
import {GatewayStack} from './gateway-stack';
import {HttpMethod} from 'aws-cdk-lib/aws-events';
import {mapResourcePath} from './utils';

const mockLambdaFunction = {ima: 'little lambda'} as unknown as lambda.Function;
const mockApp = {ima: 'little app'} as unknown as cdk.App;

const integrationResponse = {ima: 'integration response'} as unknown as apiGateway.IntegrationResponse;

jest.mock('aws-cdk-lib/aws-apigateway', () => ({
  LambdaIntegration: jest.fn().mockReturnValue(integrationResponse),
}));

jest.mock('aws-cdk-lib', () => ({
  Stack: jest.fn().mockImplementation(() => ({
    addDependency: jest.fn(),
    addOutputs: jest.fn(),
    addResource: jest.fn(),
    addMethod: jest.fn(),
  })),
  App: jest.fn().mockImplementation(() => ({
    synth: jest.fn(),
  })),
}));

jest.mock('aws-cdk-lib/aws-apigateway', () => ({
  ...jest.requireActual('aws-cdk-lib/aws-apigateway'),
  LambdaIntegration: jest.fn().mockImplementation(() => ({
    root: {
      addResource: jest.fn().mockReturnThis(),
      addMethod: jest.fn(),
    },
  })),
  RestApi: jest.fn().mockImplementation(() => ({
      root: {
        addResource: jest.fn().mockReturnThis(),
        addMethod: jest.fn(),
      },
    }
  )),
}));

const mapResourcePathMock = {
  addMethod: jest.fn(),
  addCorsPreflight: jest.fn(),
};

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  mapResourcePath: jest.fn(),
}));

(mapResourcePath as jest.Mock).mockImplementation(() => mapResourcePathMock);

describe('ProductApiGatewayStack', () => {
  let stack: GatewayStack;

  beforeEach(() => {
    stack = new GatewayStack(mockApp, 'TestStack', 'test-path', 'Test API', 'Test API Description');
  });

  it('should initialize', () => {
    expect(stack).toBeDefined();
  });

  describe('addLambda', () => {
    it('should be defined', () => {
      expect(stack.addLambda).toBeDefined();
    });

    it('should add the new integration', () => {
      const path: string[] = ['p1', 'p2', '{p3}'];
      const method = HttpMethod.GET;
      const statusCode = 200;

      stack.addLambda(mockLambdaFunction, path, method, statusCode);

      expect(mapResourcePathMock.addMethod).toHaveBeenCalledWith(
        method,
        expect.any(Object),
        {
          methodResponses: [{statusCode: statusCode.toString()}],
        },
      );
    });

    it('should set cors preflight', () => {
      const path: string[] = ['p1', 'p2', '{p3}'];
      const method = HttpMethod.GET;
      const statusCode = 200;

      stack.addLambda(mockLambdaFunction, path, method, statusCode);

      expect(mapResourcePathMock.addCorsPreflight).toHaveBeenCalledWith({
        allowOrigins: apiGateway.Cors.ALL_ORIGINS,
        allowMethods: apiGateway.Cors.ALL_METHODS,
        allowHeaders: apiGateway.Cors.DEFAULT_HEADERS,
      });
    });
  });
});
