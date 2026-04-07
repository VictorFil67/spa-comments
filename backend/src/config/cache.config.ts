import { CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

export async function cacheConfig(
  configService: ConfigService,
): Promise<CacheModuleOptions> {
  try {
    const store = await redisStore({
      socket: {
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get<number>('REDIS_PORT', 6379),
        connectTimeout: 3000,
      },
      ...(configService.get('REDIS_PASSWORD') && {
        password: configService.get('REDIS_PASSWORD'),
      }),
    });
    return { store, ttl: 60 * 1000 };
  } catch {
    // fallback to in-memory cache if Redis is unavailable
    return { ttl: 60 * 1000 };
  }
}
