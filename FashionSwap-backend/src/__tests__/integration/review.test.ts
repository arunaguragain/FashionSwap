import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app';
import { UserModel } from '../../models/user.model';
import { ReviewModel } from '../../models/review.model';

describe('Review Integration Tests', () => {
    const userA = {
        email: 'reviewa@gmail.com',
        password: 'ReviewerA@1234',
        confirmPassword: 'ReviewerA@1234',
        firstName: 'Reviewer',
        lastName: 'A',
        location: 'Test City',
    };

    const userB = {
        email: 'reviewb@gmail.com',
        password: 'ReviewerB@1234',
        confirmPassword: 'ReviewerB@1234',
        firstName: 'Reviewer',
        lastName: 'B',
        location: 'Test City',
    };

    let tokenA = '';
    let tokenB = '';
    let userAId = '';
    let baseReviewId = '';

    beforeAll(async () => {
        await UserModel.deleteMany({ email: { $in: [userA.email, userB.email] } });

        await request(app).post('/api/auth/register').send(userA);
        await request(app).post('/api/auth/register').send(userB);

        // Verify both users so login works
        await UserModel.updateMany({ email: { $in: [userA.email, userB.email] } }, { isVerified: true });

        const loginA = await request(app).post('/api/auth/login').send({ email: userA.email, password: userA.password });
        const loginB = await request(app).post('/api/auth/login').send({ email: userB.email, password: userB.password });

        tokenA = loginA.body.token;
        tokenB = loginB.body.token;

        const userDoc = await UserModel.findOne({ email: userA.email });
        userAId = userDoc?._id.toString() ?? '';

        const createRes = await request(app)
            .post('/api/reviews')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ rating: 4, comment: 'Initial review for tests', reviewerRole: 'buyer' });

        baseReviewId = createRes.body.data?._id ?? '';
        if (!baseReviewId) throw new Error('Failed to create base review for tests');
    });

    afterAll(async () => {
        if (userAId) await ReviewModel.deleteMany({ userId: userAId });
        await UserModel.deleteMany({ email: { $in: [userA.email, userB.email] } });
    });

    test('auth guard rejects unauthenticated access', async () => {
        const res = await request(app).get('/api/reviews');
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('success', false);
    });

    test('should reject creation with invalid data', async () => {
        const res = await request(app)
            .post('/api/reviews')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({});

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('success', false);
    });

    test('should create a review successfully', async () => {
        const res = await request(app)
            .post('/api/reviews')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ rating: 5, comment: 'Great work', reviewerRole: 'buyer' });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('data');
    });

    test('GET /api/reviews returns reviews', async () => {
        const res = await request(app).get('/api/reviews').set('Authorization', `Bearer ${tokenA}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('GET /api/reviews/my returns user reviews', async () => {
        const res = await request(app).get('/api/reviews/my').set('Authorization', `Bearer ${tokenA}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('GET /api/reviews/:id returns a review by id', async () => {
        const res = await request(app).get(`/api/reviews/${baseReviewId}`).set('Authorization', `Bearer ${tokenA}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('data');
    });

    test('should update a review by owner', async () => {
        const res = await request(app)
            .put(`/api/reviews/${baseReviewId}`)
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ comment: 'Updated comment' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('comment', 'Updated comment');
    });

    test('should forbid updating a review by non-owner', async () => {
        const res = await request(app)
            .put(`/api/reviews/${baseReviewId}`)
            .set('Authorization', `Bearer ${tokenB}`)
            .send({ comment: 'Malicious update' });

        expect(res.status).toBe(403);
        expect(res.body).toHaveProperty('success', false);
    });

    test('should delete a review by owner', async () => {
        const createRes = await request(app)
            .post('/api/reviews')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ rating: 3, comment: 'To be deleted', reviewerRole: 'buyer' });

        const createdId = createRes.body.data?._id;

        const res = await request(app)
            .delete(`/api/reviews/${createdId}`)
            .set('Authorization', `Bearer ${tokenA}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success', true);
    });

    test('should forbid deleting a review by non-owner', async () => {
        // create a review by user A and attempt delete by user B
        const createRes = await request(app)
            .post('/api/reviews')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ rating: 2, comment: 'Owner only', reviewerRole: 'buyer' });

        const createdId = createRes.body.data?._id;

        const res = await request(app)
            .delete(`/api/reviews/${createdId}`)
            .set('Authorization', `Bearer ${tokenB}`);

        expect(res.status).toBe(403);
        expect(res.body).toHaveProperty('success', false);
    });
});
