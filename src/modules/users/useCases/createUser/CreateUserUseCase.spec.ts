import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";


let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe('Create User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });
  it('should be able to create a new user', async () => {
    const user = await createUserUseCase.execute({
      name: 'John Doe',
      email: 'admin@finapi.com',
      password: 'admin'
    });

    expect(user).toHaveProperty('id');
  });
  it('should not be able to create a new user with email already exists', async () => {
    await expect(async () => {
      await createUserUseCase.execute({
        name: 'John Doe',
        email: 'admin@finapi.com.br',
        password: 'admin'
      });

      await createUserUseCase.execute({
        name: 'John Doe',
        email: 'admin@finapi.com.br',
        password: 'admin'
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });


});
