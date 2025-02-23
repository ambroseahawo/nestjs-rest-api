import { Injectable, FileTypeValidator as NestFileTypeValidator } from "@nestjs/common";

@Injectable()
export class CustomFileTypeValidator extends NestFileTypeValidator {
  constructor(private readonly allowedMimeTypes: string[]) {
    super({ fileType: allowedMimeTypes.join("|") });
  }

  isValid(file: Express.Multer.File): boolean {
    return this.allowedMimeTypes.includes(file.mimetype);
  }
}
