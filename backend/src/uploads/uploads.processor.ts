import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs/promises';

interface ImageResizeJob {
  inputPath: string;
  outputPath: string;
  maxWidth: number;
  maxHeight: number;
}

@Processor('file-processing')
export class UploadsProcessor {
  @Process('resize-image')
  async handleImageResize(job: Job<ImageResizeJob>) {
    const { inputPath, outputPath, maxWidth, maxHeight } = job.data;

    await sharp(inputPath)
      .resize(Number(maxWidth), Number(maxHeight), {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFile(outputPath);

    if (inputPath !== outputPath) {
      await fs.unlink(inputPath);
    }

    return { outputPath };
  }
}
