import { S3Event } from 'aws-lambda';
import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommandOutput
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import * as csvParser from 'csv-parser';

const s3Client = new S3Client([{
  region: process.env.AWS_REGION,
}]);

const parseCsvStream = (stream: Readable): Promise<void> => {
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
    const originalKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    console.log(`Processing file: ${originalKey} from bucket: ${bucketName}`);

    try {
      /**
       * Step 1: Get the object from S3
       */
      const getObjectCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: originalKey,
      });

      const { Body }: GetObjectCommandOutput = await s3Client.send(getObjectCommand as any);

      if (!Body || !(Body instanceof Readable)) {
        throw new Error('Invalid stream from S3 object');
      }

      await parseCsvStream(Body);

      /**
       * Step 2: Copy the object to a new location
       */
      const fileName = originalKey.split('/').pop();
      const parsedKey = `parsed/${fileName}`;

      const copyObjectCommand = new CopyObjectCommand({
        Bucket: bucketName,
        CopySource: `${bucketName}/${originalKey}`,
        Key: parsedKey,
      });

      await s3Client.send(copyObjectCommand as any);
      console.log(`Copied to: ${parsedKey}`);

      /**
       * Step 3: Delete the original object
       */
      const deleteObjectCommand = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: originalKey,
      });

      // Step 3: Delete the original object
      await s3Client.send(deleteObjectCommand as any);

      console.log(`Deleted original file: ${originalKey}`);
    } catch (error) {
      console.error(`Error handling file ${originalKey}:`, error);
    }
  }
}
