import {ProductService} from './product-service';
import {GetCommand, ScanCommand} from '@aws-sdk/lib-dynamodb';

describe('ProductTableService', () => {
  let productTableService: ProductService;

  beforeEach(() => {
    productTableService = new ProductService();
  });

  it('should create an instance of ProductService', () => {
    expect(productTableService).toBeInstanceOf(ProductService);
  });
});
