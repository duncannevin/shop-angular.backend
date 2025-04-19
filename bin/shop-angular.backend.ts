#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';

import {ApiGatewayStack} from '../lib/api-gateway/api-gateway-stack';
import {GetProductsLambdaStack} from '../lib/get-products-lambda/get-products-lambda-stack';
import {GetProductLambdaStack} from '../lib/get-product-lambda/get-product-lambda-stack';
import {ProductSeedLambdaStack} from '../lib/product-seed-lambda/product-seed-lambda-stack';

const app = new cdk.App();

// Gateway stack
const apiGateway = new ApiGatewayStack(app, 'ProductApiGateway');

// Gateway Lambda stacks
new GetProductsLambdaStack(app, 'GetProductsLambdaStack', apiGateway);
new GetProductLambdaStack(app, 'GetProductLambdaStack', apiGateway);

// Solo lambdas
new ProductSeedLambdaStack(app, 'ProductSeedLambdaStack');
