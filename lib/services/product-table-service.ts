import {DynamoDBDocumentClient, GetCommand, ScanCommand} from '@aws-sdk/lib-dynamodb';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}

export interface PaginatedResult<T> {
  products: T[];
  lastEvaluatedKey?: Record<string, any>; // you can serialize this if needed
}

export class ProductTableService {
  private readonly tableName: string;
  private readonly docClient: DynamoDBDocumentClient;

  constructor(tableName: string) {
    this.tableName = tableName;
    const client = new DynamoDBClient();
    this.docClient = DynamoDBDocumentClient.from(client);
  }

  async getProducts(): Promise<Product[]> {
    const command = new ScanCommand({
      TableName: this.tableName,
    });

    const result = await this.docClient.send(command);
    return (result.Items ?? []) as Product[];
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { id },
    });

    const result = await this.docClient.send(command);

    return result.Item as Product || undefined;
  }

  async getProductsPaginated(limit: number, exclusiveStartKey?: Record<string, any>): Promise<PaginatedResult<Product>> {
    const command = new ScanCommand({
      TableName: this.tableName,
      Limit: limit,
      ExclusiveStartKey: exclusiveStartKey,
    });

    const result = await this.docClient.send(command);
    return {
      products: (result.Items || []) as Product[],
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  }
}