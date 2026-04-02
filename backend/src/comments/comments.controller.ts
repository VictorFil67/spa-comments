import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { CommentsService } from './comments.service';
import { CreateCommentDto, QueryCommentsDto } from './dto';
import { UploadsService } from '../uploads/uploads.service';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly uploadsService: UploadsService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/temp',
        filename: (_req, file, cb) => {
          const uniqueName = `${uuid()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB general limit
      },
      fileFilter: (_req, file, cb) => {
        const allowedImage = /\.(jpg|jpeg|gif|png)$/i;
        const allowedText = /\.txt$/i;

        if (
          allowedImage.test(file.originalname) ||
          allowedText.test(file.originalname)
        ) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Only JPG, GIF, PNG images and TXT files are allowed',
            ),
            false,
          );
        }
      },
    }),
  )
  async create(
    @Body() dto: CreateCommentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const comment = await this.commentsService.create(dto);

    if (file) {
      const attachment = await this.uploadsService.processUpload(
        file,
        comment.id,
      );
      comment.attachment = attachment;
    }

    return comment;
  }

  @Get()
  findAll(@Query() query: QueryCommentsDto) {
    return this.commentsService.findTopLevel(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.findOne(id);
  }
}
