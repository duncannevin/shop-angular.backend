import * as cdk from 'aws-cdk-lib';

import {ProductGatewayStack} from './product-gateway-stack';
import {GatewayStack} from '../common/gateway-stack';

jest.mock('../common/gateway-stack', () => ({
  GatewayStack: jest.fn().mockImplementation(() => ({
    addLambda: () => {},
  })),
}));

const mockScope = {ima: 'little mock scope'} as unknown as cdk.App;

describe('ProductGatewayStack', () => {
  it('should create a product API Gateway stack', () => {
    new ProductGatewayStack(mockScope);
    expect(GatewayStack).toHaveBeenCalledWith(
      mockScope,
      'ProductsApiGateway',
      'products',
      'Products API Gateway',
      'This API manages products',
    );
  });

  it('should expose the addLambda method', () => {
    const stack = new ProductGatewayStack(mockScope);
    expect(stack.addLambda).toBeDefined();
  });
});
