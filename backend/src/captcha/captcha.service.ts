import { Injectable } from '@nestjs/common';
import * as svgCaptcha from 'svg-captcha';
import { v4 as uuid } from 'uuid';

interface CaptchaEntry {
  text: string;
  expiresAt: number;
}

@Injectable()
export class CaptchaService {
  private store = new Map<string, CaptchaEntry>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  generate(): { id: string; svg: string } {
    this.cleanup();

    const captcha = svgCaptcha.create({
      size: 5,
      noise: 3,
      color: true,
      background: '#f0f0f0',
    });

    const id = uuid();
    this.store.set(id, {
      text: captcha.text.toLowerCase(),
      expiresAt: Date.now() + this.TTL,
    });

    return { id, svg: captcha.data };
  }

  validate(id: string, value: string): boolean {
    const entry = this.store.get(id);
    if (!entry) return false;

    this.store.delete(id);

    if (Date.now() > entry.expiresAt) return false;

    return entry.text === value.toLowerCase();
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}
