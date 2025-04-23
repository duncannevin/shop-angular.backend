// import {ProductService} from 'services/product-service';

export interface GetProductEvent {
  productId: string;
}

// const tableName = process.env.TABLE_NAME!;
// const productTableService = new ProductService();

export async function main(event: GetProductEvent) {
  console.log('GetProductLambda', 'Received event:', JSON.stringify(event));

  const result = {
    result: 'ok',
    data: {},
  }

  console.log('GetProductLambda', 'Result:', result);
  return result;
}
