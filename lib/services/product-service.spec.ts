import {
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand
} from '@aws-sdk/lib-dynamodb';
import {ProductService} from './product-service';

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
  ScanCommand: jest.fn(),
  UpdateCommand: jest.fn(),
  DeleteCommand: jest.fn(),
}));

describe('productService', () => {
  let productService: ProductService;

  beforeEach(() => {
    process.env.AWS_REGION = 'us-west-2';
    process.env.PRODUCT_TABLE_NAME = 'ProductsTable';
    productService = new ProductService();
  });

  describe('list', () => {
    it('should return an array of products', async () => {
      const mockProducts = [
        {id: '1', title: 'Product 1', price: 100, description: 'Description 1'},
        {id: '2', title: 'Product 2', price: 200, description: 'Description 2'},
      ];

      sendMock.mockReturnValue({Items: mockProducts});

      const products = await productService.list();

      expect(products).toEqual(mockProducts);
      expect(sendMock).toHaveBeenCalledWith(new ScanCommand({TableName: 'test-table'}));
    });
  });

  describe('get', () => {
    it('should return a product by id', async () => {
      const mockProduct ={id: '1', title: 'Product 1', price: 100, description: 'Description 1'};

      sendMock.mockReturnValue({Item: mockProduct});

      const product = await productService.get('1');

      expect(product).toEqual(mockProduct);
      expect(sendMock).toHaveBeenCalledWith(new GetCommand({TableName: 'test-table', Key: {id: '1'}}));
    });

    it('should return null if product not found', async () => {
      sendMock.mockReturnValue({});

      const product = await productService.get('non-existent-id');

      expect(product).toBeNull();
      expect(sendMock).toHaveBeenCalledWith(new GetCommand({TableName: 'test-table', Key: {id: 'non-existent-id'}}));
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const mockProduct ={id: '1', title: 'Product 1', price: 100, description: 'Description 1'};

      sendMock.mockReturnValue({Attributes: mockProduct});

      const updatedProduct = await productService.update('1', {title: 'Updated Product', price: 150});

      expect(updatedProduct).toEqual(mockProduct);
      expect(sendMock).toHaveBeenCalledWith(new UpdateCommand({
        TableName: 'test-table',
        Key: {id: '1'},
        UpdateExpression: 'set #title = :title, #price = :price',
        ExpressionAttributeNames: {
          '#title': 'title',
          '#price': 'price',
        },
        ExpressionAttributeValues: {
          ':title': 'Updated Product',
          ':price': 150,
        },
        ReturnValues: 'ALL_NEW',
      }));
    });
  });

  describe('delete', () => {
    it('should delete a product', async () => {
      const mockProduct = {id: '1', title: 'Product 1', price: 100, description: 'Description 1'};

      sendMock.mockReturnValue({Attributes: mockProduct});

      expect(sendMock).toHaveBeenCalledWith(new DeleteCommand({TableName: 'test-table', Key: {id: '1'}}));
    });
  });
});
