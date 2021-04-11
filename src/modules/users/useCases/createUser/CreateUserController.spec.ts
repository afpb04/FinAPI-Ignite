import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '../../../../app';

let connection: Connection;

describe('Create User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to crate a user', async () => {
    const response = await request(app).post('/api/v1/users').send({
      name: 'User Test',
      email: 'user123@email.com',
      password: '1234',
    });

    expect(response.status).toBe(201);
  });
});
