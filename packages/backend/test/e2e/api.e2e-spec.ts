import { test, expect } from '@playwright/test'

const API_URL = process.env.API_URL || 'http://localhost:3000'

test.describe('Backend API E2E', () => {
  let accessToken: string
  let userId: string

  test.describe('Authentication Flow', () => {
    test('should register a new user', async ({ request }) => {
      const response = await request.post(`${API_URL}/auth/register`, {
        data: {
          email: `e2e-${Date.now()}@example.com`,
          password: 'E2ETestPassword123!',
          username: `e2euser${Date.now()}`,
          displayName: 'E2E Test User',
        },
      })

      expect(response.ok()).toBeTruthy()
      const body = await response.json()
      expect(body).toHaveProperty('accessToken')
      expect(body).toHaveProperty('refreshToken')

      accessToken = body.accessToken
    })

    test('should login with credentials', async ({ request }) => {
      const response = await request.post(`${API_URL}/auth/login`, {
        data: {
          email: `e2e-${Date.now()}@example.com`,
          password: 'E2ETestPassword123!',
        },
      })

      expect(response.ok()).toBeTruthy()
      const body = await response.json()
      expect(body).toHaveProperty('accessToken')

      accessToken = body.accessToken
    })
  })

  test.describe('User Management', () => {
    test('should get user profile', async ({ request }) => {
      test.skip(!accessToken, 'No access token')

      const response = await request.get(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      expect(response.ok()).toBeTruthy()
      const body = await response.json()
      expect(body).toHaveProperty('id')
      expect(body).toHaveProperty('profile')

      userId = body.id
    })

    test('should create a circle', async ({ request }) => {
      test.skip(!accessToken, 'No access token')

      const response = await request.post(`${API_URL}/users/${userId}/circles`, {
        data: {
          name: 'Close Friends',
          type: 'INNER',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      expect(response.ok()).toBeTruthy()
      const body = await response.json()
      expect(body).toHaveProperty('id')
    })
  })

  test.describe('Feed API', () => {
    test('should fetch home feed', async ({ request }) => {
      test.skip(!accessToken, 'No access token')

      const response = await request.get(`${API_URL}/feeds/home`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      expect(response.ok()).toBeTruthy()
      const body = await response.json()
      expect(Array.isArray(body.posts)).toBeTruthy()
    })

    test('should fetch trending feed', async ({ request }) => {
      const response = await request.get(`${API_URL}/feeds/trending`)

      expect(response.ok()).toBeTruthy()
      const body = await response.json()
      expect(Array.isArray(body.posts)).toBeTruthy()
    })
  })

  test.describe('Health Checks', () => {
    test('should return health status', async ({ request }) => {
      const response = await request.get(`${API_URL}/health`)

      expect(response.ok()).toBeTruthy()
      const body = await response.json()
      expect(body.status).toBe('ok')
    })

    test('should return liveness probe', async ({ request }) => {
      const response = await request.get(`${API_URL}/health/live`)

      expect(response.ok()).toBeTruthy()
    })

    test('should return readiness probe', async ({ request }) => {
      const response = await request.get(`${API_URL}/health/ready`)

      expect(response.ok()).toBeTruthy()
    })
  })

  test.describe('Error Handling', () => {
    test('should return 404 for unknown endpoint', async ({ request }) => {
      const response = await request.get(`${API_URL}/unknown-endpoint`)

      expect(response.status()).toBe(404)
    })

    test('should return 401 without authentication', async ({ request }) => {
      const response = await request.get(`${API_URL}/users/me`)

      expect(response.status()).toBe(401)
    })
  })

  test.describe('GraphQL API', () => {
    test('should execute GraphQL query', async ({ request }) => {
      const response = await request.post(`${API_URL}/graphql`, {
        data: {
          query: `
            query {
              homeFeed(userId: "test") {
                posts {
                  id
                  content
                }
              }
            }
          `,
        },
      })

      expect(response.ok()).toBeTruthy()
      const body = await response.json()
      expect(body).toHaveProperty('data')
    })
  })
})
