/**
 * This file defines the `ApiGatewayStack` class, which sets up an API Gateway
 * to serve product data. It includes methods to configure resources, integrate
 * with Lambda functions, and handle request/response mappings.
 */

import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import {HttpMethod} from 'aws-cdk-lib/aws-events';
import {
  mapBody,
  mapParams, mapQueryStringParams,
  mapResourcePath
} from '../common/utils/utils-stack';

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
    this.root.addCorsPreflight({
      allowOrigins: apiGateway.Cors.ALL_ORIGINS,
      allowMethods: apiGateway.Cors.ALL_METHODS,
    });
  }

  /**
   * Adds a Lambda function as an integration to the API Gateway.
   * @param lambda - The Lambda function to integrate.
   * @param path - The resource path for the API endpoint.
   * @param method - The HTTP method for the endpoint.
   * @param queryParams - Optional query parameters for the request.
   * @param bodyParams
   */
  addLambda(
    lambda: lambda.Function,
    path: string[],
    method: HttpMethod,
    queryParams: string[],
    bodyParams: string[],
  ) {
    const queryTemplate = mapParams(path);
    const bodyTemplate = mapBody(bodyParams);
    const queryStringTemplate = mapQueryStringParams(queryParams);
    const template = {
      ...queryTemplate,
      ...bodyTemplate,
      ...queryStringTemplate,
    };
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
            responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': '\'*\'',
              'method.response.header.Access-Control-Allow-Methods': '\'GET,POST,OPTIONS\'',
              'method.response.header.Access-Control-Allow-Headers': '\'*\'',
            },
          },
          {
            statusCode: '404',
            selectionPattern: '.*not found.*',
            responseTemplates: {
              'application/json': JSON.stringify({error: 'Not Found'})
            },
            responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': '\'*\'',
              'method.response.header.Access-Control-Allow-Methods': '\'GET,POST,OPTIONS\'',
              'method.response.header.Access-Control-Allow-Headers': '\'*\'',
            },
          },
          {
            statusCode: '500',
            selectionPattern: '.*server error.*',
            responseTemplates: {
              'application/json': JSON.stringify({error: 'Internal Server Error'})
            },
            responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': '\'*\'',
              'method.response.header.Access-Control-Allow-Methods': '\'GET,POST,OPTIONS\'',
              'method.response.header.Access-Control-Allow-Headers': '\'*\'',
            },
          }
        ],
      },
    );

    resource.addMethod(
      method,
      integration,
      {
        methodResponses: [
          {
            statusCode: '200', responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': true,
              'method.response.header.Access-Control-Allow-Methods': true,
              'method.response.header.Access-Control-Allow-Headers': true,
            }
          },
          {
            statusCode: '404', responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': true,
              'method.response.header.Access-Control-Allow-Methods': true,
              'method.response.header.Access-Control-Allow-Headers': true,
            }
          },
          {
            statusCode: '500', responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': true,
              'method.response.header.Access-Control-Allow-Methods': true,
              'method.response.header.Access-Control-Allow-Headers': true,
            }
          },
        ]
      },
    );
  }
}