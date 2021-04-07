import { CreateStatementError } from './CreateStatementError';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository'
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository'
import { CreateStatementUseCase } from './CreateStatementUseCase'

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

describe('Create a Statement', () => {

  beforeAll(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it('should be able to create a new statement', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User', email: 'user@email.com', password: '1234'
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id!,
      amount: 123,
      type: 'deposit' as any,
      description: 'Deposit description'
    });

    expect(statement).toHaveProperty('id');
  });

  it('should not be able to create a new statement with an non-existing user', async () => {
    await expect(
      createStatementUseCase.execute({
        user_id: 'non-existing-user',
        amount: 123,
        type: 'deposit' as any,
        description: 'Deposit description'
      })
    ).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it('should not be able to create a new statement (withdraw) with insufficient funds', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User', email: 'user@email.com', password: '1234'
    });

    await expect(
      createStatementUseCase.execute({
        user_id: user.id as string,
        amount: 123,
        type: 'withdraw' as any,
        description: 'Withdraw description'
      })
    ).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

});
