import { PasswordDTO } from './password.dto';

describe('PasswordDTO', () => {
  it('should be defined', () => {
    expect(new PasswordDTO()).toBeDefined();
  });
});
