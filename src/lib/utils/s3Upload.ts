import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

interface S3Config {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

interface UploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "jpeg" | "png" | "webp";
}

export class S3Uploader {
  private s3Client: S3Client;
  private bucket: string;

  constructor(config: S3Config) {
    this.s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    this.bucket = config.bucket;
  }

  private async optimizeImage(
    file: File | Blob,
    options: UploadOptions = {}
  ): Promise<Buffer> {
    const {
      maxWidth = 1200,
      maxHeight = 1200,
      quality = 80,
      format = "jpeg",
    } = options;

    const buffer = await file.arrayBuffer();
    const optimizedBuffer = await sharp(Buffer.from(buffer))
      .resize(maxWidth, maxHeight, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .toFormat(format, { quality })
      .toBuffer();

    return optimizedBuffer;
  }

  private generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split(".").pop();
    return `${timestamp}-${randomString}.${extension}`;
  }

  async uploadFile(
    file: File | Blob,
    options: UploadOptions = {}
  ): Promise<string> {
    try {
      // Optimize the image
      const optimizedBuffer = await this.optimizeImage(file, options);

      // Generate a unique file name
      const fileName = this.generateUniqueFileName(
        file instanceof File ? file.name : "image"
      );

      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: `listings/${fileName}`,
        Body: optimizedBuffer,
        ContentType: `image/${options.format || "jpeg"}`,
      });

      await this.s3Client.send(command);

      // Return the S3 URL
      return `https://${this.bucket}.s3.${this.s3Client.config.region}.amazonaws.com/listings/${fileName}`;
    } catch (error) {
      console.error("Error uploading to S3:", error);
      throw new Error("Failed to upload image to S3");
    }
  }

  async uploadMultipleFiles(
    files: (File | Blob)[],
    options: UploadOptions = {}
  ): Promise<string[]> {
    try {
      const uploadPromises = files.map((file) =>
        this.uploadFile(file, options)
      );
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Error uploading multiple files to S3:", error);
      throw new Error("Failed to upload images to S3");
    }
  }
}

// Create a singleton instance with environment variables
export const s3Uploader = new S3Uploader({
  region: import.meta.env.VITE_AWS_REGION || "",
  bucket: import.meta.env.VITE_AWS_BUCKET || "",
  accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || "",
  secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || "",
});
