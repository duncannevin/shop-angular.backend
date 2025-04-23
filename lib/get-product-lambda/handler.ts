import {ProductService, PublicProduct} from 'services/product-service';
import {StockService} from 'services/stock-service';

export interface GetProductEvent {
  productId: string;
}

export interface GetProductResponse {
  result: string;
  data: PublicProduct;
}

const productTableService = new ProductService();
const stockTableService = new StockService();

export async function main(event: GetProductEvent): Promise<{result: string, data: PublicProduct}> {
  const product = await productTableService.get(event.productId);

  if (!product) {
    console.log('GetProductsLambda', 'Product not found:', event.productId);
    throw new Error('not found');
  }

  const stock = await stockTableService.get(event.productId);
  const productsWithStock: PublicProduct = {
    id: product.id,
    title: product.title,
    description: product.description,
    price: product.price,
    count: stock ? stock.count : 0,
  };

  const result = {
    result: 'ok',
    data: productsWithStock,
  }

  console.log('GetProductsLambda', 'Result:', result);

  return result;
}
