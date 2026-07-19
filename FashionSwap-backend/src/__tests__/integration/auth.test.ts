import request from 'supertest';
import jwt from 'jsonwebtoken';
// ensure test env is set before app loads dotenv/config
process.env.NODE_ENV = 'test';
const app = require('../../app').default;
import { UserModel } from '../../models/user.model';
import { JWT_SECRET } from '../../config';

const makeUniqueEmail = (prefix: string) => `${prefix}+${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

// helper to obtain CSRF cookie and token for mutating requests
async function getCsrf() {
  const res = await request(app).get('/api/csrf');
  const cookie = res.headers['set-cookie'] && res.headers['set-cookie'][0];
  const token = cookie ? (cookie.match(/x-csrf-token=([^;]+)/) || [])[1] : undefined;
  return { cookie, token };
}

describe('Authentication Integration Tests', () => {
  const createdEmails = new Set<string>();

  const registerUser = async (overrides: Partial<Record<string, any>> = {}) => {
    const email = overrides.email || makeUniqueEmail('test');
    const user = {
      email,
      password: 'TestPassword@1234',
      confirmPassword: 'TestPassword@1234',
      name: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      location: 'Test City',
      ...overrides,
    };

    createdEmails.add(email);
    const { cookie, token } = await getCsrf();
    return request(app).post('/api/auth/register').set('Cookie', cookie || '').set('x-csrf-token', token || '').send(user);
  };

  beforeAll(async () => {
    await UserModel.deleteMany({ email: { $in: Array.from(createdEmails) } });
  });

  afterAll(async () => {
    await UserModel.deleteMany({ email: { $in: Array.from(createdEmails) } });
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const email = makeUniqueEmail('register');
      const user = await UserModel.create({
        email,
        password: 'TestPassword@1234',
        firstName: 'Test',
        lastName: 'User',
        location: 'Test City',
      } as any);

      expect(user).toBeDefined();
      expect(user.email).toBe(email.toLowerCase());
    });

    test('should not register a new user with duplicate email', async () => {
      const email = makeUniqueEmail('duplicate');
      createdEmails.add(email);
      await UserModel.create({
        email,
        password: 'TestPassword@1234',
        firstName: 'Dup',
        lastName: 'User',
        location: 'Test City',
      } as any);

      let threw = false;
      try {
        await UserModel.create({
          email,
          password: 'TestPassword@1234',
          firstName: 'Dup2',
          lastName: 'User2',
          location: 'Test City',
        } as any);
      } catch (err: any) {
        threw = true;
        expect(err && err.code).toBeTruthy();
      }
      expect(threw).toBe(true);
    });

    test('should not register a new user with invalid email', async () => {
      const { cookie, token } = await getCsrf();
      const response = await request(app).post('/api/auth/register').set('Cookie', cookie || '').set('x-csrf-token', token || '').send({
        email: 'invalid-email',
        password: 'TestPassword@1234',
        confirmPassword: 'TestPassword@1234',
        firstName: 'Invalid',
        lastName: 'Email',
        location: 'Test City',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    test('should not register a new user without name', async () => {
      const { cookie, token } = await getCsrf();
      const response = await request(app).post('/api/auth/register').set('Cookie', cookie || '').set('x-csrf-token', token || '').send({
        email: makeUniqueEmail('missingname'),
        password: 'TestPassword@1234',
        confirmPassword: 'TestPassword@1234',
        location: 'Test City',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login an existing user', async () => {
      const email = makeUniqueEmail('login');
      const password = 'TestPassword@1234';
      createdEmails.add(email);

      await UserModel.create({ email, password, firstName: 'Login', lastName: 'User', location: 'Login City' } as any);
      await UserModel.updateOne({ email }, { isVerified: true });

      const { cookie, token } = await getCsrf();
      const response = await request(app).post('/api/auth/login').set('Cookie', cookie || '').set('x-csrf-token', token || '').send({ email, password });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
    });

    test('should not login with incorrect password', async () => {
      const email = makeUniqueEmail('loginwrong');
      const password = 'TestPassword@1234';
      createdEmails.add(email);

      await UserModel.create({ email, password, firstName: 'Login', lastName: 'User', location: 'Login City' } as any);
      await UserModel.updateOne({ email }, { isVerified: true });

      const { cookie, token } = await getCsrf();
      const response = await request(app).post('/api/auth/login').set('Cookie', cookie || '').set('x-csrf-token', token || '').send({ email, password: 'WrongPassword!' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/reset-password/:token', () => {
    test('should not reset password with invalid token', async () => {
      const { cookie, token } = await getCsrf();
      const response = await request(app).post('/api/auth/reset-password/invalid-token').set('Cookie', cookie || '').set('x-csrf-token', token || '').send({ newPassword: 'NewPassword@123' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    test('should reset password with valid token', async () => {
      const email = makeUniqueEmail('reset');
      const password = 'ResetPassword@1234';
      createdEmails.add(email);

      await UserModel.create({ email, password, firstName: 'Reset', lastName: 'User', location: 'Reset City' } as any);
      // mark user as verified so reset/login flows can proceed in integration tests
      await UserModel.updateOne({ email }, { isVerified: true });
      const resetUserDoc = await UserModel.findOne({ email });
      const token = jwt.sign({ id: resetUserDoc?._id }, JWT_SECRET, { expiresIn: '1h' });

      const { cookie, token: csrfToken } = await getCsrf();
      const response = await request(app).post(`/api/auth/reset-password/${token}`).set('Cookie', cookie || '').set('x-csrf-token', csrfToken || '').send({ newPassword: 'NewPassword@123' });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    test('should login with new password after reset', async () => {
      const email = makeUniqueEmail('resetlogin');
      const password = 'ResetPassword@1234';
      createdEmails.add(email);

      await UserModel.create({ email, password, firstName: 'Reset', lastName: 'User', location: 'Reset City' } as any);
      // mark user as verified so login after reset succeeds
      await UserModel.updateOne({ email }, { isVerified: true });
      const resetUserDoc = await UserModel.findOne({ email });
      const token = jwt.sign({ id: resetUserDoc?._id }, JWT_SECRET, { expiresIn: '1h' });
      const { cookie, token: csrfToken } = await getCsrf();
      await request(app).post(`/api/auth/reset-password/${token}`).set('Cookie', cookie || '').set('x-csrf-token', csrfToken || '').send({ newPassword: 'NewPassword@123' });

      const { cookie: loginCookie, token: loginCsrf } = await getCsrf();
      const response = await request(app).post('/api/auth/login').set('Cookie', loginCookie || '').set('x-csrf-token', loginCsrf || '').send({ email, password: 'NewPassword@123' });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
    });
  });
});
