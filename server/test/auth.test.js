import 'dotenv/config';
import request from 'supertest';
import { expect } from 'chai';
import app from '../index.js';
import { run as seed } from '../seed.js';

describe('Auth API', function () {
  this.timeout(20000);

  before(async () => {
    await seed();
  });

  it('POST /api/auth/login should return 400 for invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@example.com', password: 'wrong' });
    expect(res.status).to.equal(400);
  });

  it('POST /api/auth/login should return 200 and token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@example.com', password: 'password123' });
    expect(res.status).to.be.within(200, 299);
    expect(res.body).to.have.property('token');
  });
});
