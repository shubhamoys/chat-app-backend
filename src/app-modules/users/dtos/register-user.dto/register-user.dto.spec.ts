import { RegisterUserDTO } from './register-user.dto';

describe('RegisterUserDTO', () => {
  it('should be defined', () => {
    expect(new RegisterUserDTO()).toBeDefined();
  });
});
