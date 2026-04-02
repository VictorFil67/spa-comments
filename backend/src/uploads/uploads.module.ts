import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadsService } from './uploads.service';
import { Attachment } from '../entities/attachment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attachment])],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
