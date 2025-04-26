import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import {Construct} from 'constructs';
import {ProductsTableStack} from '../products-table/products-table-stack';

export class ProductSeedLambdaStack extends cdk.Stack {
  readonly lambda: lambda.Function;

  constructor(
    scope: Construct,
    id: string,
    productTable: ProductsTableStack,
  ) {
    super(scope, id);

    this.lambda = new lambda.Function(
      this,
      'product-seed-lambda-function',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        handler: 'handler.main',
        code: lambda.Code.fromAsset(
          'dist/product-seed-lambda',
        ),
      },
    );

    productTable.grantWriteData(this.lambda);
  }
}
