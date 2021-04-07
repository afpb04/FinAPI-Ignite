import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Authenticate user', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository,
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });
  it('should be able to authenticate an user', async () => {

    const user = await createUserUseCase.execute({
      name: 'Jon Doe',
      email: 'jondoe@exemple.com.br',
      password: '12345',
    });

    const response = await authenticateUserUseCase.execute({
      email: user.email,
      password: '12345',
    });

    expect(response).toHaveProperty('token');
  });
  it('should not be able to authenticate an nonexistent user', async () => {
    await expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'jon@exemple.com',
        password: '123456',
      });
    }).rejects.toBeInstanceOf(AppError);
  });
  it('should not be able to authenticate with incorrect password', async () => {
    await expect(async () => {
      const user = await createUserUseCase.execute({
        name: 'Jon Doe',
        email: 'jondoe@exemple.com',
        password: '1234',
      });

      await authenticateUserUseCase.execute({
        email: user.email,
        password: '12345',
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
