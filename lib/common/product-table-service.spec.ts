import {ProductTableService} from './product-table-service';
import {GetCommand, ScanCommand} from '@aws-sdk/lib-dynamodb';

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
}));

describe('ProductTableService', () => {
  let productTableService: ProductTableService;

  beforeEach(() => {
    productTableService = new ProductTableService('test-table', {} as any);
  });

  it('should create an instance of ProductTableService', () => {
    expect(productTableService).toBeInstanceOf(ProductTableService);
  });

  describe('getProducts', () => {
    it('should return an array of products', async () => {
      const mockProducts = [
        {id: '1', name: 'Product 1', price: 100, category: 'Category 1', inStock: true},
        {id: '2', name: 'Product 2', price: 200, category: 'Category 2', inStock: false},
      ];

      sendMock.mockReturnValue({Items: mockProducts});

      const products = await productTableService.getProducts();

      expect(products).toEqual(mockProducts);
      expect(sendMock).toHaveBeenCalledWith(new ScanCommand({TableName: 'test-table'}));
    });
  });

  describe('getProduct', () => {
    it('should return a product by id', async () => {
      const mockProduct = {id: '1', name: 'Product 1', price: 100, category: 'Category 1', inStock: true};

      sendMock.mockReturnValue({Item: mockProduct});

      const product = await productTableService.getProduct('1');

      expect(product).toEqual(mockProduct);
      expect(sendMock).toHaveBeenCalledWith(new GetCommand({TableName: 'test-table', Key: {id: '1'}}));
    });

    it('should return undefined if product not found', async () => {
      sendMock.mockReturnValue({});

      const product = await productTableService.getProduct('non-existent-id');

      expect(product).toBeUndefined();
      expect(sendMock).toHaveBeenCalledWith(new GetCommand({TableName: 'test-table', Key: {id: 'non-existent-id'}}));
    });
  });

  describe('getProductBatch', () => {
    it('should return a batch of products', async () => {
      const mockProducts = [
        {id: '1', name: 'Product 1', price: 100, category: 'Category 1', inStock: true},
        {id: '2', name: 'Product 2', price: 200, category: 'Category 2', inStock: false},
        {id: '3', name: 'Product 3', price: 300, category: 'Category 3', inStock: true},
      ];

      sendMock.mockReturnValue({Items: mockProducts});

      const products = await productTableService.getProductBatch(0, 2);

      expect(products).toEqual(mockProducts.slice(0, 2));
      expect(sendMock).toHaveBeenCalledWith(new ScanCommand({TableName: 'test-table'}));
    });
  });
});
