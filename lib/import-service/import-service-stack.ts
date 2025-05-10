import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import {ApiGatewayStack} from '../api-gateway/api-gateway-stack';
import {HttpMethod} from 'aws-cdk-lib/aws-events';

export class ImportServiceStack extends cdk.Stack {
  private readonly bucket: s3.Bucket;
  private readonly importProductsFileLambda: lambda.Function;

  constructor(
    scope: Construct,
    id: string,
    apiGateway: ApiGatewayStack,
  ) {
    super(scope, id, {});

    this.bucket = new s3.Bucket(
      this,
      'ImportServiceBucket',
      {
        bucketName: 'import-service-bucket',
        removalPolicy: process.env.NODE_ENV !== 'development' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
        versioned: true,
        cors: [
          {
            allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
            allowedOrigins: ['*'],
            allowedHeaders: ['*'],
            maxAge: 3000,
          },
        ],
      }
    );

    this.importProductsFileLambda = new lambda.Function(
      this,
      'ImportProductsFileFunction',
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        code: lambda.Code.fromAsset(
          'dist/import-service',
        ),
        handler: 'import-products-file-handler.main',
        environment: {
          BUCKET_NAME: this.bucket.bucketName,
        },
      },
    );

    this.bucket.grantPut(this.importProductsFileLambda);

    apiGateway.addLambda(this.importProductsFileLambda, ['import'], HttpMethod.GET, ['fileName'], []);
  }
}