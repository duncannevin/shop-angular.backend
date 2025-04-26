import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import {Construct} from 'constructs';
import {ApiGatewayStack} from '../api-gateway/api-gateway-stack';
import {HttpMethod} from 'aws-cdk-lib/aws-events';
import {ProductsTableStack} from '../products-table/products-table-stack';

export class GetProductLambdaStack extends cdk.Stack {
  private readonly lambda: lambda.Function;

  constructor(
    scope: Construct,
    id: string,
    apiGateway: ApiGatewayStack,
    productsTable: ProductsTableStack,
  ) {
    super(scope, id);

    this.lambda = new lambda.Function(
      this,
      'get-product-lambda-function',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        handler: 'handler.main',
        code: lambda.Code.fromAsset(
          'dist/get-product-lambda',
        ),
      },
    );

    apiGateway.addLambda(this.lambda, ['{productId}'], HttpMethod.GET);
    productsTable.grantReadData(this.lambda);
  }
}
