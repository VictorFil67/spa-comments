import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { UploadsService } from './uploads.service';
import { UploadsProcessor } from './uploads.processor';
import { Attachment } from '../entities/attachment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attachment]),
    BullModule.registerQueue({ name: 'file-processing' }),
  ],
  providers: [UploadsService, UploadsProcessor],
  exports: [UploadsService],
})
export class UploadsModule {}
