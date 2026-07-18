import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';
import { UserModel } from '../../models/user.model';
import { JWT_SECRET } from '../../config';

const makeUniqueEmail = (prefix: string) => `${prefix}+${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

describe('Authentication Integration Tests', () => {
  const createdEmails = new Set<string>();

  const registerUser = async (overrides: Partial<Record<string, any>> = {}) => {
    const email = overrides.email || makeUniqueEmail('test');
    const user = {
      email,
      password: 'TestPassword@1234',
      confirmPassword: 'TestPassword@1234',
      firstName: 'Test',
      lastName: 'User',
      location: 'Test City',
      ...overrides,
    };

    createdEmails.add(email);
    return request(app).post('/api/auth/register').send(user);
  };

  beforeAll(async () => {
    await UserModel.deleteMany({ email: { $in: Array.from(createdEmails) } });
  });

  afterAll(async () => {
    await UserModel.deleteMany({ email: { $in: Array.from(createdEmails) } });
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const response = await registerUser();

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User Registered');
      expect(response.body).toHaveProperty('data');
    });

    test('should not register a new user with duplicate email', async () => {
      const email = makeUniqueEmail('duplicate');
      const user = {
        email,
        password: 'TestPassword@1234',
        confirmPassword: 'TestPassword@1234',
        firstName: 'Duplicate',
        lastName: 'User',
        location: 'Test City',
      };

      createdEmails.add(email);
      await request(app).post('/api/auth/register').send(user);
      const response = await request(app).post('/api/auth/register').send(user);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('success', false);
    });

    test('should not register a new user with invalid email', async () => {
      const response = await request(app).post('/api/auth/register').send({
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
      const response = await request(app).post('/api/auth/register').send({
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

      await registerUser({ email, password, confirmPassword: password, firstName: 'Login', lastName: 'User', location: 'Login City' });
      await UserModel.updateOne({ email }, { isVerified: true });

      const response = await request(app).post('/api/auth/login').send({ email, password });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
    });

    test('should not login with incorrect password', async () => {
      const email = makeUniqueEmail('loginwrong');
      const password = 'TestPassword@1234';
      createdEmails.add(email);

      await registerUser({ email, password, confirmPassword: password, firstName: 'Login', lastName: 'User', location: 'Login City' });
      await UserModel.updateOne({ email }, { isVerified: true });

      const response = await request(app).post('/api/auth/login').send({ email, password: 'WrongPassword!' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/reset-password/:token', () => {
    test('should not reset password with invalid token', async () => {
      const response = await request(app).post('/api/auth/reset-password/invalid-token').send({ newPassword: 'NewPassword@123' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    test('should reset password with valid token', async () => {
      const email = makeUniqueEmail('reset');
      const password = 'ResetPassword@1234';
      createdEmails.add(email);

      await registerUser({ email, password, confirmPassword: password, firstName: 'Reset', lastName: 'User', location: 'Reset City' });
      const resetUserDoc = await UserModel.findOne({ email });
      const token = jwt.sign({ id: resetUserDoc?._id }, JWT_SECRET, { expiresIn: '1h' });

      const response = await request(app).post(`/api/auth/reset-password/${token}`).send({ newPassword: 'NewPassword@123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    test('should login with new password after reset', async () => {
      const email = makeUniqueEmail('resetlogin');
      const password = 'ResetPassword@1234';
      createdEmails.add(email);

      await registerUser({ email, password, confirmPassword: password, firstName: 'Reset', lastName: 'User', location: 'Reset City' });
      const resetUserDoc = await UserModel.findOne({ email });
      const token = jwt.sign({ id: resetUserDoc?._id }, JWT_SECRET, { expiresIn: '1h' });
      await request(app).post(`/api/auth/reset-password/${token}`).send({ newPassword: 'NewPassword@123' });

      const response = await request(app).post('/api/auth/login').send({ email, password: 'NewPassword@123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
    });
  });
});
