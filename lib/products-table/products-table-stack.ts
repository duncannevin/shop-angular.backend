import * as cdk from 'aws-cdk-lib';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class ProductsTableStack extends cdk.Stack {
  private readonly table: ddb.Table;

  constructor(scope: Construct, id: string) {
    super(scope, id, {});

    this.table = new ddb.Table(this, 'ProductsTable', {
      partitionKey: { name: 'id', type: ddb.AttributeType.STRING },
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // for dev/testing
      tableName: 'MockProducts',
    });
  }

  grantWriteData(lambda: lambda.IFunction): void {
    this.table.grantWriteData(lambda);
  }

  grantReadData(lambda: lambda.IFunction): void {
    this.table.grantReadData(lambda);
  }
}
