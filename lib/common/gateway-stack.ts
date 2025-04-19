import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import {HttpMethod} from 'aws-cdk-lib/aws-events';
import {mapParams, mapResourcePath} from './utils';

export class GatewayStack {
  private readonly stack: cdk.Stack;
  private api: apiGateway.RestApi;
  private readonly root: apiGateway.IResource;

  constructor(
    scope: cdk.App,
    id: string,
    rootPath: string,
    apiName: string,
    description: string,
  ) {
    this.stack = new cdk.Stack(scope, id, {});
    this.api = new apiGateway.RestApi(
      this.stack,
      apiName,
      {
        restApiName: apiName,
        description: description,
      },
    );

    this.root = this.api.root.addResource(rootPath);
  }

  addLambda(
    lambda: lambda.Function,
    path: string[],
    method: HttpMethod,
    statusCode: number,
  ): void {
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