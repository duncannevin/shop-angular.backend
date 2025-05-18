import { main } from './catalog-batch-process-handler';
import { ProductService } from 'services/product-service';
import { StockService } from 'services/stock-service';
import { SNSClient } from '@aws-sdk/client-sns';
import { SQSEvent } from 'aws-lambda';

export const createProductMock = jest.fn();

jest.mock('services/product-service', () => {
  return {
    ProductService: class {
      create(product: any) {
        // @ts-ignore
        return createProductMock(product);
      }
    },
  };
});

export const createStockMock = jest.fn();

jest.mock('services/stock-service', () => {
  return {
    StockService: class {
      create(stock: any) {
        // @ts-ignore
        return createStockMock(stock);
      }
    },
  };
});

export const snsSendMock = jest.fn();

jest.mock('@aws-sdk/client-sns', () => {
  return {
    SNSClient: class {
      send(command: any) {
        // @ts-ignore
        return createStockMock(command);
      }
    },
    PublishCommand: class {
      constructor(params: any) {
        // @ts-ignore
        return snsSendMock(params);
      }
    },
  };
});

describe('catalog-batch-process-handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process valid records and publish an SNS message', async () => {
    createProductMock.mockResolvedValue({id: '123', title: 'Test Product'});
    createStockMock.mockResolvedValue({product_id: '123', count: 10});
    snsSendMock.mockResolvedValue({});

    const event = {
      Records: [
        {
          body: JSON.stringify({
            title: 'Test Product',
            description: 'Test Description',
            price: 100,
            count: 10,
            action: 'create',
          }),
        },
      ],
    } as SQSEvent;

    process.env.CREATE_PRODUCT_TOPIC_ARN = 'arn:aws:sns:region:account-id:topic-name';

    await main(event);

    expect(createProductMock).toHaveBeenCalledWith({
      title: 'Test Product',
      description: 'Test Description',
      price: 100,
    });
    expect(createStockMock).toHaveBeenCalledWith({
      product_id: '123',
      count: 10,
    });
    expect(snsSendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        TopicArn: 'arn:aws:sns:region:account-id:topic-name',
        Message: JSON.stringify({ message: 'Products created successfully' }),
      }),
    );
  });

  it('should skip invalid records', async () => {
    createProductMock.mockResolvedValue({id: '123', title: 'Test Product'});
    createStockMock.mockResolvedValue({product_id: '123', count: 10});

    const event = {
      Records: [
        {
          body: JSON.stringify({
            title: 'Invalid Product',
            price: 'invalid', // Invalid price
          }),
        },
      ],
    } as SQSEvent;

    await main(event);

    expect(createProductMock).not.toHaveBeenCalled();
    expect(createStockMock).not.toHaveBeenCalled();
    expect(snsSendMock).not.toHaveBeenCalled();
  });

  it('should only send SNS message if products are created', async () => {
    createProductMock.mockResolvedValue({id: '123', title: 'Test Product'});
    createStockMock.mockResolvedValue({product_id: '123', count: 10});
    snsSendMock.mockResolvedValue({});

    const event = {
      Records: [
        {
          body: JSON.stringify({
            title: 'Test Product',
            description: 'Test Description',
            price: 100,
            count: 10,
            action: 'create',
          }),
        },
      ],
    } as SQSEvent;

    process.env.CREATE_PRODUCT_TOPIC_ARN = 'arn:aws:sns:region:account-id:topic-name';

    await main(event);

    expect(snsSendMock).toHaveBeenCalled();
  });
});