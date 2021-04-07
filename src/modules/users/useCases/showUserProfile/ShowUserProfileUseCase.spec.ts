import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository'
import { ShowUserProfileError } from './ShowUserProfileError'
import { ShowUserProfileUseCase } from './ShowUserProfileUseCase'

let showUserProfileUseCase: ShowUserProfileUseCase;
let usersRepository: InMemoryUsersRepository;

describe('Show Profile', () => {

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
  })

  it('should be able to show an user profile', async () => {


    const user = await usersRepository.create({
      name: 'User profile test',
      email: 'user@email.com',
      password: '12345',
    })
    const user_id = user.id as string;

    const profile = await showUserProfileUseCase.execute(user_id);

    expect(profile).toHaveProperty('id');
  });

  it('should not be able to show profile from a non-existing user', async () => {
    await expect(async () => {
      await showUserProfileUseCase.execute('un-existing-user');
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });

})
