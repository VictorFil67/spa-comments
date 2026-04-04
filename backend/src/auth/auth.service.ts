import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async issueToken(email: string, username: string): Promise<string> {
    let user = await this.userRepo.findOne({ where: { email } });

    if (!user) {
      user = this.userRepo.create({ email, username });
      user = await this.userRepo.save(user);
    }

    const payload = { sub: user.id, email: user.email, username: user.username };
    return this.jwtService.sign(payload);
  }

  async validateUser(payload: { sub: number }): Promise<User | null> {
    return this.userRepo.findOne({ where: { id: payload.sub } });
  }
}
