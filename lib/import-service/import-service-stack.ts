import * as cdk from 'aws-cdk-lib';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import {config} from 'dotenv';
import {generateLambdaProps} from '../common/utils/generate-lambda-props';

config();

export class ImportServiceStack extends cdk.Stack {
  private readonly bucket: s3.Bucket;
  readonly importProductsFileLambda: lambda.Function;
  readonly importProductsFileParserLambda: lambda.Function;

  constructor(
    scope: Construct,
    id: string,
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
        bucketName: process.env.IMPORT_SERVICE_BUCKET_NAME!,
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
      generateLambdaProps('dist/import-service', 'import-products-file-handler.main', {
        BUCKET_NAME: this.bucket.bucketName,
      }),
    );


    /**
     * The import file parser lambda function is responsible for parsing the imported file and processing its contents.
     * It is triggered by the S3 bucket event when a new file is uploaded.
     */
    this.importProductsFileParserLambda = new lambda.Function(
      this,
      'ImportProductsFileParserFunction',
      generateLambdaProps('dist/import-service', 'import-file-parser-handler.main', {
        BUCKET_NAME: this.bucket.bucketName,
      }),
    );

    this.bucket.grantPut(this.importProductsFileLambda);
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