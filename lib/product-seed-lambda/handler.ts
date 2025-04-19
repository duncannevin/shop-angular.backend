import { DynamoDB } from 'aws-sdk';

const ddb = new DynamoDB.DocumentClient();
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

export async function handler() {
  const putRequests = Array.from({ length: 100 }, (_, i) => ({
    PutRequest: {
      Item: generateMockProduct(i + 1),
    },
  }));

  // DynamoDB only allows 25 items per batchWrite
  const batches = [];
  for (let i = 0; i < putRequests.length; i += 25) {
    batches.push(putRequests.slice(i, i + 25));
  }

  for (const batch of batches) {
    await ddb
      .batchWrite({
        RequestItems: {
          [tableName]: batch,
        },
      })
      .promise();
  }

  return { status: 'seeded' };
}
