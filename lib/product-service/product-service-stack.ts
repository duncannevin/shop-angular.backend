import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import {Construct} from 'constructs';
import {config} from 'dotenv';
import {generateLambdaProps} from '../common/utils/generate-lambda-props';

config();

export class ProductServiceStack extends cdk.Stack {
  private readonly productTable: ddb.ITable
  private readonly stockTable: ddb.ITable;
  readonly getProductLambda: lambda.Function;
  readonly getProductsLambda: lambda.Function;
  readonly createProductLambda: lambda.Function;

  constructor(
    scope: Construct,
    id: string,
  ) {
    super(scope, id);

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
      generateLambdaProps('dist/product-service', 'get-product-handler.main', {
        PRODUCT_TABLE_NAME: process.env.PRODUCT_TABLE_NAME!,
        STOCK_TABLE_NAME: process.env.STOCK_TABLE_NAME!,
      }),
    );

    this.getProductsLambda = new lambda.Function(
      this,
      'get-products-lambda-function',
      generateLambdaProps('dist/product-service', 'get-products-handler.main', {
        PRODUCT_TABLE_NAME: process.env.PRODUCT_TABLE_NAME!,
        STOCK_TABLE_NAME: process.env.STOCK_TABLE_NAME!,
      }),
    );

    this.createProductLambda = new lambda.Function(
      this,
      'create-product-lambda-function',
      generateLambdaProps('dist/product-service', 'create-product-handler.main', {
        PRODUCT_TABLE_NAME: process.env.PRODUCT_TABLE_NAME!,
        STOCK_TABLE_NAME: process.env.STOCK_TABLE_NAME!,
      }),
    );

    this.productTable.grantReadData(this.getProductsLambda);
    this.productTable.grantReadData(this.getProductLambda);
    this.productTable.grantWriteData(this.createProductLambda);
    this.stockTable.grantReadData(this.getProductLambda);
    this.stockTable.grantReadData(this.getProductsLambda);
    this.stockTable.grantWriteData(this.createProductLambda);
  }
}
