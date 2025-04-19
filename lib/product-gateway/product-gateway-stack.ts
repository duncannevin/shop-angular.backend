import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import { GatewayStack } from '../common/gateway-stack';
import {HttpMethod} from 'aws-cdk-lib/aws-events';

export class ProductGatewayStack {
  private productApiGateway: GatewayStack;
  addLambda: (lambda: lambda.Function, path: string[], method: HttpMethod, statusCode: number) => void;

  constructor(
    scope: cdk.App,
  ) {
    this.productApiGateway = new GatewayStack(
      scope,
      'ProductsApiGateway',
      'products',
      'Products API Gateway',
      'This API manages products',
    );
    this.addLambda = this.productApiGateway.addLambda;
  }
}
