import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import {Construct} from 'constructs';
import {HttpMethod} from 'aws-cdk-lib/aws-events';
import {config} from 'dotenv';

import {ApiGatewayStack} from '../api-gateway/api-gateway-stack';

config();

export class ProductServiceStack extends cdk.Stack {
  private readonly productTable: ddb.ITable
  private readonly stockTable: ddb.ITable;
  private readonly getProductLambda: lambda.Function;
  private readonly getProductsLambda: lambda.Function;
  private readonly createProductLambda: lambda.Function;

  constructor(
    scope: Construct,
    id: string,
    apiGateway: ApiGatewayStack,
  ) {
    super(scope, id);

    const baseLambdaProps = {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      code: lambda.Code.fromAsset(
        'dist/product-service',
      ),
      environment: {
        PRODUCT_TABLE_NAME: process.env.PRODUCT_TABLE_NAME!,
        STOCK_TABLE_NAME: process.env.STOCK_TABLE_NAME!,
      },
    }

    this.productTable = ddb.Table.fromTableName(
      this,
      process.env.PRODUCT_TABLE_NAME!,
      process.env.PRODUCT_TABLE_NAME!,
    );

    this.stockTable = ddb.Table.fromTableName(
      this,
      process.env.STOCK_TABLE_NAME!,
      process.env.STOCK_TABLE_NAME!,
    );

    this.getProductLambda = new lambda.Function(
      this,
      'get-product-lambda-function',
      {
        ...baseLambdaProps,
        handler: 'get-product-handler.main',
      },
    );

    this.getProductsLambda = new lambda.Function(
      this,
      'get-products-lambda-function',
      {
        ...baseLambdaProps,
        handler: 'get-products-handler.main',
      },
    );

    this.createProductLambda = new lambda.Function(
      this,
      'create-product-lambda-function',
      {
        ...baseLambdaProps,
        handler: 'create-product-handler.main',
      },
    );

    this.productTable.grantReadData(this.getProductsLambda);
    this.productTable.grantReadData(this.getProductLambda);
    this.productTable.grantWriteData(this.createProductLambda);
    this.stockTable.grantReadData(this.getProductLambda);
    this.stockTable.grantReadData(this.getProductsLambda);
    this.stockTable.grantWriteData(this.createProductLambda);

    apiGateway.addLambda(this.getProductLambda, ['{productId}'], HttpMethod.GET, [], []);
    apiGateway.addLambda(this.getProductsLambda, [], HttpMethod.GET, [], []);
    apiGateway.addLambda(this.createProductLambda, [], HttpMethod.POST, [], ['title', 'description', 'price']);
  }
}
