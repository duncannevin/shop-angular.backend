#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';

import {ApiGatewayStack} from '../lib/api-gateway/api-gateway-stack';
import {ImportServiceStack} from '../lib/import-service/import-service-stack';
import {ProductServiceStack} from '../lib/product-service/product-service-stack';

const app = new cdk.App();

// Gateway stack
const apiGateway = new ApiGatewayStack(app, 'ProductApiGateway');

// Gateway Lambda stacks
new ProductServiceStack(app, 'ProductServiceStack', apiGateway);
new ImportServiceStack(app, 'ImportServiceStack', apiGateway);
