import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { randomBytes } from 'crypto';
import { extname } from 'path';

@Injectable()
export class StorageService {
  private readonly client: Minio.Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    const endpoint = new URL(config.getOrThrow('MINIO_ENDPOINT'));
    this.client = new Minio.Client({
      endPoint: endpoint.hostname,
      port: parseInt(endpoint.port || (endpoint.protocol === 'https:' ? '443' : '9000')),
      useSSL: endpoint.protocol === 'https:',
      accessKey: config.getOrThrow('MINIO_ACCESS_KEY'),
      secretKey: config.getOrThrow('MINIO_SECRET_KEY'),
    });
    this.bucket = config.getOrThrow('MINIO_BUCKET');
  }

  async ensureBucket(): Promise<void> {
    const exists = await this.client.bucketExists(this.bucket);
    if (!exists) {
      await this.client.makeBucket(this.bucket, 'sa-east-1');
      // public read policy for photos
      await this.client.setBucketPolicy(
        this.bucket,
        JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucket}/*`],
            },
          ],
        }),
      );
    }
  }

  async upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder = 'photos',
  ): Promise<string> {
    const ext = extname(originalName) || '.jpg';
    const key = `${folder}/${randomBytes(16).toString('hex')}${ext}`;

    try {
      await this.client.putObject(this.bucket, key, buffer, buffer.length, {
        'Content-Type': mimeType,
      });
    } catch (err) {
      throw new InternalServerErrorException('Failed to upload file to storage');
    }

    return key;
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.removeObject(this.bucket, key);
    } catch {
      // ignore — object may already be deleted
    }
  }

  getPublicUrl(key: string): string {
    const endpoint = this.config.getOrThrow('MINIO_ENDPOINT');
    return `${endpoint}/${this.bucket}/${key}`;
  }

  async getPresignedUrl(key: string, expirySeconds = 3600): Promise<string> {
    return this.client.presignedGetObject(this.bucket, key, expirySeconds);
  }
}
