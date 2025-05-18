import 'aws-sdk-client-mock-jest';
import {S3Client, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand} from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import {ImportedProduct, main} from './import-file-parser-handler';
import { S3Event } from 'aws-lambda';
import { Readable } from 'stream';
import {SendMessageBatchCommand, SendMessageCommand, SQSClient} from '@aws-sdk/client-sqs';

const sqsMock = mockClient(SQSClient);
const s3Mock = mockClient(S3Client);
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

describe('main', () => {
  const mockCsvData = 'Title,Description,Price,Count,Action\nvalue1,,value2,,';
  let mockStream: Readable;

  beforeEach(() => {
    mockStream = new Readable({
      read() {
        this.push(mockCsvData);
        this.push(null);
      },
    });
    s3Mock.reset();
    sqsMock.reset();
  });

  it('should log the status', async () => {
    s3Mock.on(GetObjectCommand).resolves({ Body: mockStream as any } as any);

    const event: S3Event = {
      Records: [
        {
          s3: {
            bucket: { name: 'test-bucket' },
            object: { key: 'uploaded/test-file.csv' },
          },
        },
      ],
    } as any;

    await main(event);

    expect(consoleLogSpy).toHaveBeenCalledWith('Processing file: uploaded/test-file.csv from bucket: test-bucket');
    expect(consoleLogSpy).toHaveBeenCalledWith('Parsed record:', new ImportedProduct({ Title: 'value1', Description: '', Price: 'value2', Count: '', Action: '' }));
    expect(consoleLogSpy).toHaveBeenCalledWith('CSV parsing complete. returning products...');
    expect(consoleLogSpy).toHaveBeenCalledWith('Copied to: parsed/test-file.csv');
    expect(consoleLogSpy).toHaveBeenCalledWith('Deleted original file: uploaded/test-file.csv');

    consoleLogSpy.mockRestore();
  });

  it('should send messages to SQS', async () => {
    s3Mock.on(GetObjectCommand).resolves({ Body: mockStream as any } as any);
    sqsMock.on(SendMessageBatchCommand).resolves({});

    const event: S3Event = {
      Records: [
        {
          s3: {
            bucket: { name: 'test-bucket' },
            object: { key: 'uploaded/test-file.csv' },
          },
        },
      ],
    } as any;

    await main(event);

    expect(sqsMock).toHaveReceivedCommandWith(SendMessageBatchCommand, {
      QueueUrl: process.env.CATALOG_ITEMS_QUEUE_URL,
      Entries: [
        {
          Id: '0',
          MessageBody: JSON.stringify({
            title: 'value1',
            description: '',
            price: NaN,
            count: NaN,
            action: '',
          }),
        },
      ],
    });
  });

  it('should copy the file to the parsed folder', async () => {
    s3Mock.on(GetObjectCommand).resolves({ Body: mockStream as any } as any);

    const event: S3Event = {
      Records: [
        {
          s3: {
            bucket: { name: 'test-bucket' },
            object: { key: 'uploaded/test-file.csv' },
          },
        },
      ],
    } as any;

    await main(event);

    expect(s3Mock).toHaveReceivedCommandWith(CopyObjectCommand, {
      Bucket: 'test-bucket',
      CopySource: 'test-bucket/uploaded/test-file.csv',
      Key: 'parsed/test-file.csv',
    });
  });

  it('should delete the original file', async () => {
    s3Mock.on(GetObjectCommand).resolves({ Body: mockStream as any } as any);

    const event: S3Event = {
      Records: [
        {
          s3: {
            bucket: { name: 'test-bucket' },
            object: { key: 'uploaded/test-file.csv' },
          },
        },
      ],
    } as any;

    await main(event);

    expect(s3Mock).toHaveReceivedCommandWith(DeleteObjectCommand, {
      Bucket: 'test-bucket',
      Key: 'uploaded/test-file.csv',
    });
  });

  it('should handle errors', async () => {
    s3Mock.on(GetObjectCommand).rejects(new Error('S3 error'));

    const event: S3Event = {
      Records: [
        {
          s3: {
            bucket: { name: 'test-bucket' },
            object: { key: 'uploaded/test-file.csv' },
          },
        },
      ],
    } as any;

    await main(event);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error handling file uploaded/test-file.csv:', new Error('S3 error'));
  });
});