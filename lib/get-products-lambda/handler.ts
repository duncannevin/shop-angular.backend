import {ProductService, PublicProduct} from 'services/product-service';
import {StockService} from 'services/stock-service';

export interface GetProductsEvent {
}

export interface GetProductsResponse {
  result: string;
  data: PublicProduct[];
}

const productTableService = new ProductService();
const stockTableService = new StockService();

export async function main(event: GetProductsEvent) {
  console.log('GetProductsLambda', 'Event:', event);
  try {
    const products = await productTableService.list();
    const productsWithStock: PublicProduct[] = [];

    for (const product of products) {
      const stock = await stockTableService.get(product.id);

      productsWithStock.push({
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        count: stock ? stock.count : 0,
      });
    }

    const result = {
      result: 'ok',
      data: productsWithStock,
    }

    console.log('GetProductsLambda', 'Result:', result);

    return result;
  } catch (error) {
    console.error('GetProductsLambda', 'Error:', error);
    throw new Error('Error getting products');
  }
}