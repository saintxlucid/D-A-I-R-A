import { Injectable } from '@nestjs/common';
import { RegisterDto, LoginDto, VerifyEmailDto } from './dto';
import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

@Injectable()
export class AuthService {
  async register(dto: RegisterDto) {
    // Placeholder: hash password, create user, create default profiles
    const user = await prisma.user.create({
      data: {
        email: dto.email,
        password: dto.password, // TODO: hash
        profiles: {
          create: [{ type: 'PUBLIC' }, { type: 'PRIVATE' }],
        },
      },
      include: { profiles: true },
    });
    return { id: user.id, email: user.email, profiles: user.profiles };
  }

  async login(dto: LoginDto) {
    // Placeholder: verify password, issue JWT & refresh
    const user = await prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || user.password !== dto.password) throw new Error('Invalid credentials');
    const accessToken = jwt.sign({ sub: user.id }, process.env.JWT_SECRET!, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ sub: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    // TODO: store refreshToken in Redis
    return { accessToken, refreshToken };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    // Placeholder: verify token
    return { success: true };
  }
}
