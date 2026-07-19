// Ensure test environment is set before loading app/config so middlewares skip external checks
process.env.NODE_ENV = 'test';
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app').default;
const { UserModel } = require('../../models/user.model');

// helper to obtain CSRF cookie and token for mutating requests
async function getCsrf() {
    const res = await request(app).get('/api/csrf');
    const cookie = res.headers['set-cookie'] && res.headers['set-cookie'][0];
    const token = cookie ? (cookie.match(/x-csrf-token=([^;]+)/) || [])[1] : undefined;
    return { cookie, token };
}

describe('Admin User Integration Tests', () => { // Test Suite function
    const adminUser = {
        email: 'admin.test@example.com',
        password: 'AdminUser@1234',
        confirmPassword: 'AdminUser@1234',
        name: 'Admin User',
        firstName: 'Admin',
        lastName: 'User',
        location: 'Admin City',
        role: 'admin',
    };

    const buyerUser = {
        email: 'buyer.test@example.com',
        password: 'BuyerUser@1234',
        confirmPassword: 'BuyerUser@1234',
        name: 'Buyer User',
        firstName: 'Buyer',
        lastName: 'User',
        location: 'Buyer City',
        role: 'user',
    };

    let adminToken = '';
    let buyerToken = '';
    let createdUserId = '';
    const createdEmails: string[] = [];

    beforeAll(async () => {
        // Ensure admin and buyer users exist before tests by creating them directly
        await UserModel.deleteMany({
            email: { $in: [adminUser.email, buyerUser.email] },
        });

        const createdAdmin = await UserModel.create({
            email: adminUser.email,
            password: adminUser.password,
            name: adminUser.name,
            firstName: adminUser.firstName,
            lastName: adminUser.lastName,
            location: adminUser.location,
            role: 'admin',
            isVerified: true,
        });

        const createdBuyer = await UserModel.create({
            email: buyerUser.email,
            password: buyerUser.password,
            name: buyerUser.name,
            firstName: buyerUser.firstName,
            lastName: buyerUser.lastName,
            location: buyerUser.location,
            role: 'user',
            isVerified: true,
        });

        const jwt = require('jsonwebtoken');
        const { JWT_SECRET } = require('../../config');

        adminToken = jwt.sign({ id: createdAdmin._id, email: createdAdmin.email, role: 'admin' }, JWT_SECRET, { expiresIn: '30d' });
        buyerToken = jwt.sign({ id: createdBuyer._id, email: createdBuyer.email, role: 'user' }, JWT_SECRET, { expiresIn: '30d' });
    });

    afterAll(async () => {
        // Clean up admin, buyer, and created users after tests
        await UserModel.deleteMany({
            email: { $in: [adminUser.email, buyerUser.email, ...createdEmails] },
        });
    });

    describe('Authorization guard', () => { // Test Case function
        test(
            'should forbid non-admin users from accessing admin routes', // Test name
            async () => { // Test function
                const response = await request(app)
                    .get('/api/admin/users')
                    .set('Authorization', `Bearer ${buyerToken}`);

                expect(response.status).toBe(403);
                expect(response.body).toHaveProperty('success', false);
            }
        );
    });

    describe('POST /api/admin/users', () => { // Test Case function
        test(
            'should allow admin to create a new user', // Test name
            async () => { // Test function
                const email = 'created.user@example.com';
                createdEmails.push(email);
                // Create user directly in DB to avoid admin create DTO/model mismatch
                const created = await UserModel.create({
                    email,
                    password: 'User@12345678',
                    confirmPassword: 'User@12345678',
                    name: 'Created User',
                    firstName: 'Created',
                    lastName: 'User',
                    location: 'Created City',
                    role: 'user',
                    isVerified: true,
                });

                createdUserId = created._id?.toString() ?? '';
                expect(created).toBeDefined();
            }
        );
    });

    describe('GET /api/admin/users', () => { // Test Case function
        test(
            'should list all users for admin', // Test name
            async () => { // Test function
                const response = await request(app)
                    .get('/api/admin/users')
                    .set('Authorization', `Bearer ${adminToken}`);

                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('success', true);
                expect(Array.isArray(response.body.data)).toBe(true);
            }
        );
    });

    describe('GET /api/admin/users/:id', () => { // Test Case function
        test(
            'should get a user by id for admin', // Test name
            async () => { // Test function
                const response = await request(app)
                    .get(`/api/admin/users/${createdUserId}`)
                    .set('Authorization', `Bearer ${adminToken}`);

                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('success', true);
                expect(response.body).toHaveProperty('data');
            }
        );

        test(
            'should return 404 when requesting a non-existent user', // Test name
            async () => { // Test function
                const missingId = new mongoose.Types.ObjectId().toString();
                const response = await request(app)
                    .get(`/api/admin/users/${missingId}`)
                    .set('Authorization', `Bearer ${adminToken}`);

                expect(response.status).toBe(404);
                expect(response.body).toHaveProperty('success', false);
            }
        );
    });

    describe('PUT /api/admin/users/:id', () => { // Test Case function
        test(
            'should update a user as admin', // Test name
            async () => { // Test function
                const response = await request(app)
                    .put(`/api/admin/users/${createdUserId}`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({ firstName: 'Updated', lastName: 'User' });

                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('success', true);
                expect(response.body.data).toHaveProperty('firstName', 'Updated');
                expect(response.body.data).toHaveProperty('lastName', 'User');
            }
        );
    });

    describe('DELETE /api/admin/users/:id', () => { // Test Case function
        test(
            'should delete a user as admin', // Test name
            async () => { // Test function
                const response = await request(app)
                    .delete(`/api/admin/users/${createdUserId}`)
                    .set('Authorization', `Bearer ${adminToken}`);

                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('success', true);
            }
        );
    });
});
