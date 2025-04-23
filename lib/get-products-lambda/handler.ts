// import { ProductService } from 'services/product-service';

export interface GetProductsEvent {
}

// const tableName = process.env.TABLE_NAME!;
// const productTableService = new ProductService();

export async function main(event: GetProductsEvent) {
  const result = {
    result: 'ok',
    data: [],
  }

  console.log('GetProductsLambda', 'Result:', result);

  return result;
}