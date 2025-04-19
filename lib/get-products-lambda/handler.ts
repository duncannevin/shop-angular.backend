export interface GetProductsEvent {}

import { ProductTableService } from '../common/product-table-service';

export async function main(event: GetProductsEvent) {
  return {
    products: JSON.stringify([]),
  }
}