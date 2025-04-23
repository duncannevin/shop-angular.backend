#!/usr/bin/env node
import {ProductService} from '../lib/services/product-service';
import {StockService} from '../lib/services/stock-service';

process.env.AWS_REGION = 'us-west-2';
process.env.PRODUCT_TABLE_NAME = 'ProductsTable';
process.env.STOCK_TABLE_NAME = 'StockTable';

const productService = new ProductService();
const stockService = new StockService();

seedProducts(25)
  .catch(err => console.error(err))
  .finally(() => console.log('DONE!'));

async function seedProducts(amt: number){
  for (let i = 1; i <= amt; i++) {
    console.log(`Creating product ${i}...`);
    const product = await productService.create({
      title: `Product Title ${i}`,
      description: `Description for Product ${i}`,
      price: Math.floor(Math.random() * 100) + 1,
    });

    console.log(`Creating stock for: ${product.title}`);
    const stock = await stockService.create({
      product_id: product.id,
      count: Math.floor(Math.random() * 100) + 1,
    });

    console.log(`Created product: ${product.title} with stock count: ${stock.count}`);
  }
}
