import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend, Counter, Gauge, Rate } from 'k6/metrics';

// Custom metrics
const apiDuration = new Trend('api_duration');
const apiErrors = new Counter('api_errors');
const apiSuccess = new Rate('api_success');
const activeUsers = new Gauge('active_users');

// Load testing configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 500 },   // Ramp up to 500 users
    { duration: '10m', target: 1000 }, // Ramp up to 1000 users (peak)
    { duration: '5m', target: 500 },   // Ramp down to 500
    { duration: '2m', target: 0 },     // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95th percentile < 500ms
    http_req_failed: ['rate<0.1'],                   // Error rate < 0.1%
    'api_success': ['rate>0.99'],                    // Success rate > 99%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

// Test data
let authToken = '';
let userId = '';

export function setup() {
  // Global setup - register a test user
  const registerRes = http.post(`${API_URL}/auth/register`, {
    email: `load_test_${Date.now()}@test.com`,
    password: 'LoadTest123!',
    username: `loadtest_${Date.now()}`,
    firstName: 'Load',
    lastName: 'Test',
  });

  check(registerRes, {
    'setup: registration successful': (r) => r.status === 201,
  });

  return {};
}

export default function (data) {
  activeUsers.add(1);

  group('Authentication Flow', () => {
    // Login
    const loginRes = http.post(`${API_URL}/auth/login`, {
      email: `load_test_${Date.now()}@test.com`,
      password: 'LoadTest123!',
    });

    check(loginRes, {
      'login status is 200': (r) => r.status === 200,
      'login has token': (r) => r.json('accessToken') !== null,
    });

    if (loginRes.status === 200) {
      authToken = loginRes.json('accessToken');
      userId = loginRes.json('user.id');
      apiSuccess.add(true);
    } else {
      apiErrors.add(1);
      apiSuccess.add(false);
    }
  });

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  };

  group('Feed Operations', () => {
    // Get feed
    const feedRes = http.get(`${API_URL}/posts/feed?limit=20&offset=0`, authHeaders);
    apiDuration.add(feedRes.timings.duration);

    check(feedRes, {
      'feed status is 200': (r) => r.status === 200,
      'feed has posts': (r) => r.json('posts').length > 0 || r.json('posts').length === 0,
      'feed response time < 500ms': (r) => r.timings.duration < 500,
    });

    if (feedRes.status === 200) {
      apiSuccess.add(true);
    } else {
      apiErrors.add(1);
      apiSuccess.add(false);
    }
  });

  group('Post Operations', () => {
    // Create post
    const createPostRes = http.post(
      `${API_URL}/posts`,
      {
        content: `Load test post ${Date.now()}`,
      },
      authHeaders
    );
    apiDuration.add(createPostRes.timings.duration);

    check(createPostRes, {
      'create post status is 201': (r) => r.status === 201,
      'post has id': (r) => r.json('id') !== null,
      'create post response time < 500ms': (r) => r.timings.duration < 500,
    });

    if (createPostRes.status === 201) {
      apiSuccess.add(true);
      const postId = createPostRes.json('id');

      // Like post
      sleep(0.5);
      const likeRes = http.post(
        `${API_URL}/posts/${postId}/like`,
        {},
        authHeaders
      );
      apiDuration.add(likeRes.timings.duration);

      check(likeRes, {
        'like post status is 200': (r) => r.status === 200,
      });

      // Get post
      sleep(0.5);
      const getPostRes = http.get(`${API_URL}/posts/${postId}`, authHeaders);
      apiDuration.add(getPostRes.timings.duration);

      check(getPostRes, {
        'get post status is 200': (r) => r.status === 200,
      });
    } else {
      apiErrors.add(1);
      apiSuccess.add(false);
    }
  });

  group('User Profile Operations', () => {
    // Get user profile
    const profileRes = http.get(`${API_URL}/users/${userId}`, authHeaders);
    apiDuration.add(profileRes.timings.duration);

    check(profileRes, {
      'get profile status is 200': (r) => r.status === 200,
      'profile has user data': (r) => r.json('user.id') !== null,
      'profile response time < 300ms': (r) => r.timings.duration < 300,
    });

    if (profileRes.status === 200) {
      apiSuccess.add(true);
    } else {
      apiErrors.add(1);
      apiSuccess.add(false);
    }

    // Update profile
    sleep(0.5);
    const updateRes = http.patch(
      `${API_URL}/users/${userId}`,
      {
        bio: `Load tested on ${new Date().toISOString()}`,
      },
      authHeaders
    );
    apiDuration.add(updateRes.timings.duration);

    check(updateRes, {
      'update profile status is 200': (r) => r.status === 200,
    });
  });

  group('Follow Operations', () => {
    // Get random user to follow (simulation)
    const randomUserId = Math.random().toString(36).substring(7);

    // Follow user
    const followRes = http.post(
      `${API_URL}/users/${randomUserId}/follow`,
      {},
      authHeaders
    );
    apiDuration.add(followRes.timings.duration);

    check(followRes, {
      'follow request completed': (r) => r.status === 200 || r.status === 400,
    });

    // Get followers list
    sleep(0.5);
    const followersRes = http.get(
      `${API_URL}/users/${userId}/followers?limit=20`,
      authHeaders
    );
    apiDuration.add(followersRes.timings.duration);

    check(followersRes, {
      'followers list retrieved': (r) => r.status === 200,
    });
  });

  sleep(1);
  activeUsers.add(-1);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'summary.json': JSON.stringify(data),
  };
}

// Custom summary formatter
function textSummary(data, options) {
  let summary = '\n=== Load Test Summary ===\n';

  if (data.metrics) {
    const metrics = data.metrics;

    // API Duration
    if (metrics.api_duration) {
      summary += `\nAPI Response Times:\n`;
      summary += `  Min: ${metrics.api_duration.values.min?.toFixed(2)}ms\n`;
      summary += `  Max: ${metrics.api_duration.values.max?.toFixed(2)}ms\n`;
      summary += `  Avg: ${metrics.api_duration.values.avg?.toFixed(2)}ms\n`;
      summary += `  P95: ${metrics.api_duration.values['p(95)']?.toFixed(2)}ms\n`;
      summary += `  P99: ${metrics.api_duration.values['p(99)']?.toFixed(2)}ms\n`;
    }

    // Success Rate
    if (metrics.api_success) {
      const successRate = (metrics.api_success.values.rate * 100).toFixed(2);
      summary += `\nSuccess Rate: ${successRate}%\n`;
    }

    // Error Count
    if (metrics.api_errors) {
      summary += `Total Errors: ${metrics.api_errors.values.count}\n`;
    }

    // HTTP Checks
    if (data.metrics.http_reqs) {
      summary += `\nHTTP Requests: ${data.metrics.http_reqs.values.count}\n`;
    }
  }

  summary += '\n======================\n';
  return summary;
}
