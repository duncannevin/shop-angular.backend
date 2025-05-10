import {S3Event} from 'aws-lambda';
import {S3Client, GetObjectCommand, GetObjectCommandOutput} from '@aws-sdk/client-s3';
import {Readable} from 'stream';
import * as csvParser from 'csv-parser';

const s3Client = new S3Client([{
  region: process.env.AWS_REGION!,
}]);

const streamToString = async (stream: Readable): Promise<void> => {
  return new Promise((resolve, reject) => {
    stream
      .pipe(csvParser())
      .on('data', (record) => {
        console.log('Parsed record:', record);
      })
      .on('end', () => {
        console.log('CSV parsing complete.');
        resolve();
      })
      .on('error', (err) => {
        console.error('Stream error:', err);
        reject(err);
      });
  });
};

export async function main(event: S3Event): Promise<void> {
  for (const record of event.Records) {
    const bucketName = record.s3.bucket.name;
    const objectKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    console.log(`Processing file: ${objectKey} from bucket: ${bucketName}`);

    const getObjectCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    try {
      const response: GetObjectCommandOutput = await s3Client.send(getObjectCommand as any);

      if (!response.Body || !(response.Body instanceof Readable)) {
        throw new Error('Invalid S3 object stream');
      }

      await streamToString(response.Body);
    } catch (error) {
      console.error('Error processing file:', error);
    }
  }
}
