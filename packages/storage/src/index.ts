import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";

const client = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_KEY || ""
  },
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true"
});

const bucket = process.env.S3_BUCKET || "omni";

export const generateKey = (prefix: string) => `${prefix}/${nanoid()}`;

export const putObject = async (key: string, body: Buffer, contentType?: string) => {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType
    })
  );
  return key;
};

export const getObject = async (key: string) => {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const response = await client.send(command);
  return response.Body;
};

export const deleteObject = async (key: string) => {
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
};

export const signGetUrl = async (key: string) => {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn: 900 });
};
