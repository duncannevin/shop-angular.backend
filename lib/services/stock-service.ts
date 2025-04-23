import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand
} from '@aws-sdk/lib-dynamodb';

export interface Stock {
  product_id: string;
  count: number;
}

export class StockService {
  private readonly client: DynamoDBClient;
  private docClient: DynamoDBDocumentClient;

  constructor(
    private tableName: string = process.env.STOCK_TABLE_NAME!,
    private region: string = process.env.AWS_REGION!,
  ) {
    // @ts-ignore
    this.client = new DynamoDBClient({ region });
    this.docClient = DynamoDBDocumentClient.from(this.client);
  }

  async create(data: Stock): Promise<Stock> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: data,
    });

    await this.docClient.send(command);
    return data;
  }

  async get(product_id: string): Promise<Stock | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { product_id },
    });

    const result = await this.docClient.send(command);
    return result.Item as Stock || null;
  }

  async updateCount(product_id: string, newCount: number): Promise<Stock> {
    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: { product_id },
      UpdateExpression: 'SET #count = :count',
      ExpressionAttributeNames: {
        '#count': 'count',
      },
      ExpressionAttributeValues: {
        ':count': newCount,
      },
      ReturnValues: 'ALL_NEW',
    });

    const result = await this.docClient.send(command);
    return result.Attributes as Stock;
  }

  async adjustCount(product_id: string, delta: number): Promise<Stock> {
    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: { product_id },
      UpdateExpression: 'SET #count = if_not_exists(#count, :zero) + :delta',
      ExpressionAttributeNames: {
        '#count': 'count',
      },
      ExpressionAttributeValues: {
        ':delta': delta,
        ':zero': 0,
      },
      ReturnValues: 'ALL_NEW',
    });

    const result = await this.docClient.send(command);
    return result.Attributes as Stock;
  }

  async delete(product_id: string): Promise<void> {
    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: { product_id },
    });

    await this.docClient.send(command);
  }

  async list(): Promise<Stock[]> {
    const command = new ScanCommand({
      TableName: this.tableName,
    });

    const result = await this.docClient.send(command);
    return result.Items as Stock[];
  }
}
