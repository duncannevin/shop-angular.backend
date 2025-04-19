export interface GetProductEvent {
  productId: string;
}

export async function main(event: GetProductEvent) {
  return {
    products: JSON.stringify({productId: event.productId}),
  }
}