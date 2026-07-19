// This file runs before any test code is evaluated, setting up necessary global environment variables
// Ensure tests run with the proper environment so middlewares (captcha, rate-limit, etc.)
// that check NODE_ENV behave correctly.
process.env.NODE_ENV = 'test';
process.env.ENCRYPTION_KEY = '0000000000000000000000000000000000000000000000000000000000000000';
// backend CI trigger placeholder change

