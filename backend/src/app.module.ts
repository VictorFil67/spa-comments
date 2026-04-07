import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommentsModule } from './comments/comments.module';
import { CaptchaModule } from './captcha/captcha.module';
import { UploadsModule } from './uploads/uploads.module';
import { AuthModule } from './auth/auth.module';
import { cacheConfig } from './config/cache.config';
import { User } from './entities/user.entity';
import { Comment } from './entities/comment.entity';
import { Attachment } from './entities/attachment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5434),
        username: config.get('DB_USERNAME', 'postgres'),
        password: config.get('DB_PASSWORD', 'postgres'),
        database: config.get('DB_NAME', 'spa_comments'),
        entities: [User, Comment, Attachment],
        synchronize: true,
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: cacheConfig,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          ...(config.get('REDIS_PASSWORD') && {
            password: config.get('REDIS_PASSWORD'),
          }),
        },
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    CommentsModule,
    CaptchaModule,
    UploadsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
