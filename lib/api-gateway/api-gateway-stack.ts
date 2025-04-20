/**
 * This file defines the `ApiGatewayStack` class, which sets up an API Gateway
 * to serve product data. It includes methods to configure resources, integrate
 * with Lambda functions, and handle request/response mappings.
 */

import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import {HttpMethod} from 'aws-cdk-lib/aws-events';
import {mapParams, mapRequestQueryParams, mapResourcePath} from '../common/utils-stack';

/**
 * `ApiGatewayStack` is a CDK stack that creates an API Gateway for managing
 * product-related endpoints. It supports integration with Lambda functions
 * and provides CORS support.
 */
export class ApiGatewayStack extends cdk.Stack {
  private api: apiGateway.RestApi;
  private readonly root: apiGateway.IResource;

  /**
   * Constructor for the `ApiGatewayStack` class.
   * @param scope - The parent construct.
   * @param id - The unique identifier for the stack.
   */
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

  /**
   * Adds a Lambda function as an integration to the API Gateway.
   * @param lambda - The Lambda function to integrate.
   * @param path - The resource path for the API endpoint.
   * @param method - The HTTP method for the endpoint.
   * @param queryParams - Optional query parameters for the request.
   */
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