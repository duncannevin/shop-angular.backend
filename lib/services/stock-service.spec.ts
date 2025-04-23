import {StockService} from './stock-service';

describe('StockService', () => {
  let stockService: StockService;

  beforeEach(() => {
    stockService = new StockService();
  });

  it('should create an instance of ProductService', () => {
    expect(stockService).toBeInstanceOf(StockService);
  });
});
