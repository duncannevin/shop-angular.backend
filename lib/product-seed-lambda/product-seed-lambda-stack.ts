import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import {Construct} from 'constructs';
import * as path from 'node:path';

export class ProductSeedLambdaStack extends cdk.Stack {
  private readonly lambda: lambda.Function;

  constructor(
    scope: Construct,
    id: string,
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
          path.join(__dirname, '..', '..', 'dist', 'lib', 'product-seed-lambda'),
        ),
      },
    );
  }
}
