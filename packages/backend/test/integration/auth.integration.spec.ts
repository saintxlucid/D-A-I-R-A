import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '@/modules/app.module'
import { PrismaService } from '@/lib/prisma.service'

describe('Auth API (Integration)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())
    await app.init()

    prisma = moduleFixture.get<PrismaService>(PrismaService)
  })

  afterAll(async () => {
    await app.close()
  })

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const registerDto = {
        email: 'integration-test@example.com',
        password: 'TestPassword123!',
        username: 'integrationtest',
        displayName: 'Integration Test User',
      }

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201)

      expect(response.body).toHaveProperty('accessToken')
      expect(response.body).toHaveProperty('refreshToken')

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: registerDto.email },
      })
      expect(user).toBeDefined()
    })

    it('should reject duplicate email', async () => {
      const registerDto = {
        email: 'integration-test@example.com',
        password: 'TestPassword123!',
        username: 'anotheruser',
        displayName: 'Another User',
      }

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(409)
    })

    it('should validate email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'TestPassword123!',
          username: 'testuser',
          displayName: 'Test',
        })
        .expect(400)
    })
  })

  describe('POST /auth/login', () => {
    beforeAll(async () => {
      await prisma.user.create({
        data: {
          email: 'login-test@example.com',
          username: 'logintest',
          password: '$2b$10$...hashed...', // Pre-hashed password
          profile: {
            create: {
              displayName: 'Login Test',
            },
          },
        },
      })
    })

    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'password123',
        })
        .expect(200)

      expect(response.body).toHaveProperty('accessToken')
    })

    it('should reject invalid password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'wrongpassword',
        })
        .expect(401)
    })
  })

  describe('GET /auth/profile', () => {
    let token: string

    beforeAll(async () => {
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'profile-test@example.com',
          password: 'TestPassword123!',
          username: 'profiletest',
          displayName: 'Profile Test',
        })

      token = registerResponse.body.accessToken
    })

    it('should return user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('email')
    })

    it('should reject request without token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401)
    })

    it('should reject request with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
    })
  })
})
