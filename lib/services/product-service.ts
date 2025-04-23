import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  createdAt: number;
}

export class ProductService {
  private readonly client: DynamoDBClient;
  private docClient: DynamoDBDocumentClient;

  constructor(
    private tableName: string = process.env.PRODUCT_TABLE_NAME!,
    private region: string = process.env.AWS_REGION!,
  ) {
    // @ts-ignore
    this.client = new DynamoDBClient({ region });
    this.docClient = DynamoDBDocumentClient.from(this.client);
  }

  async create(data: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const product: Product = {
      ...data,
      id: uuidv4(),
      createdAt: Date.now(),
    };

    const command = new PutCommand({
      TableName: this.tableName,
      Item: product,
    });

    await this.docClient.send(command);
    return product;
  }

  async get(id: string): Promise<Product | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { id },
    });

    const result = await this.docClient.send(command);
    return result.Item as Product || null;
  }

  async update(id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<Product> {
    const updateExpressions = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    for (const key of Object.keys(updates)) {
      const attrName = `#${key}`;
      const attrValue = `:${key}`;
      updateExpressions.push(`${attrName} = ${attrValue}`);
      expressionAttributeNames[attrName] = key;
      expressionAttributeValues[attrValue] = (updates as any)[key];
    }

    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const result = await this.docClient.send(command);
    return result.Attributes as Product;
  }

  async delete(id: string): Promise<void> {
    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: { id },
    });

    await this.docClient.send(command);
  }

  async list(): Promise<Product[]> {
    const command = new ScanCommand({
      TableName: this.tableName,
    });

    const result = await this.docClient.send(command);
    return (result.Items ?? []) as Product[];
  }
}
