import * as cdk from 'aws-cdk-lib';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import {ApiGatewayStack} from '../api-gateway/api-gateway-stack';
import {HttpMethod} from 'aws-cdk-lib/aws-events';

export class ImportServiceStack extends cdk.Stack {
  private readonly bucket: s3.Bucket;
  private readonly importProductsFileLambda: lambda.Function;
  private readonly importProductsFileParserLambda: lambda.Function;

  constructor(
    scope: Construct,
    id: string,
    apiGateway: ApiGatewayStack,
  ) {
    super(scope, id, {});

    /**
     * The S3 bucket is used to store the imported files.
     * It is configured with versioning and CORS settings.
     */
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

    /**
     * The import products file lambda function is responsible for handling the import of products from a file.
     * It is triggered by an API Gateway event.
     */
    this.importProductsFileLambda = new lambda.Function(
      this,
      'ImportProductsFileFunction',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
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

    /**
     * The import file parser lambda function is responsible for parsing the imported file and processing its contents.
     * It is triggered by the S3 bucket event when a new file is uploaded.
     */
    this.importProductsFileParserLambda = new lambda.Function(
      this,
      'ImportProductsFileParserFunction',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset(
          'dist/import-service',
        ),
        handler: 'import-file-parser-handler.main',
        environment: {
          BUCKET_NAME: this.bucket.bucketName,
        },
      },
    );

    this.bucket.grantRead(this.importProductsFileParserLambda);
    this.bucket.grantPut(this.importProductsFileParserLambda);
    this.bucket.grantDelete(this.importProductsFileParserLambda);
    this.bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(this.importProductsFileParserLambda),
      {
        prefix: 'uploaded/',
      },
    );
  }
}