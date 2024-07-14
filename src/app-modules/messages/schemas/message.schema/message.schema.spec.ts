import { MessageSchema } from './message.schema';

describe('MessageSchema', () => {
  it('should be defined', () => {
    expect(new MessageSchema()).toBeDefined();
  });
});
