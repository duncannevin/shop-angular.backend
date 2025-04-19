export interface GetProductsEvent {}

export async function main(event: GetProductsEvent) {
  return {
    products: JSON.stringify([]),
  }
}