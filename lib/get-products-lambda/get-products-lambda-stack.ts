import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import {Construct} from 'constructs';
import {ApiGatewayStack} from '../api-gateway/api-gateway-stack';
import {HttpMethod} from 'aws-cdk-lib/aws-events';

export class GetProductsLambdaStack extends cdk.Stack {
  private readonly lambda: lambda.Function;

  constructor(
    scope: Construct,
    id: string,
    apiGateway: ApiGatewayStack,
  ) {
    super(scope, id);

    this.lambda = new lambda.Function(
      this,
      'get-products-lambda-function',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        handler: 'handler.main',
        code: lambda.Code.fromAsset(
          'dist/get-products-lambda',
        ),
      },
    );

    apiGateway.addLambda(this.lambda, [], HttpMethod.GET);
  }
}
