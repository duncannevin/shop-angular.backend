import {main} from './get-products-handler';
import { jest } from '@jest/globals';

export const listMock = jest.fn();
export const getMock = jest.fn();

// Mock the modules using function factories
jest.mock('../common/services/product-service', () => {
  return {
    ProductService: class {
      list() {
        return listMock();
      }
    },
  };
});

jest.mock('../common/services/stock-service', () => {
  return {
    StockService: class {
      get(id: string) {
        // @ts-ignore
        return getMock(id);
      }
    },
  };
});

describe('getProductsList', () => {
  describe('main', () => {

    beforeEach(() => {});

    it('should return a list of products', async () => {
      const event = {
        pathParameters: {
          id: '123',
        },
      };

      const mockProducts = [
        {
          id: '123',
          title: 'Product 1',
          description: 'Description 1',
          price: 100,
        },
        {
          id: '456',
          title: 'Product 2',
          description: 'Description 2',
          price: 200,
        },
      ];

      listMock.mockReturnValue(mockProducts);
      getMock.mockReturnValue({ count: 10 });

      const result = await main(event);

      expect(listMock).toHaveBeenCalled();
      expect(getMock).toHaveBeenNthCalledWith(1, '123');
      expect(getMock).toHaveBeenNthCalledWith(2, '456');
      expect(result).toEqual({
        result: 'ok',
        data: [
          {
            id: '123',
            title: 'Product 1',
            description: 'Description 1',
            price: 100,
            count: 10,
          },
          {
            id: '456',
            title: 'Product 2',
            description: 'Description 2',
            price: 200,
            count: 10,
          },
        ],
      });
    });

    it('should handle errors', async () => {
      const event = {
        pathParameters: {
          id: '123',
        },
      };

      listMock.mockImplementation(() => {
        throw new Error('Error getting products');
      });

      await expect(main(event)).rejects.toThrow('Error getting products');
      expect(listMock).toHaveBeenCalled();
    });
  });
});