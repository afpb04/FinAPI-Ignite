import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection, createConnection } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { app } from '../../../../app';

let connection: Connection;


describe('Create Statement Controller', () => {
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

  it('should be able to create a deposit statement', async () => {

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user1@email.com',
      password: '1234',
    });
    const { token } = responseToken.body;


    const response = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 500,
        description: 'Deposit description',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.amount).toBe(500);
  });

  it('should be able to create a withdraw statement', async () => {

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user1@email.com',
      password: '1234',
    });
    const { token } = responseToken.body;

    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 300,
        description: 'Withdraw description',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.amount).toBe(300);
  });

  it('should not be able to create a withdraw statement whiteout funds', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user1@email.com',
      password: '1234',
    });
    const { token } = responseToken.body;
    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 300,
        description: 'Withdraw description',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });
});
