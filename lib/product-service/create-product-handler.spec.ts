import {main} from './create-product-handler';
import { jest } from '@jest/globals';

export const createProductMock = jest.fn();

jest.mock('../common/services/product-service', () => {
  return {
    ProductService: class {
      create(product: any) {
        // @ts-ignore
        return createProductMock(product);
      }
    },
  };
});

describe('getProduct', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('main', () => {
    it('should create a product', async () => {
      const event = {
        title: 'Product 1',
        description: 'Description 1',
        price: 100,
      };

      const mockProduct = {
        id: '123',
        title: 'Product 1',
        description: 'Description 1',
        price: 100,
      };

      createProductMock.mockReturnValue(mockProduct);

      const result = await main(event);

      expect(result).toEqual({
        result: 'ok',
        data: {
          ...mockProduct,
          count: 0,
        },
      });
    });
  });
});
