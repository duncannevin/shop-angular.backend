import {SQSEvent} from 'aws-lambda';
import {ProductService} from 'services/product-service';
import {StockService} from 'services/stock-service';

const productService = new ProductService();
const stockService = new StockService();

export interface ImportedProduct {
  title: string;
  description: string;
  price: number;
  count: number;
  action: string;
}

function isImportedProduct(obj: any): obj is ImportedProduct {
  return (
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.price === 'number' &&
    typeof obj.count === 'number' &&
    typeof obj.action === 'string'
  );
}

export async function main(event: SQSEvent) {
  console.log('Received event:', JSON.stringify(event.Records, null, 2));
  for (const record of event.Records) {
    try {
      const parsedBody = JSON.parse(record.body);

      if (!isImportedProduct(parsedBody)) {
        console.error('Invalid product format:', parsedBody);
        continue;
      }

      const {title, description, price, count, action} = parsedBody;

      console.log('Processing record:', record);

      const newProduct = await productService.create({title, description, price});
      console.log('Product created:', {title, description, price});
      await stockService.create({product_id: newProduct.id, count});
      console.log('Stock created:', {productId: newProduct.id, title: newProduct.title, count});

    } catch (error) {
      console.error('Error processing record:', record, error);
    }
  }
  console.log('All records processed successfully.');
}