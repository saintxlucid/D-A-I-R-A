import { Injectable } from '@nestjs/common';
import { User } from '../types/user';
import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

@Injectable()
export class AuthService {
  async signup(email: string, password: string): Promise<User> {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        profiles: { create: [{ type: 'PUBLIC' }, { type: 'PRIVATE' }] },
      },
    });
    return { id: user.id, email: user.email };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) throw new UnauthorizedException('Invalid credentials');
    const accessToken = jwt.sign({ sub: user.id }, process.env.JWT_SECRET!, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ sub: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    // store hashed refresh in sessions table
    const hashed = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await prisma.session.create({ data: { userId: user.id, token: hashed, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
    return { accessToken, refreshToken };
  }

  async refresh(cookie: string) {
    if (!cookie) throw new Error('No refresh token');
    try {
      const payload: any = jwt.verify(cookie, process.env.JWT_SECRET!);
      const userId = payload.sub;
      const hashed = crypto.createHash('sha256').update(cookie).digest('hex');
      const session = await prisma.session.findFirst({ where: { userId, token: hashed, expiresAt: { gt: new Date() } } });
      if (!session) throw new Error('Invalid session');
      // rotate refresh token
      const newRefresh = jwt.sign({ sub: userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
      const newHashed = crypto.createHash('sha256').update(newRefresh).digest('hex');
      await prisma.session.update({ where: { id: session.id }, data: { token: newHashed, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
      const accessToken = jwt.sign({ sub: userId }, process.env.JWT_SECRET!, { expiresIn: '15m' });
      return { accessToken, refreshToken: newRefresh };
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(cookie: string) {
    if (!cookie) return;
    const hashed = crypto.createHash('sha256').update(cookie).digest('hex');
    await prisma.session.deleteMany({ where: { token: hashed } });
    return { success: true };
  }
}
