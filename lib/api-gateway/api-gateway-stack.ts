import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import {HttpMethod} from 'aws-cdk-lib/aws-events';
import {mapParams, mapResourcePath} from '../common/utils-stack';

export type AddLambdaFunction = (lambda: lambda.Function, path: string[], method: HttpMethod, statusCode: number) => void;

export class ApiGatewayStack extends cdk.Stack {
  private api: apiGateway.RestApi;
  private readonly root: apiGateway.IResource;

  constructor(
    scope: cdk.App,
    id: string,
  ) {
    super(scope, id);
    this.api = new apiGateway.RestApi(
      this,
      'product-api-gateway',
      {
        restApiName: 'Product API Gateway',
        description: 'This API serves product data',
      },
    );

    this.root = this.api.root.addResource('products');
  }

  addLambda: AddLambdaFunction = (
    lambda: lambda.Function,
    path: string[],
    method: HttpMethod,
    statusCode: number,
  ) => {
    const template = mapParams(path);
    const resource = mapResourcePath(this.root, path);

    const integration = new apiGateway.LambdaIntegration(
      lambda,
      {
        integrationResponses: [{statusCode: statusCode.toString()}],
        requestTemplates: {
          'application/json': JSON.stringify(template),
        },
        proxy: false,
      },
    );

    resource.addMethod(
      method,
      integration,
      {
        methodResponses: [{statusCode: statusCode.toString()}]
      },
    );

    resource.addCorsPreflight({
      allowOrigins: apiGateway.Cors.ALL_ORIGINS,
      allowMethods: apiGateway.Cors.ALL_METHODS,
      allowHeaders: apiGateway.Cors.DEFAULT_HEADERS,
    });
  }
}