import {ProductTableService} from 'services/product-table-service';

export interface GetProductEvent {
  productId: string;
}

const tableName = process.env.TABLE_NAME!;
const productTableService = new ProductTableService(tableName);

export async function main(event: GetProductEvent) {
  console.log('GetProductLambda', 'Received event:', JSON.stringify(event));
  const productId = event.productId;
  const product = await productTableService.getProduct(productId);

  if (!product) {
    throw new Error('not found');
  }

  const result = {
    result: 'ok',
    data: product,
  }

  console.log('GetProductLambda', 'Result:', result);
  return result;
}
