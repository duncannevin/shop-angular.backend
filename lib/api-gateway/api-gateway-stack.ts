import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import {HttpMethod} from 'aws-cdk-lib/aws-events';
import {mapParams, mapRequestQueryParams, mapResourcePath} from '../common/utils-stack';

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

  addLambda(
    lambda: lambda.Function,
    path: string[],
    method: HttpMethod,
    queryParams: string[] = [],
  ) {
    const template = mapParams(path);
    const resource = mapResourcePath(this.root, path);

    const integration = new apiGateway.LambdaIntegration(
      lambda,
      {
        requestTemplates: {
          'application/json': JSON.stringify(template),
        },
        proxy: false,
        integrationResponses: [
          {
            statusCode: '200',
            selectionPattern: '',
            responseTemplates: {
              'application/json': '$input.json("$")',
            },
          },
          {
            statusCode: '404',
            selectionPattern: '.*not found.*',
            responseTemplates: {
              'application/json': JSON.stringify({ error: 'Not Found' })
            },
          },
          {
            statusCode: '500',
            selectionPattern: '.*server error.*',
            responseTemplates: {
              'application/json': JSON.stringify({ error: 'Internal Server Error' })
            },
          }
        ],
      },
    );

    resource.addMethod(
      method,
      integration,
      {
        requestParameters: mapRequestQueryParams(queryParams),
        methodResponses: [
          {statusCode: '200'},
          {statusCode: '404'},
          {statusCode: '500'},
        ]
      },
    );

    resource.addCorsPreflight({
      allowOrigins: apiGateway.Cors.ALL_ORIGINS,
      allowMethods: apiGateway.Cors.ALL_METHODS,
      allowHeaders: apiGateway.Cors.DEFAULT_HEADERS,
    });
  }
}