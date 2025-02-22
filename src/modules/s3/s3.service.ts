import {
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  S3Client,
} from "@aws-sdk/client-s3";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class S3Service {
  private logger = new Logger(S3Service.name);
  private region: string;
  private s3: S3Client;
  private bucket: string;

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.get<string>("S3_BUCKET")!;
    this.region = configService.get<string>("S3_REGION") || "eu-west-2";
    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>("AWS_ACCESS_KEY_ID")!,
        secretAccessKey: this.configService.get<string>("AWS_SECRET_ACCESS_KEY")!,
      },
    });
  }

  async uploadFile(file: Express.Multer["File"], key: string): Promise<string> {
    const input: PutObjectCommandInput = {
      Body: file.buffer,
      Bucket: this.bucket,
      Key: key,
      ContentType: file.mimetype,
      ACL: "public-read",
    };

    try {
      const response: PutObjectCommandOutput = await this.s3.send(new PutObjectCommand(input));
      if (response.$metadata.httpStatusCode === 200) {
        return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
      }
      throw new Error("Image not saved in s3!");
    } catch (err) {
      this.logger.error("Cannot save file to s3,", err);
      throw err;
    }
  }
}
