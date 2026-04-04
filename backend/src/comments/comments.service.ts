import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Comment } from '../entities/comment.entity';
import { User } from '../entities/user.entity';
import { CreateCommentDto, QueryCommentsDto } from './dto';
import { sanitizeCommentHtml, validateHtmlTags } from './html-sanitizer';
import { CaptchaService } from '../captcha/captcha.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly captchaService: CaptchaService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async create(dto: CreateCommentDto): Promise<Comment> {
    const isValidCaptcha = this.captchaService.validate(
      dto.captchaId,
      dto.captchaValue,
    );
    if (!isValidCaptcha) {
      throw new BadRequestException('Invalid or expired CAPTCHA');
    }

    const htmlErrors = validateHtmlTags(dto.text);
    if (htmlErrors.length > 0) {
      throw new BadRequestException({
        message: 'Invalid HTML in comment text',
        errors: htmlErrors,
      });
    }

    const sanitizedText = sanitizeCommentHtml(dto.text);

    if (dto.parentId) {
      const parentExists = await this.commentRepo.existsBy({
        id: dto.parentId,
      });
      if (!parentExists) {
        throw new NotFoundException(
          `Parent comment #${dto.parentId} not found`,
        );
      }
    }

    let user = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      user = this.userRepo.create({
        username: dto.username,
        email: dto.email,
        homePage: dto.homePage,
      });
      user = await this.userRepo.save(user);
    } else {
      user.username = dto.username;
      if (dto.homePage !== undefined) {
        user.homePage = dto.homePage;
      }
      user = await this.userRepo.save(user);
    }

    const comment = this.commentRepo.create({
      text: sanitizedText,
      userId: user.id,
      parentId: dto.parentId || null,
    });

    const saved = await this.commentRepo.save(comment);

    // invalidate comments cache on new comment
    await this.invalidateCommentsCache();

    return saved;
  }

  async findTopLevel(query: QueryCommentsDto) {
    const { sortBy, order, page, limit } = query;
    const cacheKey = `comments:${sortBy}:${order}:${page}:${limit}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const sortField =
      sortBy === 'username' || sortBy === 'email'
        ? `user.${sortBy}`
        : `comment.${sortBy}`;

    const [comments, total] = await this.commentRepo
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.attachment', 'attachment')
      .where('comment.parentId IS NULL')
      .orderBy(sortField, order)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const commentsWithChildren = await Promise.all(
      comments.map(async (comment) => {
        comment.children = await this.getChildrenRecursive(comment.id);
        return comment;
      }),
    );

    const result = {
      data: commentsWithChildren,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    await this.cacheManager.set(cacheKey, result, 60000);

    return result;
  }

  private async getChildrenRecursive(parentId: number): Promise<Comment[]> {
    const children = await this.commentRepo.find({
      where: { parentId },
      relations: ['user', 'attachment'],
      order: { createdAt: 'ASC' },
    });

    for (const child of children) {
      child.children = await this.getChildrenRecursive(child.id);
    }

    return children;
  }

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentRepo.findOne({
      where: { id },
      relations: ['user', 'attachment', 'children'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment #${id} not found`);
    }

    comment.children = await this.getChildrenRecursive(id);
    return comment;
  }

  private async invalidateCommentsCache() {
    try {
      await (this.cacheManager as any).reset();
    } catch {
      // cache reset not supported, keys will expire via TTL
    }
  }
}
