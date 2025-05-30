import {
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand
} from '@aws-sdk/lib-dynamodb';
import {ProductService} from './product-service';
import {Stock, StockService} from './stock-service';

jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn(),
}));

const sendMock = jest.fn();

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: jest.fn(() => ({
      send: sendMock,
    })),
  },
  GetCommand: jest.fn(),
  PutCommand: jest.fn(),
  ScanCommand: jest.fn(),
  UpdateCommand: jest.fn(),
  DeleteCommand: jest.fn(),
}));

describe('StockService', () => {
  let stockService: StockService;

  beforeEach(() => {
    process.env.AWS_REGION = 'us-west-2';
    process.env.PRODUCT_TABLE_NAME = 'StockTable';
    stockService = new StockService();
  });

  describe('create', () => {
    it('should create a new stock item', async () => {
      const mockStock: Stock = {
        product_id: '123',
        count: 10,
      };

      sendMock.mockReturnValue({Item: mockStock});

      const stock = await stockService.create(mockStock);

      expect(stock).toEqual(mockStock);
      expect(sendMock).toHaveBeenCalledWith(expect.anything());
    });
  });

  describe('get', () => {
    it('should return a stock item by product_id', async () => {
      const mockStock: Stock = {
        product_id: '123',
        count: 10,
      };

      sendMock.mockReturnValue({Item: mockStock});

      const stock = await stockService.get('123');

      expect(stock).toEqual(mockStock);
      expect(sendMock).toHaveBeenCalledWith(expect.any(GetCommand));
    });
  });

  describe('updateCount', () => {
    it('should update the count of a stock item', async () => {
      const mockStock: Stock = {
        product_id: '123',
        count: 10,
      };

      sendMock.mockReturnValue({Attributes: mockStock});

      const updatedStock = await stockService.updateCount('123', 20);

      expect(updatedStock).toEqual(mockStock);
      expect(sendMock).toHaveBeenCalledWith(new UpdateCommand({
        TableName: 'StockTable',
        Key: { product_id: '123' },
        UpdateExpression: 'SET #count = :count',
        ExpressionAttributeNames: { '#count': 'count' },
        ExpressionAttributeValues: { ':count': 20 },
      }));
    });
  });

  describe('adjustCount', () => {
    it('should adjust the stock count', async () => {
      const mockStock: Stock = {
        product_id: '123',
        count: 10,
      };

      sendMock.mockReturnValue({Attributes: mockStock});

      const adjustedStock = await stockService.adjustCount('123', 5);

      expect(adjustedStock).toEqual(mockStock);
      expect(sendMock).toHaveBeenCalledWith(new UpdateCommand({
        TableName: 'StockTable',
        Key: { product_id: '123' },
        UpdateExpression: 'SET #count = #count + :count',
        ExpressionAttributeNames: { '#count': 'count' },
        ExpressionAttributeValues: { ':count': 5 },
      }));
    });
  });

  describe('delete', () => {
    it('should delete a stock item', async () => {
      const mockStock: Stock = {
        product_id: '123',
        count: 10,
      };

      sendMock.mockReturnValue({Attributes: mockStock});

      await stockService.delete('123');

      expect(sendMock).toHaveBeenCalledWith(new DeleteCommand({
        TableName: 'StockTable',
        Key: { product_id: '123' },
      }));
    });
  });

  describe('list', () => {
    it('should return all stock items', async () => {
      const mockStockList: Stock[] = [
        { product_id: '123', count: 10 },
        { product_id: '456', count: 20 },
      ];

      sendMock.mockReturnValue({Items: mockStockList});

      const stockList = await stockService.list();

      expect(stockList).toEqual(mockStockList);
      expect(sendMock).toHaveBeenCalledWith(new ScanCommand({
        TableName: 'StockTable',
      }));
    });
  });
});
