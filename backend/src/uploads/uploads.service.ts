import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment, AttachmentType } from '../entities/attachment.entity';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuid } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadsService {
  private readonly uploadDir: string;
  private readonly maxWidth: number;
  private readonly maxHeight: number;
  private readonly maxTextSize: number;

  constructor(
    @InjectRepository(Attachment)
    private readonly attachmentRepo: Repository<Attachment>,
    private readonly configService: ConfigService,
  ) {
    this.uploadDir = this.configService.get('UPLOAD_DIR', './uploads');
    this.maxWidth = this.configService.get('MAX_IMAGE_WIDTH', 320);
    this.maxHeight = this.configService.get('MAX_IMAGE_HEIGHT', 240);
    this.maxTextSize = this.configService.get('MAX_TEXT_FILE_SIZE', 102400);
  }

  async processUpload(
    file: Express.Multer.File,
    commentId: number,
  ): Promise<Attachment> {
    const isImage = /\.(jpg|jpeg|gif|png)$/i.test(file.originalname);
    const isText = /\.txt$/i.test(file.originalname);

    if (isText) {
      return this.processTextFile(file, commentId);
    } else if (isImage) {
      return this.processImageFile(file, commentId);
    }

    throw new BadRequestException('Unsupported file type');
  }

  private async processTextFile(
    file: Express.Multer.File,
    commentId: number,
  ): Promise<Attachment> {
    if (file.size > this.maxTextSize) {
      await fs.unlink(file.path);
      throw new BadRequestException(
        `Text file exceeds maximum size of ${this.maxTextSize / 1024}KB`,
      );
    }

    const destDir = path.join(this.uploadDir, 'texts');
    await fs.mkdir(destDir, { recursive: true });

    const fileName = `${uuid()}.txt`;
    const destPath = path.join(destDir, fileName);
    await fs.rename(file.path, destPath);

    const attachment = this.attachmentRepo.create({
      originalName: file.originalname,
      fileName,
      filePath: `/uploads/texts/${fileName}`,
      mimeType: file.mimetype,
      size: file.size,
      type: AttachmentType.TEXT,
      commentId,
    });

    return this.attachmentRepo.save(attachment);
  }

  private async processImageFile(
    file: Express.Multer.File,
    commentId: number,
  ): Promise<Attachment> {
    const destDir = path.join(this.uploadDir, 'images');
    await fs.mkdir(destDir, { recursive: true });

    const ext = path.extname(file.originalname).toLowerCase();
    const fileName = `${uuid()}${ext}`;
    const destPath = path.join(destDir, fileName);

    const metadata = await sharp(file.path).metadata();
    const needsResize =
      metadata.width > this.maxWidth || metadata.height > this.maxHeight;

    if (needsResize) {
      await sharp(file.path)
        .resize(this.maxWidth, this.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toFile(destPath);
      await fs.unlink(file.path);
    } else {
      await fs.rename(file.path, destPath);
    }

    const stat = await fs.stat(destPath);

    const attachment = this.attachmentRepo.create({
      originalName: file.originalname,
      fileName,
      filePath: `/uploads/images/${fileName}`,
      mimeType: file.mimetype,
      size: stat.size,
      type: AttachmentType.IMAGE,
      commentId,
    });

    return this.attachmentRepo.save(attachment);
  }
}
