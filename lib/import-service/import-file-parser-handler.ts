import {S3Event} from 'aws-lambda';
import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommandOutput
} from '@aws-sdk/client-s3';
import {SQSClient, SendMessageCommand, SendMessageBatchCommand} from '@aws-sdk/client-sqs';
import {Readable} from 'stream';
import * as csvParser from 'csv-parser';
import {chunkArray} from '../common/utils-stack';

const CATALOG_ITEMS_QUEUE_URL = process.env.CATALOG_ITEMS_QUEUE_URL!;

const s3Client = new S3Client([{
  region: process.env.AWS_REGION!,
}]);


const sqsClient = new SQSClient([{
  region: process.env.AWS_REGION!,
}]);

class ImportedProduct {
  title: string;
  description: string;
  price: number;
  count: number;
  action: string;

  constructor(data: any) {
    this.title = data.Title;
    this.description = data.Description;
    this.price = parseFloat(data.Price);
    this.count = parseInt(data.Count, 10);
    this.action = data.Action;
  }
}

const parseCsvStream = (stream: Readable): Promise<ImportedProduct[]> => {
  return new Promise((resolve, reject) => {
    const products: ImportedProduct[] = [];

    stream
      .pipe(csvParser())
      .on('data', (record) => {
        const product = new ImportedProduct(record);
        console.log('Parsed record:', product);
        products.push(product);
      })
      .on('end', async () => {
        console.log('CSV parsing complete. returning products...');
        resolve(products);
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

      const {Body}: GetObjectCommandOutput = await s3Client.send(getObjectCommand as any);

      if (!Body || !(Body instanceof Readable)) {
        throw new Error('Invalid stream from S3 object');
      }

      const importedProducts = await parseCsvStream(Body);

      const entries = importedProducts.map((product, index) => ({
        Id: index.toString(),
        MessageBody: JSON.stringify(product),
      }));

      const entryChunks = chunkArray(entries, 10);

      for (const chunk of entryChunks) {
        const sendMessageCommand = new SendMessageBatchCommand({
          Entries: chunk,
          QueueUrl: CATALOG_ITEMS_QUEUE_URL,
        });

        await sqsClient.send(sendMessageCommand as any);
      }

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
