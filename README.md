# Welcome to your CDK TypeScript project

This project is a CDK (Cloud Development Kit) application written in TypeScript. It sets up an API Gateway integrated
with AWS Lambda functions to manage and retrieve product data.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Project Structure

- **`lib/api-gateway/api-gateway-stack.ts`**: Defines the API Gateway stack, including resources, Lambda integrations,
  and request/response mappings.
- **`lib/common/utils-stack.ts`**: Contains utility functions for mapping API Gateway parameters, resource paths, and
  query parameters.
- **`api-spec.yaml`**: OpenAPI specification for the API, defining endpoints, request/response structures, and error
  handling.

## API Overview

The API provides the following endpoints:

- **`GET /products`**: Retrieve all products.
- **`POST /products`**: Add a new product.
- **`GET /products/{id}`**: Retrieve a product by its ID.

Refer to the `api-spec.yaml` file for detailed API specifications.

## Prerequisites

- Node.js (>= 14.x)
- AWS CDK Toolkit (>= 2.x)
- AWS CLI configured with appropriate credentials

## Useful Commands

* `npm run build`   \- Webpack bundle the app into `dist/`
* `npm run test`    \- Perform the Jest unit tests
* `npm run cdk:deploy -- --all`  \- Deploy this stack to your default AWS account/region
* `npm run cdk:diff`    \- Compare deployed stack with current state
* `npm run cdk:synth`   \- Emit the synthesized CloudFormation template

## Deployment

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
    npm run build
    ```

3. Deploy the stack:
    ```bash
   npm run cdk:deploy -- --all
    ```
   
## Testing

1. Run unit tests:
   ```bash
   npm run test
   ```
## API Testing

You can test the API using tools like Postman or curl. Here are some example requests:

### Get All Products
```bash
curl -X GET https://your-api-id.execute-api.your-region.amazonaws.com/prod/products
```

### Add a single Product
```bash
curl -X GET https://your-api-id.execute-api.your-region.amazonaws.com/prod/products/prod-id
```
