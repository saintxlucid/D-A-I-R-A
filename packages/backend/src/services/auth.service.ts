import { Injectable } from '@nestjs/common';
import { User } from '../types/user';

@Injectable()
export class AuthService {
  async signup(email: string, password: string): Promise<User> {
    // TODO: Hash password, save user to DB
    return { id: '1', email };
  }
}
