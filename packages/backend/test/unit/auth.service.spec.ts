import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AuthService } from '@/modules/auth/auth.service'
import { PrismaService } from '@/lib/prisma.service'
import { JwtService } from '@nestjs/jwt'

describe('AuthService (Unit)', () => {
  let service: AuthService
  let prisma: PrismaService
  let jwtService: JwtService

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
    password: '$2b$10$...hashed...',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    prisma = module.get<PrismaService>(PrismaService)
    jwtService = module.get<JwtService>(JwtService)
  })

  describe('register', () => {
    it('should create a new user with hashed password', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        displayName: 'Test User',
      }

      jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUser as any)
      jest.spyOn(jwtService, 'sign').mockReturnValue('token123')

      const result = await service.register(dto)

      expect(result).toHaveProperty('accessToken')
      expect(result).toHaveProperty('refreshToken')
      expect(prisma.user.create).toHaveBeenCalled()
    })

    it('should throw error on duplicate email', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        displayName: 'Test User',
      }

      jest.spyOn(prisma.user, 'create').mockRejectedValue(new Error('Unique constraint failed'))

      await expect(service.register(dto)).rejects.toThrow()
    })
  })

  describe('login', () => {
    it('should return tokens on successful login', async () => {
      const dto = { email: 'test@example.com', password: 'password123' }

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any)
      jest.spyOn(jwtService, 'sign').mockReturnValue('token123')

      const result = await service.login(dto)

      expect(result).toHaveProperty('accessToken')
      expect(result).toHaveProperty('refreshToken')
    })

    it('should throw error on invalid credentials', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null)

      await expect(service.login({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow()
    })
  })

  describe('validateUser', () => {
    it('should return user if valid', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any)

      const result = await service.validateUser('user-1')

      expect(result).toEqual(mockUser)
    })
  })
})
