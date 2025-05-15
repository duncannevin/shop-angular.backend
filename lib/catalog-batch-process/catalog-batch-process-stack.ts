import * as cdk from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {Construct} from 'constructs';
import {StackProps} from 'aws-cdk-lib';
import {SqsEventSource} from 'aws-cdk-lib/aws-lambda-event-sources';

export class CatalogBatchProcessStack extends cdk.Stack {
  private readonly catalogItemsQueue: sqs.Queue;
  private readonly catalogBatchProcessLambda: lambda.Function;
  private readonly createProductTopic: any;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.catalogItemsQueue = new sqs.Queue(
      this,
      'CatalogItemsQueue',
    );

    this.createProductTopic = new sns.Topic(this, 'CreateProductTopic');

    this.createProductTopic.addSubscription(
      new subscriptions.EmailSubscription(process.env.MY_EMAIL!),
    );

    this.catalogBatchProcessLambda = new lambda.Function(
      this,
      'CatalogBatchProcessLambda',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset(
          'dist/catalog-batch-process',
        ),
        handler: 'catalog-batch-process-handler.main',
        environment: {
          PRODUCT_TABLE_NAME: 'ProductsTable',
          STOCK_TABLE_NAME: 'StockTable',
          CREATE_PRODUCT_TOPIC_ARN: this.createProductTopic.topicArn,
        },
      },
    );

    this.catalogBatchProcessLambda.addEventSource(new SqsEventSource(this.catalogItemsQueue, {
      batchSize: 5,
    }));

    this.createProductTopic.grantPublish(this.catalogBatchProcessLambda);
  }

  /**
   * Grant permissions to the lambda function to access the SQS queue.
   */
  grantSendSQSMessages(lambdaFunction: lambda.Function) {
    this.catalogItemsQueue.grantSendMessages(lambdaFunction);
  }

  get catalogItemsQueueUrl(): string {
    return this.catalogItemsQueue.queueUrl;
  }
}