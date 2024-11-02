import { PasswordSchema } from './password.schema';

describe('PasswordSchema', () => {
  it('should be defined', () => {
    expect(new PasswordSchema()).toBeDefined();
  });
});
