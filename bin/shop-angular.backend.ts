#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';

import {ApiGatewayStack} from '../lib/api-gateway/api-gateway-stack';
import {ImportServiceStack} from '../lib/import-service/import-service-stack';
import {ProductServiceStack} from '../lib/product-service/product-service-stack';
import {AuthorizationServiceStack} from '../lib/authorization-service/authorization-service-stack';
import {HttpMethod} from 'aws-cdk-lib/aws-events';

const app = new cdk.App();

// Authorization service stack
const authorizationService = new AuthorizationServiceStack(app, 'ProductsAuthorizationServiceStack');

// Gateway stack
const apiGateway = new ApiGatewayStack(app, 'ProductApiGateway', authorizationService.basicAuthorizerArn);

// Gateway Lambda stacks
const productService = new ProductServiceStack(app, 'ProductServiceStack');
apiGateway.addLambda(productService.getProductLambda, ['{productId}'], HttpMethod.GET, [], []);
apiGateway.addLambda(productService.getProductsLambda, [], HttpMethod.GET, [], []);
apiGateway.addLambda(productService.createProductLambda, [], HttpMethod.POST, [], ['title', 'description', 'price']);

const importService = new ImportServiceStack(app, 'ImportServiceStack');
apiGateway.addLambda(importService.importProductsFileLambda, ['import'], HttpMethod.GET, ['fileName'], [], true);
