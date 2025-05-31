#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';

import {ApiGatewayStack} from '../lib/api-gateway/api-gateway-stack';
import {GetProductsLambdaStack} from '../lib/get-products-lambda/get-products-lambda-stack';
import {GetProductLambdaStack} from '../lib/get-product-lambda/get-product-lambda-stack';
import {CreateProductLambdaStack} from '../lib/create-product-lambda/create-product-stack';
import {ImportServiceStack} from '../lib/import-service/import-service-stack';
import {CatalogBatchProcessStack} from '../lib/catalog-batch-process/catalog-batch-process-stack';

const app = new cdk.App();

// Gateway stack
const apiGateway = new ApiGatewayStack(app, 'ProductApiGateway');

// Catalog batch process stack
const catalogBatchProcessStack = new CatalogBatchProcessStack(app, 'CatalogBatchProcessStack');

// Gateway Lambda stacks
new GetProductsLambdaStack(app, 'GetProductsLambdaStack', apiGateway);
new GetProductLambdaStack(app, 'GetProductLambdaStack', apiGateway);
new CreateProductLambdaStack(app, 'CreateProductLambdaStack', apiGateway);
new ImportServiceStack(app, 'ImportServiceStack', apiGateway, catalogBatchProcessStack);
