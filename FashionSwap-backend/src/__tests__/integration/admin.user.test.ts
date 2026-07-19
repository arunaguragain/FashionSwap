import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app';
import { UserModel } from '../../models/user.model';

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
        location: 'Admin City',
        role: 'admin',
    };

    const buyerUser = {
        email: 'buyer.test@example.com',
        password: 'BuyerUser@1234',
        confirmPassword: 'BuyerUser@1234',
        name: 'Buyer User',
        location: 'Buyer City',
        role: 'user',
    };

    let adminToken = '';
    let buyerToken = '';
    let createdUserId = '';
    const createdEmails: string[] = [];

    beforeAll(async () => {
        // Ensure admin and buyer users exist before tests
        await UserModel.deleteMany({
            email: { $in: [adminUser.email, buyerUser.email] },
        });

        const { cookie, token } = await getCsrf();
        await request(app).post('/api/auth/register').set('Cookie', cookie || '').set('x-csrf-token', token || '').send(adminUser);
        await request(app).post('/api/auth/register').set('Cookie', cookie || '').set('x-csrf-token', token || '').send(buyerUser);

        // Make admin & verify both so login works
        await UserModel.updateOne({ email: adminUser.email }, { isVerified: true, role: 'admin' });
        await UserModel.updateOne({ email: buyerUser.email }, { isVerified: true });

        const { cookie: c1, token: t1 } = await getCsrf();
        const adminLogin = await request(app).post('/api/auth/login').set('Cookie', c1 || '').set('x-csrf-token', t1 || '').send({ email: adminUser.email, password: adminUser.password });

        const { cookie: c2, token: t2 } = await getCsrf();
        const buyerLogin = await request(app).post('/api/auth/login').set('Cookie', c2 || '').set('x-csrf-token', t2 || '').send({ email: buyerUser.email, password: buyerUser.password });

        adminToken = adminLogin.body.token;
        buyerToken = buyerLogin.body.token;
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

                const response = await request(app)
                    .post('/api/admin/users')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({
                        email,
                        password: 'User@1234',
                        confirmPassword: 'User@1234',
                        name: 'Created User',
                        role: 'buyer',
                    });

                createdUserId = response.body.data?._id ?? '';

                expect(response.status).toBe(201);
                expect(response.body).toHaveProperty('success', true);
                expect(response.body).toHaveProperty('data');
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
                    .send({ name: 'Updated User' });

                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('success', true);
                expect(response.body.data).toHaveProperty('name', 'Updated User');
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
