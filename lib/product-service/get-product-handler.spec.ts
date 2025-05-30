import {main} from './get-product-handler';
import { jest } from '@jest/globals';

export const getProductMock = jest.fn();
export const getStockMock = jest.fn();

jest.mock('../common/services/product-service', () => {
  return {
    ProductService: class {
      get(productId: string) {
        // @ts-ignore
        return getProductMock(productId);
      }
    },
  };
});

jest.mock('../common/services/stock-service', () => {
  return {
    StockService: class {
      get(productId: string) {
        // @ts-ignore
        return getStockMock(productId);
      }
    },
  };
});

describe('getProduct', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('main', () => {
    it('should return a product with stock', async () => {
      const event = {productId: '123'};

      const mockProduct = {
        id: '123',
        title: 'Product 1',
        description: 'Description 1',
        price: 100,
      };

      const mockStock = {count: 10};

      getProductMock.mockReturnValue(mockProduct);
      getStockMock.mockReturnValue(mockStock);

      const result = await main(event);

      expect(result).toEqual({
        result: 'ok',
        data: {
          id: '123',
          title: 'Product 1',
          description: 'Description 1',
          price: 100,
          count: 10,
        },
      });

      expect(getProductMock).toHaveBeenCalledWith('123');
      expect(getStockMock).toHaveBeenCalledWith('123');
    });

    it('should throw an error when the product is not found', async () => {
      const event = {productId: '123'};

      getProductMock.mockReturnValue(null);

      await expect(main(event)).rejects.toThrow('not found');

      expect(getProductMock).toHaveBeenCalledWith('123');
      expect(getStockMock).not.toHaveBeenCalled();
    });
  });
});