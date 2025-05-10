import {main} from './import-products-file-handler';
import {PutObjectCommand, S3Client} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';

jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');

const mockGetSignedUrl = getSignedUrl as unknown as jest.Mock;
const mockPutObjectCommand = PutObjectCommand as unknown as jest.Mock;

describe('import-products-file-handler', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {...OLD_ENV, BUCKET_NAME: 'test-bucket', AWS_REGION: 'us-east-1'};
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('should return a signed URL when fileName is provided', async () => {
    const mockSignedUrl = 'https://example.com/signed-url';
    mockGetSignedUrl.mockResolvedValue(mockSignedUrl);

    const event = {fileName: 'test.csv'};
    const result = await main(event);

    expect(mockPutObjectCommand).toHaveBeenCalledWith({
      Bucket: 'test-bucket',
      Key: 'uploaded/test.csv',
      ContentType: 'text/csv',
    });
    expect(mockGetSignedUrl).toHaveBeenCalledWith(expect.any(S3Client), expect.any(PutObjectCommand), {expiresIn: 300});
    expect(result).toEqual({
      result: 'ok',
      signedUrl: mockSignedUrl,
    });
  });

  it('should throw an error when fileName is missing', async () => {
    const event = {};

    await expect(main(event as any)).rejects.toThrow('Missing fileName parameter');
  });
});