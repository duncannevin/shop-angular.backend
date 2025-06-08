import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {config} from 'dotenv';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {parseUsersFromEnv} from '../common/utils/parse-users-from-env';
import {generateLambdaProps} from '../common/utils/generate-lambda-props';

config();

export class AuthorizationServiceStack extends cdk.Stack {
  private readonly basicAuthorizerLambda: lambda.Function;

  constructor(scope: Construct, id: string) {
    super(scope, id, {});

    const users = parseUsersFromEnv(process.env.USERS!);

    this.basicAuthorizerLambda = new lambda.Function(
      this,
      'BasicAuthorizerLambda',
      generateLambdaProps('dist/authorization-service', 'basic-authorizer-handler.main', {
        ...users,
      }),
    );
  }

  get basicAuthorizerArn(): string {
    return this.basicAuthorizerLambda.functionArn;
  }
}
