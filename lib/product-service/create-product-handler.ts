import {ProductService, PublicProduct} from 'services/product-service';

export interface CreateProductEvent {
  title: string;
  description: string;
  price: number;
}

export interface CreateProductResponse {
  result: string;
  data: PublicProduct;
}

const productService = new ProductService();

export async function main(event: CreateProductEvent, context?: {}) {
  console.log('Create product event:', event);
  const product = await productService.create(event);
  console.log('Product created:', product);
  const response: CreateProductResponse = {
    result: 'ok',
    data: {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      count: 0,
    },
  };
  console.log('New product created:', response);

  return response;
}