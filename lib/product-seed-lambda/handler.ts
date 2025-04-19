import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { BatchWriteCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient();
const ddb = DynamoDBDocumentClient.from(client);
const tableName = process.env.TABLE_NAME!;

function generateMockProduct(id: number) {
  return {
    id: `prod-${id}`,
    name: `Product ${id}`,
    price: Math.floor(Math.random() * 100) + 1,
    category: ['Electronics', 'Books', 'Toys'][id % 3],
    inStock: id % 2 === 0,
  };
}

export async function main() {
  const items = Array.from({ length: 100 }, (_, i) => generateMockProduct(i + 1));

  // Batch 25 items at a time
  const batches: typeof items[] = [];
  for (let i = 0; i < items.length; i += 25) {
    batches.push(items.slice(i, i + 25));
  }

  for (const batch of batches) {
    const requestItems = batch.map((item) => ({
      PutRequest: { Item: item },
    }));

    const command = new BatchWriteCommand({
      RequestItems: {
        [tableName]: requestItems,
      },
    });

    await ddb.send(command);
  }

  return { status: 'seeded' };
}
