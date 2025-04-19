#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';

import { ProductGatewayStack } from '../lib/product-gateway/product-gateway-stack';

const app = new cdk.App();

const productGateway = new ProductGatewayStack(app);
