// lib/products-table-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { join } from 'path';

export class ProductsTableStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table
    const table = new ddb.Table(this, 'ProductsTable', {
      partitionKey: { name: 'id', type: ddb.AttributeType.STRING },
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // for dev/testing
      tableName: 'MockProducts',
    });

    // Lambda for seeding the data
    const seedLambda = new lambdaNode.NodejsFunction(this, 'SeedProductsLambda', {
      entry: join(__dirname, '../lambda/seed-products.ts'),
      handler: 'handler',
      environment: {
        TABLE_NAME: table.tableName,
      },
      timeout: cdk.Duration.minutes(1),
      logRetention: logs.RetentionDays.ONE_DAY,
    });

    table.grantWriteData(seedLambda);

    // Run once on deploy
    new cdk.CustomResource(this, 'SeedProductsResource', {
      serviceToken: seedLambda.functionArn,
    });
  }
}
