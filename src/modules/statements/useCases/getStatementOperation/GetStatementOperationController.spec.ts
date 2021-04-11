import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection, createConnection } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { app } from '../../../../app';

let connection: Connection;



describe('GetStatementOperationController', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const password = await hash('1234', 8);
    const id = uuid();

    await connection.query(
      `INSERT INTO users(id, name, email, password, created_at, updated_at)
      VALUES('${id}', 'User Test', 'user@email.com', '${password}', 'now()', 'now()')
      `,
    );

  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to show the user statement', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user@email.com',
      password: '1234',
    });
    const { token } = responseToken.body;


    const deposit = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 300,
        description: 'deposit description',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { id } = deposit.body;
    const response = await request(app)
      .get(`/api/v1/statements/${id}`)
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(id);
  });

  it('should not be able to show a statement from a non-authorized user', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user@email.com',
      password: '1234',
    });
    const { token } = responseToken.body;


    const deposit = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 300,
        description: 'deposit description',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { id } = deposit.body;

    const response = await request(app)
      .get(`/api/v1/statements/${id}`)
      .send()
      .set({
        Authorization: '',
      });

    expect(response.status).toBe(401);
  });

  it('should not be able to show a non-existing user statement', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user@email.com',
      password: '1234',
    });
    const { token } = responseToken.body;

    const response = await request(app)
      .get(`/api/v1/statements/${uuid()}`)
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });



    expect(response.status).toBe(404);
  });
});
