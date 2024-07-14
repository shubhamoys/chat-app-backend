import { EmailSchema } from './email.schema';

describe('EmailSchema', () => {
  it('should be defined', () => {
    expect(new EmailSchema()).toBeDefined();
  });
});
