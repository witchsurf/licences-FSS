import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import server from './server.js';
import Database from 'better-sqlite3';
import path from 'path';

// Use a separate test database or clean up after tests.
// For simplicity, we'll test against the running server instance but ideally we'd mock the DB or use a test DB.
// Since server.js initializes the DB at './fss.db', we should be careful.
// Ideally, we'd refactor server.js to accept a DB path configuration.
// For now, we will assume we can test against the logic.

describe('API Tests', () => {
    let adminCookie = '';

    it('should prevent login with wrong password', async () => {
        const res = await request(server)
            .post('/api/login')
            .send({ password: 'wrong' });
        expect(res.status).toBe(401);
    });

    it('should login with correct password', async () => {
        const res = await request(server)
            .post('/api/login')
            .send({ password: 'admin' }); // Default password
        expect(res.status).toBe(200);
        expect(res.headers['set-cookie']).toBeDefined();
        adminCookie = res.headers['set-cookie'][0];
    });

    it('should create a valid license', async () => {
        const newLicense = {
            firstName: 'Test',
            lastName: 'User',
            birthDate: '2000-01-01',
            nationality: 'Sénégalaise',
            address: 'Dakar',
            phone: '770000000',
            email: 'test@example.com',
            club: 'Ngor Surf Club',
            category: 'Senior',
            type: 'Loisir',
            issueDate: '2024-01-01',
            expirationDate: '2024-12-31',
            photoUrl: '/logo.png'
        };

        const res = await request(server)
            .post('/api/licenses')
            .set('Cookie', adminCookie)
            .send(newLicense);

        expect(res.status).toBe(201);
        expect(res.body.firstName).toBe('Test');
        expect(res.body.id).toBeDefined();
    });

    it('should reject invalid license data (Zod)', async () => {
        const invalidLicense = {
            firstName: '', // Epty
            lastName: 'User',
            // Missing fields
        };

        const res = await request(server)
            .post('/api/licenses')
            .set('Cookie', adminCookie)
            .send(invalidLicense);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Données invalides');
    });

    afterAll(() => {
        // Close the server if needed, though supertest handles it often. 
        // If server.js exports the server instance, we can close it.
        server.close();
    });
});
