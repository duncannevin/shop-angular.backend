import { ProductTableService } from 'services/product-table-service';

export interface GetProductsEvent {
}

const tableName = process.env.TABLE_NAME!;
const productTableService = new ProductTableService(tableName);

export async function main(event: GetProductsEvent) {
  console.log('GetProductsLambda', 'Received event:', JSON.stringify(event));
  // TODO: Actually implement pagination, just doing this to limit db reads for now.
  const products = await productTableService.getProductsPaginated(5);

  const result = {
    result: 'ok',
    data: products.products,
  }

  console.log('GetProductsLambda', 'Result:', result);

  return result;
}