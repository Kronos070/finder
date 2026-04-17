import {
    S3Client,
    ListObjectsV2Command,
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
    DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

class StorageService {
    readonly client: S3Client;
    private readonly bucket = process.env.BUCKET_NAME!;

    constructor() {
        this.client = new S3Client({
            region: process.env.REGION!,
            endpoint: process.env.ENDPOINT!,
            credentials: {
                accessKeyId: process.env.ACCESS_KEY_ID!,
                secretAccessKey: process.env.SECRET_ACCESS_KEY!,
            },
            forcePathStyle: true,
        });
    }

    async getFileNames(): Promise<string[]> {
        const response = await this.client.send(
            new ListObjectsV2Command({ Bucket: this.bucket }),
        );
        return (response.Contents ?? [])
            .map((obj) => obj.Key)
            .filter((key): key is string => key !== undefined);
    }

    async put(key: string, body: Buffer, contentType?: string): Promise<void> {
        await this.client.send(
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: body,
                ContentType: contentType,
            }),
        );
    }

    async get(key: string): Promise<Buffer> {
        const { Body } = await this.client.send(
            new GetObjectCommand({ Bucket: this.bucket, Key: key }),
        );
        if (!Body) throw new Error(`S3 object missing: ${key}`);
        const chunks: Buffer[] = [];
        for await (const chunk of Body as AsyncIterable<Buffer>) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks);
    }

    async delete(key: string): Promise<void> {
        await this.client.send(
            new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
        );
    }

    async deleteMany(keys: string[]): Promise<void> {
        if (keys.length === 0) return;
        await this.client.send(
            new DeleteObjectsCommand({
                Bucket: this.bucket,
                Delete: { Objects: keys.map((Key) => ({ Key })) },
            }),
        );
    }

    async getDownloadUrl(key: string, ttlSeconds = 300): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        return getSignedUrl(this.client, command, { expiresIn: ttlSeconds });
    }
}

export const storageService = new StorageService();
