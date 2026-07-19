import { connectDatabase } from '../database/mongodb';
import mongoose from 'mongoose';

beforeAll(async () => {
    const testPath = expect.getState?.().testPath as string | undefined;
    const isIntegrationTest = typeof testPath === 'string' && (testPath.includes('/integration/') || testPath.includes('\\integration\\'));
    if (!isIntegrationTest) {
        return;
    }
    await connectDatabase();
});

afterAll(async () => {
    const testPath = expect.getState?.().testPath as string | undefined;
    const isIntegrationTest = typeof testPath === 'string' && (testPath.includes('/integration/') || testPath.includes('\\integration\\'));
    if (!isIntegrationTest) {
        return;
    }
    await mongoose.connection.close();
});