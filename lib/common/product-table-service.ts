import {DynamoDBDocumentClient, GetCommand, ScanCommand} from '@aws-sdk/lib-dynamodb';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}

export class ProductTableService {
  private readonly tableName: string;
  private readonly docClient: DynamoDBDocumentClient;

  constructor(tableName: string, docClient: DynamoDBDocumentClient) {
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

  async getProductBatch(from: number, to: number): Promise<Product[]> {
    const allProducts = await this.getProducts();
    return allProducts.slice(from, to);
  }
}