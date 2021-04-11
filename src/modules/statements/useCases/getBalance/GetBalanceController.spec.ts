import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection, createConnection } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { app } from '../../../../app';

let connection: Connection;


describe('Get Balance Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
    const id = uuid();

    const password = await hash('1234', 8);

    await connection.query(
      `INSERT INTO users(id, name, email, password, created_at, updated_at)
      VALUES('${id}', 'User Test', 'user1@email.com', '${password}', 'now()', 'now()')
      `,
    );

  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to show the user balance', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user1@email.com',
      password: '1234',
    });
    const { token } = responseToken.body;
    const response = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body).toHaveProperty('balance');
  });

  it('should not be able to show the balance of a non-existent user', async () => {
    const response = await request(app)
      .get('/api/v1/statements/balance')
      .set({ Authorization: '' });

    expect(response.status).toBe(401);
  });
});
