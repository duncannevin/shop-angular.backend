import {S3Client, PutObjectCommand} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client([
  {region: process.env.AWS_REGION!},
]);

const BUCKET_NAME = process.env.BUCKET_NAME!;

export interface ImportProductsFileEvent {
  fileName: string;
}

export async function main(event: ImportProductsFileEvent): Promise<{result: string, signedUrl: string}> {
  console.log('Import Products File Handler:', event);

  const fileName = event.fileName;

  if (!fileName) {
    throw new Error('Missing fileName parameter');
  }

  const objectKey = `uploaded/${fileName}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: objectKey,
    ContentType: 'text/csv',
  });

  const signedUrl = await getSignedUrl(s3, command, {expiresIn: 300}); // 5 minutes

  return {
    result: 'ok',
    signedUrl,
  };
}
