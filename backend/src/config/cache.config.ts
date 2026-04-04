import { CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

export async function cacheConfig(
  configService: ConfigService,
): Promise<CacheModuleOptions> {
  return {
    store: await redisStore({
      socket: {
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get<number>('REDIS_PORT', 6379),
      },
    }),
    ttl: 60 * 1000, // 60 seconds
  };
}
