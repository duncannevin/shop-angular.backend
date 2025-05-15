import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { main } from './import-file-parser-handler';
import { S3Event } from 'aws-lambda';
import { Readable } from 'stream';

const s3Mock = mockClient(S3Client);
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

describe('main', () => {
  beforeEach(() => {
    s3Mock.reset();
  });

  it('should process the S3 event and handle the file correctly', async () => {
    const mockCsvData = 'column1,column2\nvalue1,value2\n';
    const mockStream = new Readable({
      read() {
        this.push(mockCsvData);
        this.push(null);
      },
    });

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
    expect(consoleLogSpy).toHaveBeenCalledWith('Parsed record:', { column1: 'value1', column2: 'value2' });
    expect(consoleLogSpy).toHaveBeenCalledWith('CSV parsing complete.');
    expect(consoleLogSpy).toHaveBeenCalledWith('Copied to: parsed/test-file.csv');
    expect(consoleLogSpy).toHaveBeenCalledWith('Deleted original file: uploaded/test-file.csv');

    consoleLogSpy.mockRestore();
  });
});