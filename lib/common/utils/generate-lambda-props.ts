import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';

export function generateLambdaProps(path: string, handler: string, environment: Record<string, string>):  lambda.FunctionProps {
  return {
    runtime: lambda.Runtime.NODEJS_20_X,
    memorySize: 1024,
    timeout: cdk.Duration.seconds(5),
    code: lambda.Code.fromAsset(
      path,
    ),
    environment,
    handler,
  }
}